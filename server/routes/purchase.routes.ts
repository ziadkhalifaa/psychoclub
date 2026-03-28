import express from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../utils/helpers.js";

const router = express.Router();

/**
 * Get current user's purchases (Courses and Packages)
 */
router.get("/purchases/my", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Handle manual checkout for Courses/Packages
 */
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

/**
 * Handle free checkout for Courses
 */
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

/**
 * Retry a rejected purchase payment
 */
router.post("/purchases/:id/retry", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const { paymentMethod, payerPhone } = req.body;
    
    const purchase = await prisma.purchase.findUnique({ where: { id: req.params.id } });
    if (!purchase || purchase.userId !== userId) return res.status(404).json({ error: "Purchase not found" });

    const updated = await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "PENDING", paymentMethod, payerPhone }
    });

    await logAudit(userId, "RETRY_PURCHASE", "Purchase", purchase.id);
    res.json({ success: true, purchase: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Retry failed" });
  }
});

export default router;
