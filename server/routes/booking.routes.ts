import express from "express";
import prisma from "../prisma.js";
import { requireAuth, requireAdmin, requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit } from "../utils/helpers.js";

const router = express.Router();

// ─── Public Doctors Directory ──────────────────────────────────

router.get("/doctors", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        user: {
          status: "ACTIVE",
          role: { in: ["DOCTOR", "SPECIALIST"] }
        }
      },
      include: {
        user: { select: { name: true, avatar: true } },
        _count: { select: { reviews: true } }
      }
    });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/doctors/:id", async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, avatar: true } },
        slots: {
          where: { isBooked: false, startAt: { gte: new Date() } },
          orderBy: { startAt: 'asc' }
        },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

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

// ─── Checkout Logic ────────────────────────────────────────────

router.post("/checkout/manual", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const { itemId, type, paymentMethod, payerPhone } = req.body;

    let amount = 0;
    if (type === 'COURSE') {
      const course = await prisma.course.findUnique({ where: { id: itemId } });
      if (!course) return res.status(404).json({ error: "Course not found" });
      amount = course.price;
    } else if (type === 'PACKAGE') {
      const pkg = await prisma.package.findUnique({ where: { id: itemId } });
      if (!pkg) return res.status(404).json({ error: "Package not found" });
      amount = pkg.price || 0;
    } else {
      return res.status(400).json({ error: "Invalid purchase type" });
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId, type, itemId, amount,
        status: "PENDING", paymentMethod, payerPhone,
        currency: "EGP"
      }
    });

    await logAudit(userId, "MANUAL_CHECKOUT", "Purchase", purchase.id);
    res.json({ success: true, purchaseId: purchase.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

router.post("/checkout/free", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const { itemId, type } = req.body;

    const course = await prisma.course.findUnique({ where: { id: itemId } });
    if (!course || !course.isFree) return res.status(400).json({ error: "Not a free course" });

    const purchase = await prisma.purchase.create({
      data: {
        userId, type, itemId, amount: 0,
        status: "APPROVED", paymentMethod: "FREE",
        currency: "EGP"
      }
    });

    await logAudit(userId, "FREE_CHECKOUT", "Purchase", purchase.id);
    res.json({ success: true, purchaseId: purchase.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

export default router;
