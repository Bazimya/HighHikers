import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Schema
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

// Trail Schema
export interface ITrail extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  difficulty: string;
  distance: string;
  elevation: string;
  duration: string;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  images?: Array<{ url: string; caption?: string }>;
  featured?: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const trailSchema = new Schema<ITrail>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    distance: { type: String, required: true },
    elevation: { type: String, required: true },
    duration: { type: String, required: true },
    location: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    imageUrl: { type: String, required: true },
    images: [{ url: String, caption: String }],
    featured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Trail = mongoose.model<ITrail>('Trail', trailSchema);

// Event Schema
export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  difficulty: string;
  maxParticipants?: number;
  currentParticipants: number;
  imageUrl: string;
  featured?: boolean;
  averageRating: number;
  reviewCount: number;
  isPaid?: boolean;
  price?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    difficulty: { type: String, required: true },
    maxParticipants: Number,
    currentParticipants: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    price: Number,
    currency: { type: String, default: 'RWF' },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);

// Blog Post Schema
export interface IBlogPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  featured?: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    imageUrl: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: String,
    tags: [String],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);

// Event Registration Schema
export interface IEventRegistration extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: 'registered' | 'cancelled';
  paymentId?: mongoose.Types.ObjectId;
  registeredAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['registered', 'cancelled'], default: 'registered' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    registeredAt: { type: Date, default: Date.now },
  }
);

export const EventRegistration = mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);

// Payment Schema
export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'RWF' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paidAt: Date,
    refundedAt: Date,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

// Trail Review Schema
export interface ITrailReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  trailId: mongoose.Types.ObjectId;
  rating: number;
  reviewText: string;
  createdAt: Date;
}

const trailReviewSchema = new Schema<ITrailReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trailId: { type: Schema.Types.ObjectId, ref: 'Trail', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
  },
  { timestamps: true }
);

export const TrailReview = mongoose.model<ITrailReview>('TrailReview', trailReviewSchema);

// Photo Gallery Schema
export interface IPhotoGallery extends Document {
  _id: mongoose.Types.ObjectId;
  trailId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  caption?: string;
  uploadedAt: Date;
}

const photoGallerySchema = new Schema<IPhotoGallery>(
  {
    trailId: { type: Schema.Types.ObjectId, ref: 'Trail' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    caption: String,
  },
  { timestamps: true }
);

export const PhotoGallery = mongoose.model<IPhotoGallery>('PhotoGallery', photoGallerySchema);

// Activity Log Schema
export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

// Contact Message Schema
export interface IContactMessage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);

// Zod validation schemas
export const userRegisterSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const trailCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  difficulty: z.string(),
  distance: z.string(),
  elevation: z.string(),
  duration: z.string(),
  location: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrl: z.string(),
});

export const eventCreateSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  difficulty: z.string(),
  maxParticipants: z.number().optional(),
  imageUrl: z.string(),
});

export const reviewCreateSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10),
});

// Type exports for client use
export type UserType = IUser;
export type TrailType = ITrail;
export type Trail = ITrail; // Legacy alias
export type EventType = IEvent;
export type Event = IEvent; // Legacy alias
export type BlogPostType = IBlogPost;
export type BlogPost = IBlogPost; // Legacy alias
export type TrailReviewType = ITrailReview;
export type TrailRegistration = IEventRegistration;
export type EventRegistration = IEventRegistration;

// Contact Message export
export interface IContactMessage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: Date;
}

export type InsertContactMessage = Omit<IContactMessage, '_id' | 'status' | 'createdAt'> & { status?: 'new' | 'read' | 'responded' };
