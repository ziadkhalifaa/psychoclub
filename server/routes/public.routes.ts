import express from "express";
import prisma from "../prisma.js";

const router = express.Router();

// Public: dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [courses, users, articles] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.article.count()
    ]);
    res.json({ courses, users, articles });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Any other global public endpoints can go here

export default router;
