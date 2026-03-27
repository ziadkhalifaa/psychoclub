import express from "express";
import prisma from "../prisma.js";
import { requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit } from "../utils/helpers.js";

const router = express.Router();

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

    const updated = await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        bio,
        specialties: typeof specialties === 'string' ? specialties : JSON.stringify(specialties || []),
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
