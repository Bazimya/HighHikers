import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import mongoose from "mongoose";
import Stripe from "stripe";
import {
  User,
  Trail,
  Event,
  BlogPost,
  ContactMessage,
  TrailReview,
  EventReview,
  EventRegistration,
  EventSuggestion,
  PhotoGallery,
  ActivityLog,
  Payment,
  Newsletter,
  OTP,
  userRegisterSchema,
  trailCreateSchema,
  eventCreateSchema,
  reviewCreateSchema,
} from "@shared/schema";
import { AuthRequest, requireAuth, requireAdmin, optionalAuth } from "./middleware";
import { findUserByUsername, findUserByEmail, createUser, verifyPassword, hashPassword, findUserById } from "./auth";
import { sendEmail, getTrailNotificationEmail, getEventNotificationEmail, getBlogNotificationEmail, getEventSuggestionApprovedEmail, getEventSuggestionRejectedEmail, getOTPEmail } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
  });

  // Apply optional auth middleware to all routes
  app.use(optionalAuth);

  // ==================== AUTH ROUTES ====================
  app.post("/api/auth/register", async (req: AuthRequest, res) => {
    try {
      const data = req.body;
      
      // Basic validation
      if (!data.username || !data.email || !data.password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const existingUser = await findUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await findUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const newUser = await createUser({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Send OTP for email verification
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

        await OTP.create({
          email: data.email,
          code: otp,
          expiresAt,
        });

        console.log(`[Registration] 🔐 OTP Code for ${data.email}: ${otp}`); // Show in dev mode

        const emailContent = getOTPEmail(otp);
        await sendEmail({
          to: data.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`[Registration] ✅ OTP sent to ${data.email}`);
      } catch (emailError) {
        console.error("[Registration] ⚠️  Failed to send OTP:", emailError instanceof Error ? emailError.message : emailError);
        // Don't fail registration if email fails
      }

      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        message: "Account created! Please check your email for verification code.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/send-otp", async (req: AuthRequest, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

      // Delete any existing OTPs for this email
      await OTP.deleteMany({ email });

      // Create new OTP
      await OTP.create({
        email,
        code: otp,
        expiresAt,
      });

      // Send OTP email
      try {
        const emailContent = getOTPEmail(otp);
        await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`[Email] ✅ OTP sent to ${email}`);
      } catch (emailError) {
        console.error("[Email] ⚠️  Failed to send OTP email:", emailError instanceof Error ? emailError.message : emailError);
        // Still succeed - OTP is created, user can verify with email or we're in dev mode
      }

      return res.json({ message: "OTP sent to your email. Check spam folder if not received." });
    } catch (error) {
      console.error("Send OTP error:", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Failed to create OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req: AuthRequest, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        req.session!.userId = user._id.toString();
        return res.json({ message: "Email already verified", user: { id: user._id, username: user.username, email: user.email } });
      }

      // Find valid OTP
      const otp = await OTP.findOne({
        email,
        code,
        expiresAt: { $gt: new Date() },
      });

      if (!otp) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Mark email as verified
      user.emailVerified = true;
      await user.save();

      // Delete used OTP
      await OTP.deleteOne({ _id: otp._id });

      // Auto-login user
      req.session!.userId = user._id.toString();

      return res.json({
        message: "Email verified successfully!",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/login", async (req: AuthRequest, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session!.userId = user._id.toString();

      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: AuthRequest, res) => {
    req.session?.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.user);
  });

  // ==================== TRAILS ROUTES ====================
  app.get("/api/trails", async (req, res) => {
    try {
      const allTrails = await Trail.find();
      res.json(allTrails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trails" });
    }
  });

  app.get("/api/trails/:id", async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid trail ID" });
      }

      const trail = await Trail.findById(req.params.id);
      if (!trail) {
        return res.status(404).json({ error: "Trail not found" });
      }

      const reviews = await TrailReview.find({ trailId: req.params.id }).populate("userId", "username avatar");
      const images = await PhotoGallery.find({ trailId: req.params.id });

      res.json({
        ...trail.toObject(),
        reviews,
        images,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trail" });
    }
  });

  app.post("/api/trails", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = trailCreateSchema.parse(req.body);
      const newTrail = new Trail(validatedData);
      await newTrail.save();
      
      // Notify newsletter subscribers
      (async () => {
        try {
          const subscribers = await Newsletter.find({ subscribed: true });
          if (subscribers.length > 0) {
            const emails = subscribers.map(s => s.email);
            const emailTemplate = getTrailNotificationEmail(
              newTrail.name,
              newTrail.description,
              `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trails/${newTrail._id}`
            );
            
            await sendEmail({
              to: emails,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text,
            });
            
            console.log(`[Newsletter] Sent trail notification to ${emails.length} subscribers`);
          }
        } catch (emailError) {
          console.error('[Newsletter] Failed to send trail notification:', emailError);
        }
      })();
      
      res.status(201).json(newTrail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trail data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create trail" });
    }
  });

  app.put("/api/trails/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid trail ID" });
      }

      const validatedData = trailCreateSchema.parse(req.body);
      const updated = await Trail.findByIdAndUpdate(req.params.id, validatedData, { new: true });
      
      if (!updated) {
        return res.status(404).json({ error: "Trail not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trail data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update trail" });
    }
  });

  app.delete("/api/trails/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid trail ID" });
      }

      const deleted = await Trail.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Trail not found" });
      }
      res.json({ message: "Trail deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trail" });
    }
  });

  // ==================== TRAIL REVIEWS ====================
  app.post("/api/trails/:id/reviews", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid trail ID" });
      }

      // Validate data
      try {
        var validatedData = reviewCreateSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const errorMessages = validationError.errors
            .map(e => {
              if (e.code === 'too_small') {
                return `${e.path[0]} must be at least ${e.minimum} characters`;
              }
              return `${e.path[0]}: ${e.message}`;
            })
            .join(", ");
          return res.status(400).json({ error: "Invalid review data: " + errorMessages });
        }
        throw validationError;
      }
      
      const review = new TrailReview({
        ...validatedData,
        trailId: req.params.id,
        userId: req.user!._id,
      });
      await review.save();

      // Update trail average rating
      const allReviews = await TrailReview.find({ trailId: req.params.id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Trail.findByIdAndUpdate(req.params.id, {
        averageRating: avgRating,
        reviewCount: allReviews.length,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Review creation error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/trails/:id/reviews", async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid trail ID" });
      }

      const reviews = await TrailReview.find({ trailId: req.params.id }).populate("userId", "username avatar");
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // ==================== TRAIL REGISTRATION ====================
  app.post("/api/trails/:id/register", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid trail ID" });
      }

      const trail = await Trail.findById(req.params.id);
      if (!trail) {
        return res.status(404).json({ error: "Trail not found" });
      }

      res.status(201).json({ message: "Registered for trail", trailId: req.params.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to register for trail" });
    }
  });

  app.get("/api/user/trail-registrations/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Check if user is registered for this trail
      const exists = true; // Simplified - in production, query a registration collection
      res.json({ registered: exists });
    } catch (error) {
      res.status(500).json({ error: "Failed to check registration" });
    }
  });

  // ==================== EVENTS ROUTES ====================
  app.get("/api/events", async (req, res) => {
    try {
      const allEvents = await Event.find();
      res.json(allEvents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const registrations = await EventRegistration.find({ eventId: req.params.id }).populate("userId", "username");
      const images = await PhotoGallery.find({ eventId: req.params.id });

      res.json({
        ...event.toObject(),
        registrations,
        images,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = eventCreateSchema.parse(req.body);
      const newEvent = new Event(validatedData);
      await newEvent.save();
      
      // Notify newsletter subscribers
      (async () => {
        try {
          const subscribers = await Newsletter.find({ subscribed: true });
          if (subscribers.length > 0) {
            const emails = subscribers.map(s => s.email);
            const emailTemplate = getEventNotificationEmail(
              newEvent.title,
              newEvent.description,
              `${newEvent.date} at ${newEvent.time}`,
              `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${newEvent._id}`
            );
            
            await sendEmail({
              to: emails,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text,
            });
            
            console.log(`[Newsletter] Sent event notification to ${emails.length} subscribers`);
          }
        } catch (emailError) {
          console.error('[Newsletter] Failed to send event notification:', emailError);
        }
      })();
      
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("[Backend] Event creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid event data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create event", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/events/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const validatedData = eventCreateSchema.parse(req.body);
      const updated = await Event.findByIdAndUpdate(req.params.id, validatedData, { new: true });
      
      if (!updated) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid event data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const deleted = await Event.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ message: "Event deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // ==================== EVENT REVIEWS ====================
  app.post("/api/events/:id/reviews", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      // Validate data
      try {
        var validatedData = reviewCreateSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const errorMessages = validationError.errors
            .map(e => {
              if (e.code === 'too_small') {
                return `${e.path[0]} must be at least ${e.minimum} characters`;
              }
              return `${e.path[0]}: ${e.message}`;
            })
            .join(", ");
          return res.status(400).json({ error: "Invalid review data: " + errorMessages });
        }
        throw validationError;
      }
      
      const review = new EventReview({
        ...validatedData,
        eventId: req.params.id,
        userId: req.user!._id,
      });
      await review.save();

      // Update event average rating
      const allReviews = await EventReview.find({ eventId: req.params.id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Event.findByIdAndUpdate(req.params.id, {
        averageRating: avgRating,
        reviewCount: allReviews.length,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Event review creation error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/events/:id/reviews", async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const reviews = await EventReview.find({ eventId: req.params.id })
        .sort({ createdAt: -1 });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // ==================== EVENT REGISTRATIONS ====================
  app.post("/api/events/:id/register", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        return res.status(400).json({ error: "Event is full" });
      }

      const existing = await EventRegistration.findOne({
        userId: req.user!._id,
        eventId: req.params.id,
      });

      if (existing) {
        return res.status(400).json({ error: "Already registered for this event" });
      }

      const registration = new EventRegistration({
        userId: req.user!._id,
        eventId: req.params.id,
      });
      await registration.save();

      event.currentParticipants += 1;
      await event.save();

      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/events/:id/unregister", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const deleted = await EventRegistration.findOneAndDelete({
        userId: req.user!._id,
        eventId: req.params.id,
      });

      if (!deleted) {
        return res.status(404).json({ error: "Registration not found" });
      }

      const event = await Event.findById(req.params.id);
      if (event) {
        event.currentParticipants = Math.max(0, event.currentParticipants - 1);
        await event.save();
      }

      res.json({ message: "Unregistered" });
    } catch (error) {
      res.status(500).json({ error: "Failed to unregister" });
    }
  });

  app.get("/api/user/event-registrations", requireAuth, async (req: AuthRequest, res) => {
    try {
      const registrations = await EventRegistration.find({ userId: req.user!._id }).populate("eventId");
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // ==================== EVENT SUGGESTIONS ====================
  app.post("/api/event-suggestions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, location, difficulty, date, time, maxParticipants, description, imageUrl, isPaid, price, currency } = req.body;

      // Basic validation
      if (!title || !location || !description || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const suggestion = new EventSuggestion({
        userId: req.user!._id,
        title,
        location,
        difficulty,
        date,
        time,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        description,
        imageUrl,
        isPaid: isPaid || false,
        price: price ? parseFloat(price) : undefined,
        currency: currency || "RWF",
        status: "pending",
      });

      await suggestion.save();
      res.status(201).json(suggestion);
    } catch (error) {
      console.error("Event suggestion error:", error);
      res.status(500).json({ error: "Failed to submit suggestion" });
    }
  });

  app.get("/api/admin/event-suggestions", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const suggestions = await EventSuggestion.find()
        .populate("userId", "username email")
        .sort({ createdAt: -1 });
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.put("/api/admin/event-suggestions/:id/approve", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid suggestion ID" });
      }

      const suggestion = await EventSuggestion.findById(req.params.id).populate("userId");
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }

      // Create event from suggestion
      const event = new Event({
        title: suggestion.title,
        location: suggestion.location,
        difficulty: suggestion.difficulty,
        date: suggestion.date,
        time: suggestion.time,
        maxParticipants: suggestion.maxParticipants,
        description: suggestion.description,
        imageUrl: suggestion.imageUrl,
        isPaid: suggestion.isPaid,
        price: suggestion.price,
        currency: suggestion.currency,
        currentParticipants: 0,
        averageRating: 0,
        reviewCount: 0,
      });

      await event.save();

      // Update suggestion status
      suggestion.status = "approved";
      await suggestion.save();

      // Send approval email to user
      try {
        const user = suggestion.userId as any;
        if (user && user.email) {
          const eventUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/events/${event._id}`;
          const emailContent = getEventSuggestionApprovedEmail(
            suggestion.title,
            suggestion.description,
            suggestion.date,
            eventUrl
          );
          await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
          console.log(`[Email] Approval notification sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error("[Email] Failed to send approval notification:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ message: "Event created from suggestion", event });
    } catch (error) {
      console.error("Approval error:", error);
      res.status(500).json({ error: "Failed to approve suggestion" });
    }
  });

  app.put("/api/admin/event-suggestions/:id/reject", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid suggestion ID" });
      }

      const { reason } = req.body;

      const suggestion = await EventSuggestion.findById(req.params.id).populate("userId");
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }

      // Update suggestion status
      suggestion.status = "rejected";
      suggestion.rejectionReason = reason || "";
      await suggestion.save();

      // Send rejection email to user
      try {
        const user = suggestion.userId as any;
        if (user && user.email) {
          const emailContent = getEventSuggestionRejectedEmail(suggestion.title, reason);
          await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
          console.log(`[Email] Rejection notification sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error("[Email] Failed to send rejection notification:", emailError);
        // Don't fail the request if email fails
      }

      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject suggestion" });
    }
  });

  // ==================== BLOG ROUTES ====================
  app.get("/api/blog", optionalAuth, async (req: AuthRequest, res) => {
    try {
      // If admin, return all posts; otherwise only published
      const filter = req.user?.role === "admin" ? {} : { published: true };
      const posts = await BlogPost.find(filter).sort({ createdAt: -1 }).populate("author", "username");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", optionalAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const post = await BlogPost.findById(req.params.id).populate("author", "username");
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Check if user can view this post (admin or published)
      if (!post.published && req.user?.role !== "admin") {
        return res.status(403).json({ error: "This blog post is not published yet" });
      }

      // Get related posts from same category (only published ones for non-admins)
      const relatedFilter = req.user?.role === "admin" 
        ? { category: post.category, _id: { $ne: req.params.id } }
        : { category: post.category, _id: { $ne: req.params.id }, published: true };
      
      const related = await BlogPost.find(relatedFilter)
        .limit(3)
        .populate("author", "username");

      res.json({
        ...post.toObject(),
        related,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const slug = req.body.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const newPost = new BlogPost({
        ...req.body,
        slug,
        author: req.user!._id,
        published: req.body.published ?? false,
      });
      await newPost.save();
      
      // Notify newsletter subscribers only if published
      if (newPost.published) {
        (async () => {
          try {
            const subscribers = await Newsletter.find({ subscribed: true });
            if (subscribers.length > 0) {
              const emails = subscribers.map(s => s.email);
              const emailTemplate = getBlogNotificationEmail(
                newPost.title,
                newPost.excerpt || newPost.content.substring(0, 150),
                `${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog/${newPost.slug}`
              );
              
              await sendEmail({
                to: emails,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
              });
              
              console.log(`[Newsletter] Sent blog notification to ${emails.length} subscribers`);
            }
          } catch (emailError) {
            console.error('[Newsletter] Failed to send blog notification:', emailError);
          }
        })();
      }
      
      res.status(201).json(newPost);
    } catch (error: any) {
      console.error("Blog creation error:", error);
      
      // Handle duplicate key error (E11000)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({ 
          error: `A blog post with this ${field} already exists. Please use a different title.` 
        });
      }
      
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.put("/api/blog/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      if (!updated) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const deleted = await BlogPost.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json({ message: "Blog post deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // ==================== CONTACT ROUTES ====================
  app.post("/api/contact", async (req: AuthRequest, res) => {
    try {
      const message = new ContactMessage(req.body);
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/contact/messages", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ==================== NEWSLETTER ROUTES ====================
  app.post("/api/newsletter/subscribe", async (req: AuthRequest, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Check if already subscribed
      let subscription = await Newsletter.findOne({ email: email.toLowerCase() });
      
      if (subscription) {
        // Resubscribe if previously unsubscribed
        subscription.subscribed = true;
        subscription.subscribedAt = new Date();
        subscription.unsubscribedAt = undefined;
        await subscription.save();
      } else {
        // Create new subscription
        subscription = await Newsletter.create({
          email: email.toLowerCase(),
          subscribed: true,
          subscribedAt: new Date(),
        });
      }
      
      console.log(`[Newsletter] New subscription: ${email}`);
      
      res.status(200).json({ 
        message: "Successfully subscribed to newsletter",
        email 
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });

  // Unsubscribe from newsletter
  app.post("/api/newsletter/unsubscribe", async (req: AuthRequest, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          subscribed: false,
          unsubscribedAt: new Date(),
        }
      );
      
      console.log(`[Newsletter] Unsubscribed: ${email}`);
      
      res.status(200).json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      res.status(500).json({ error: "Failed to unsubscribe from newsletter" });
    }
  });


  // ==================== USER PROFILE ROUTES ====================
  app.get("/api/user/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await findUserById(req.user!._id.toString());
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { passwordHash, ...userWithoutPassword } = user.toObject();
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/user/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const allowed = ["firstName", "lastName", "bio", "avatar"];
      const updateData: any = {};
      
      for (const key of allowed) {
        if (key in req.body) {
          updateData[key] = req.body[key];
        }
      }

      const updated = await User.findByIdAndUpdate(req.user!._id, updateData, { new: true });

      if (updated) {
        const { passwordHash, ...userWithoutPassword } = updated.toObject();
        return res.json(userWithoutPassword);
      }

      res.status(404).json({ error: "User not found" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // ==================== ADMIN ROUTES ====================
  app.get("/api/admin/users", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allUsers = await User.find().select("-passwordHash");
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/role", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { role } = req.body;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");

      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Prevent admins from deleting themselves
      if (req.user?._id.toString() === req.params.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Optional: Also delete user's data (suggestions, registrations, reviews, etc.)
      await EventSuggestion.deleteMany({ userId: req.params.id });
      await EventRegistration.deleteMany({ userId: req.params.id });
      await TrailReview.deleteMany({ userId: req.params.id });
      await EventReview.deleteMany({ userId: req.params.id });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ==================== PAYMENT ROUTES ====================
  // Create payment intent for event registration
  app.post("/api/payments/create-intent", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { eventId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (!event.isPaid || !event.price) {
        return res.status(400).json({ error: "This event is not a paid event" });
      }

      // Check if user already registered
      const existingRegistration = await EventRegistration.findOne({
        userId: req.user!._id,
        eventId,
        status: "registered",
      });

      if (existingRegistration) {
        return res.status(400).json({ error: "Already registered for this event" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(event.price * 100), // Convert to cents
        currency: (event.currency || "rwf").toLowerCase(),
        metadata: {
          eventId: eventId.toString(),
          userId: req.user!._id.toString(),
          eventTitle: event.title,
        },
      });

      // Create payment record
      const payment = new Payment({
        userId: req.user!._id,
        eventId,
        amount: event.price,
        currency: event.currency || "RWF",
        status: "pending",
        stripePaymentIntentId: paymentIntent.id,
      });

      await payment.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        amount: event.price,
        currency: event.currency || "RWF",
      });
    } catch (error) {
      console.error("Payment intent error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Confirm payment and complete registration
  app.post("/api/payments/confirm", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { paymentId, paymentIntentId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Verify payment status with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        payment.status = "failed";
        await payment.save();
        return res.status(400).json({ error: "Payment not successful" });
      }

      // Update payment record
      payment.status = "completed";
      payment.stripeChargeId = (paymentIntent as any).charges?.data[0]?.id;
      payment.paidAt = new Date();
      await payment.save();

      // Create event registration
      const registration = new EventRegistration({
        userId: payment.userId,
        eventId: payment.eventId,
        status: "registered",
        paymentId: payment._id,
      });
      await registration.save();

      // Update event participant count
      const event = await Event.findById(payment.eventId);
      if (event) {
        event.currentParticipants = (event.currentParticipants || 0) + 1;
        await event.save();
      }

      res.json({ message: "Payment confirmed and registered for event", registration });
    } catch (error) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Get payment status
  app.get("/api/payments/:paymentId", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.paymentId)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const payment = await Payment.findById(req.params.paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      if (payment.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });

  // List user payments (for receipts/history)
  app.get("/api/payments", requireAuth, async (req: AuthRequest, res) => {
    try {
      const payments = await Payment.find({ userId: req.user!._id }).sort({ createdAt: -1 });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
