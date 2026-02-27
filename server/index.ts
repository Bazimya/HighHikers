import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { connectDB } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// ============== ENVIRONMENT VALIDATION ==============
function validateEnvironment() {
  const required = [
    'MONGODB_URI',
    'SESSION_SECRET',
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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ============== CORS MIDDLEWARE - Production Safe ==============
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

// ============== SESSION MIDDLEWARE - Production Ready ==============
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/high-hikers",
      touchAfter: 24 * 3600, // lazy session update (in seconds)
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB first
  await connectDB();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
