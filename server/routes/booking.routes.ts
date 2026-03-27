import express from "express";
import prisma from "../prisma.js";
import { requireAuth, requireAdmin, requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit } from "../utils/helpers.js";

const router = express.Router();

// Booking Logic (Public endpoints removed, migrated to doctor.routes.ts)

// ─── Booking Logic ─────────────────────────────────────────────

router.post("/book", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const { slotId, notes } = req.body;

    const slot = await prisma.availableSlot.findUnique({
      where: { id: slotId },
      include: { doctor: true }
    });

    if (!slot || slot.isBooked) return res.status(400).json({ error: "Slot unavailable" });

    const booking = await prisma.booking.create({
      data: {
        userId,
        doctorId: slot.doctorId,
        slotId,
        amount: slot.doctor.sessionPrice || 0,
        status: "PENDING",
        paymentStatus: "PENDING",
        notes
      }
    });

    await prisma.availableSlot.update({
      where: { id: slotId },
      data: { isBooked: true }
    });

    await logAudit(userId, "CREATE_BOOKING", "Booking", booking.id);
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: res.locals.user.userId },
      include: {
        doctor: { include: { user: { select: { name: true, avatar: true } } } },
        slot: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Review Logic ──────────────────────────────────────────────

router.post("/reviews", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const { doctorId, rating, comment } = req.body;

    const review = await prisma.review.create({
      data: { userId, doctorId, rating: parseFloat(rating), comment }
    });

    // Update doctor average rating
    const allReviews = await prisma.review.findMany({ where: { doctorId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { rating: avgRating }
    });

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Review failed" });
  }
});

// Checkout logic moved to purchase.routes.ts

export default router;
