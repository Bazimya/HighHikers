import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { findUserById } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: mongoose.Types.ObjectId;
        id?: string;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export type AuthRequest = Request;

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    try {
      const user = await findUserById(req.session.userId);
      if (user) {
        req.user = {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role || "user",
        };
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  }
  next();
}
