# 🔧 DEPLOYMENT FIXES - Implementation Guide

This document contains all the code fixes organized by priority.

## CRITICAL FIX #1: CORS Configuration

**File:** `server/index.ts`

Replace the CORS middleware (lines 12-21) with:

```typescript
// CORS middleware - Production-safe
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.FRONTEND_URL || "https://yourdomain.com";
  }
  return ["http://localhost:5173", "http://localhost:5000"];
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  if (Array.isArray(allowedOrigins)) {
    if (allowedOrigins.includes(origin || "")) {
      res.header("Access-Control-Allow-Origin", origin);
    }
  } else if (origin === allowedOrigins) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});
```

---

## CRITICAL FIX #2: Session Persistence

**Step 1:** Install package
```bash
npm install connect-mongo
```

**File:** `server/index.ts`

Add import after existing imports:
```typescript
import MongoStore from "connect-mongo";
```

Replace session middleware (lines 28-40) with:

```typescript
// Session middleware - Production-ready with MongoDB persistence
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/high-hikers",
      touchAfter: 24 * 3600, // lazy session update (in seconds)
      crypto: {
        secret: process.env.SESSION_CRYPTO_SECRET || "crypto-secret-key",
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);
```

---

## CRITICAL FIX #3: TypeScript Errors

**Fix #3A: Stripe API Version**

**File:** `server/routes.ts` (line 31)

Change:
```typescript
// FROM:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18",
});

// TO:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-16",
});
```

---

**Fix #3B: AuthRequest Session Type**

**File:** `server/middleware.ts` (lines 10-22)

Change entire interface to:

```typescript
export interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    id?: string;
    username: string;
    email: string;
    role: string;
  };
  session?: Express.Session; // ✅ Make optional with proper type
}

declare global {
  namespace Express {
    interface Session {
      userId?: string;
    }
  }
}
```

---

**Fix #3C: BlogPost Schema - Add Missing Properties**

**File:** `shared/schema.ts` (around line 159)

Update the IBlogPost interface:

```typescript
export interface IBlogPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  author: mongoose.Types.ObjectId;
  authorName?: string;
  authorAvatar?: string;
  published: boolean;
  publishedAt?: Date;
  readTime?: number;
  imageUrl?: string;
  images?: Array<{ url: string; caption?: string }>;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    category: String,
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: String,
    authorAvatar: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
    readTime: Number,
    imageUrl: String,
    images: [{ url: String, caption: String }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
```

---

## CRITICAL FIX #4: Environment Variable Validation

**File:** `server/index.ts` (add after imports, before app setup)

```typescript
// ============== ENVIRONMENT VALIDATION ==============
function validateEnvironment() {
  const required = [
    'MONGODB_URI',
    'SESSION_SECRET',
    'SESSION_CRYPTO_SECRET',
    'STRIPE_SECRET_KEY',
    'NODE_ENV',
  ];
  
  const productionRequired = [
    'FRONTEND_URL',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ];
  
  const missing: string[] = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (process.env.NODE_ENV === 'production') {
    productionRequired.forEach(key => {
      if (!process.env[key]) {
        missing.push(key);
      }
    });
  }
  
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing environment variables:', missing);
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables verified');
}

// Call validation at startup
validateEnvironment();
```

---

## CRITICAL FIX #5: Production Build Configuration

**File:** `vite.config.ts`

Update base and build sections:

```typescript
export default defineConfig({
  base: process.env.NODE_ENV === "production" 
    ? (process.env.VITE_BASE_PATH || "/")
    : "/",
  
  plugins: [
    // ... existing plugins
  ],
  
  resolve: {
    // ... existing aliases
  },
  
  root: path.resolve(import.meta.dirname, "client"),
  
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: false, // ✅ Don't delete dist/index.js (server)
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
```

---

## HIGH PRIORITY FIX #6: Security Middleware

**Step 1:** Install packages
```bash
npm install helmet xss-clean express-rate-limit
npm install --save-dev @types/express-rate-limit
```

**File:** `server/index.ts` (add imports after existing imports)

```typescript
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
```

**File:** `server/index.ts` (add after validateEnvironment() call, before app.use(express.json()))

```typescript
// ============== SECURITY MIDDLEWARE ==============

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 mins
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

// Apply general rate limiting
app.use("/api/", generalLimiter);

// Apply strict rate limiting to auth endpoints
app.post("/api/auth/login", authLimiter, ...); // Will add handler after
app.post("/api/auth/register", authLimiter, ...); // Will add handler after

// Security headers
app.use(helmet());

// Sanitize data against XSS attacks
app.use(xss());

// Parse JSON/URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

**IMPORTANT:** Move the rate limiters to the auth routes, wrap them:

**File:** `server/routes.ts` (update login and register routes)

Add to the route registration:

```typescript
// ==================== AUTH ROUTES ====================
app.post("/api/auth/register", authLimiter, async (req: AuthRequest, res) => {
  // ... existing code
});

app.post("/api/auth/login", authLimiter, async (req: AuthRequest, res) => {
  // ... existing code
});
```

---

## HIGH PRIORITY FIX #7: Standardized Error Handling

**File:** Create new file `server/utils/errors.ts`

```typescript
import { Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function formatErrorResponse(error: any) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      ...(error.details && { details: error.details }),
      code: error.statusCode,
    };
  }
  
  if (error instanceof ZodError) {
    return {
      error: "Validation error",
      details: error.errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
        code: e.code,
      })),
      code: 400,
    };
  }
  
  console.error("Unhandled error:", error);
  return {
    error: "Internal server error",
    code: 500,
  };
}

export function sendError(res: Response, error: any) {
  const formatted = formatErrorResponse(error);
  res.status(formatted.code).json(formatted);
}
```

**File:** `server/index.ts` (replace error handler at end)

```typescript
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const formatted = formatErrorResponse(err);
  res.status(formatted.code).json(formatted);
});
```

---

## HIGH PRIORITY FIX #8: Contact Form Validation

**File:** `shared/schema.ts` (add to schemas)

```typescript
export const contactCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});
```

**File:** `server/routes.ts` (update contact route)

```typescript
import { contactCreateSchema } from "@shared/schema";

// ==================== CONTACT ROUTES ====================
app.post("/api/contact", async (req: AuthRequest, res) => {
  try {
    const validated = contactCreateSchema.parse(req.body);
    const message = new ContactMessage(validated);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid contact data",
        details: error.errors 
      });
    }
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});
```

---

## HIGH PRIORITY FIX #9: Production Environment File

**File:** Create `.env.production` (or update `.env`)

```bash
# Production Environment
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/high-hikers

# Sessions
SESSION_SECRET=<generate-long-random-string>
SESSION_CRYPTO_SECRET=<generate-another-random-string>

# Server
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Email (SendGrid recommended for production)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Optional
LOG_LEVEL=error
VITE_BASE_PATH=/
```

---

## MEDIUM PRIORITY FIX #10: Logging Setup

**Step 1:** Install package
```bash
npm install winston
npm install --save-dev @types/winston
```

**File:** Create new file `server/logger.ts`

```typescript
import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || path.resolve(import.meta.dirname, '../logs');

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'high-hikers-api' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
```

---

## Installation Summary

Run all fixes with:

```bash
# 1. Install new dependencies
npm install connect-mongo helmet xss-clean express-rate-limit winston

# 2. Update package types
npm install --save-dev @types/express-rate-limit @types/winston

# 3. Remove unused dependencies (optional but recommended)
npm uninstall drizzle-orm drizzle-kit pg connect-pg-simple passport-local

# 4. TypeScript check
npm run check

# 5. Test build
npm run build

# 6. Test start
npm start
```

---

## Testing Checklist After Fixes

- [ ] `npm run check` - No TypeScript errors
- [ ] `npm run build` - Build succeeds
- [ ] `npm run dev` - Dev server starts
- [ ] Login works with CORS
- [ ] Session persists after server restart (test locally)
- [ ] API rate limiting works (try 6 login attempts)
- [ ] Error messages are consistent format
- [ ] Contact form validates input
- [ ] Environment validation catches missing vars

---

## Deployment After Fixes

```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export SESSION_SECRET=<long-random>
export STRIPE_SECRET_KEY=sk_live_...
etc.

# Build and deploy
npm install --production
npm run build
npm start
```
