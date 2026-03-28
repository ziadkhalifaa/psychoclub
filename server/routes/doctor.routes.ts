import express from "express";
import prisma from "../prisma.js";
import { requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit, deleteFile } from "../utils/helpers.js";

const router = express.Router();

// ─── Public Doctors Directory (Moved here) ─────────────────────

router.get("/", async (req, res) => {
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

router.get("/:id", async (req, res) => {
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

router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { doctorId: req.params.id },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireDoctorOrAdmin, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: res.locals.user.userId },
      include: { user: { select: { name: true, email: true, avatar: true } } }
    });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/portfolio", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { bio, specialties, title, photo, sessionPrice, sessionLink } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Delete old photo if it changed
    if (photo && doctor.photo && photo !== doctor.photo) {
      deleteFile(doctor.photo);
    }

    const updated = await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        bio,
        specialties: Array.isArray(specialties) ? specialties : (specialties ? specialties.split(',').map((s: string) => s.trim()) : []),
        title, photo, sessionPrice: parseFloat(sessionPrice) || 0, sessionLink
      }
    });
    await logAudit(res.locals.user.userId, "UPDATE_PORTFOLIO", "Doctor", updated.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

router.get("/slots", requireDoctorOrAdmin, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const slots = await prisma.availableSlot.findMany({
      where: { doctorId: doctor.id },
      orderBy: { startAt: 'asc' }
    });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/slots", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { startAt, endAt } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const slot = await prisma.availableSlot.create({
      data: {
        doctorId: doctor.id,
        startAt: new Date(startAt),
        endAt: new Date(endAt)
      }
    });
    await logAudit(res.locals.user.userId, "CREATE_SLOT", "AvailableSlot", slot.id);
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Slot creation failed" });
  }
});

router.delete("/slots/:id", requireDoctorOrAdmin, async (req, res) => {
  try {
    await prisma.availableSlot.delete({ where: { id: req.params.id } });
    await logAudit(res.locals.user.userId, "DELETE_SLOT", "AvailableSlot", req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Deletion failed" });
  }
});

export default router;
