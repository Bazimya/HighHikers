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
  EventRegistration,
  PhotoGallery,
  ActivityLog,
  Payment,
  userRegisterSchema,
  trailCreateSchema,
  eventCreateSchema,
  reviewCreateSchema,
} from "@shared/schema";
import { AuthRequest, requireAuth, requireAdmin, optionalAuth } from "./middleware";
import { findUserByUsername, findUserByEmail, createUser, verifyPassword, hashPassword, findUserById } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18",
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

      req.session!.userId = newUser.id.toString();

      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Registration failed" });
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
    req.session!.destroy((err) => {
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

      const validatedData = reviewCreateSchema.parse(req.body);
      
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
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

  // ==================== BLOG ROUTES ====================
  app.get("/api/blog", async (req, res) => {
    try {
      // If admin, return all posts; otherwise only published
      const filter = req.user?.role === "admin" ? {} : { published: true };
      const posts = await BlogPost.find(filter).sort({ createdAt: -1 }).populate("author", "username");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const post = await BlogPost.findById(req.params.id).populate("author", "username");
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Get related posts from same category
      const related = await BlogPost.find({ category: post.category, _id: { $ne: req.params.id } })
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

      // For now, just store in a simple collection or log it
      // In production, you'd integrate with a service like Mailchimp or SendGrid
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
      payment.stripeChargeId = paymentIntent.charges.data[0]?.id;
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
