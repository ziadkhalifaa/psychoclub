import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../utils/helpers.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// ─── Auth ──────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashedPassword, phone, role: "USER" }
    });
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'lax' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration failed or email/phone exists" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'lax' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        purchases: { where: { status: 'APPROVED' } },
        doctorProfile: true
      }
    });
    if (!user) return res.json({ user: null });
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
      purchases: user.purchases
    });
  } catch (err) {
    res.json({ user: null });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, avatar, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: res.locals.user.userId },
      data: { name, avatar, phone }
    });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: res.locals.user.userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: "Current password incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });
    await logAudit(user.id, "CHANGE_PASSWORD", "User", user.id);
    res.json({ message: "تم تحديث كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
