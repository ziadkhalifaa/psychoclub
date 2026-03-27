import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string, email: string };
    res.locals.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string, email: string };
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.locals.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireDoctorOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string, email: string };
    if (decoded.role !== "ADMIN" && decoded.role !== "DOCTOR" && decoded.role !== "SPECIALIST" && decoded.role !== "SUPERVISOR") {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.locals.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
