import express from "express";
import prisma from "../prisma.js";
import { requireAdmin, requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit, deleteFile } from "../utils/helpers.js";

const router = express.Router();

// ─── Admin Stats ───────────────────────────────────────────────

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalArticles, totalTools, purchases, recentPurchases] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.article.count({ where: { publishedAt: { not: null } } }),
      prisma.package.count({ where: { published: true } }),
      prisma.purchase.findMany({ where: { status: "APPROVED" }, select: { amount: true, createdAt: true } }),
      prisma.purchase.findMany({
        where: { status: "APPROVED" },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyRevenue: Record<string, number> = {};
    recentPurchases.forEach(p => {
      const month = monthNames[new Date(p.createdAt).getMonth()];
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
    });

    const revenueChart = monthNames.map(name => ({ name, total: monthlyRevenue[name] || 0 })).filter(d => d.total > 0);

    const allUsers = await prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 200 });
    const monthlyUsers: Record<string, number> = {};
    allUsers.forEach(u => {
      const month = monthNames[new Date(u.createdAt).getMonth()];
      monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
    });
    const usersChart = monthNames.map(name => ({ name, total: monthlyUsers[name] || 0 })).filter(d => d.total > 0);

    const pendingPurchases = await prisma.purchase.count({ where: { status: "PENDING" } });

    res.json({
      totalUsers,
      totalCourses,
      totalArticles,
      totalTools,
      totalRevenue,
      pendingPurchases,
      revenueChart: revenueChart.length > 0 ? revenueChart : monthNames.slice(0, 7).map(name => ({ name, total: 0 })),
      usersChart: usersChart.length > 0 ? usersChart : monthNames.slice(0, 7).map(name => ({ name, total: 0 })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── User Management ───────────────────────────────────────────

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { doctorProfile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["USER", "DOCTOR", "ADMIN", "SPECIALIST", "SUPERVISOR"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Super Admin Check (hardcoded email)
    const isSuperAdmin = res.locals.user.email === "admin@psychoclub.space";

    if (targetUser.role === "ADMIN" && !isSuperAdmin && res.locals.user.userId !== targetUser.id) {
      return res.status(403).json({ error: "Only super admin can modify other admins" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });

    if (["DOCTOR", "SPECIALIST", "SUPERVISOR"].includes(role)) {
      const defaultTitle = role === "SPECIALIST" ? "معالج مختص" : role === "SUPERVISOR" ? "مشرف محتوى" : "طبيب";
      await prisma.doctor.upsert({
        where: { userId: targetUser.id },
        update: { title: defaultTitle },
        create: {
          userId: targetUser.id,
          title: defaultTitle,
          specialties: "[]",
          canWriteArticles: true,
          canWriteCourses: role !== "SUPERVISOR",
          canManageSlots: role !== "SUPERVISOR"
        }
      });
    }

    await logAudit(res.locals.user.userId, "CHANGE_ROLE", "User", req.params.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/users/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status }
    });
    await logAudit(res.locals.user.userId, "CHANGE_STATUS", "User", req.params.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Financial Reports (Purchases) ─────────────────────────────

router.get("/purchases", requireAdmin, async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/purchases/:id/approve", requireAdmin, async (req, res) => {
  try {
    const purchase = await prisma.purchase.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" }
    });
    await logAudit(res.locals.user.userId, "APPROVE_PURCHASE", "Purchase", purchase.id);
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: "Error approving purchase" });
  }
});

router.post("/purchases/:id/reject", requireAdmin, async (req, res) => {
  try {
    const purchase = await prisma.purchase.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" }
    });
    await logAudit(res.locals.user.userId, "REJECT_PURCHASE", "Purchase", purchase.id);
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: "Error rejecting purchase" });
  }
});

// ─── Booking Management ────────────────────────────────────────

router.get("/bookings", requireAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        doctor: { include: { user: { select: { name: true } } } },
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

router.post("/bookings/:id/approve", requireAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CONFIRMED", paymentStatus: "APPROVED" }
    });
    await logAudit(res.locals.user.userId, "APPROVE_BOOKING", "Booking", booking.id);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Error approving booking" });
  }
});

router.post("/bookings/:id/reject", requireAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED", paymentStatus: "REJECTED" }
    });
    // Release the slot
    if (booking.slotId) {
      await prisma.availableSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      });
    }
    await logAudit(res.locals.user.userId, "REJECT_BOOKING", "Booking", booking.id);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Error rejecting booking" });
  }
});

// ─── Educational Packages Management ───────────────────────────

router.get("/packages", requireAdmin, async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      include: { files: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/packages", requireAdmin, async (req, res) => {
  try {
    const { title, description, price, coverImage } = req.body;
    const pkg = await prisma.package.create({
      data: { title, description, price: parseFloat(price) || 0, coverImage, published: true }
    });
    await logAudit(res.locals.user.userId, "CREATE_PACKAGE", "Package", pkg.id);
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: "Error creating package" });
  }
});

router.put("/packages/:id", requireAdmin, async (req, res) => {
  try {
    const { title, description, price, coverImage } = req.body;
    const pkg = await prisma.package.update({
      where: { id: req.params.id },
      data: { title, description, price: parseFloat(price) || 0, coverImage }
    });
    await logAudit(res.locals.user.userId, "UPDATE_PACKAGE", "Package", pkg.id);
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: "Error updating package" });
  }
});

router.delete("/packages/:id", requireAdmin, async (req, res) => {
  try {
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id }, include: { files: true } });
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    // Cleanup files
    deleteFile(pkg.coverImage);
    for (const f of pkg.files) {
      deleteFile(f.fileUrl);
    }

    await prisma.package.delete({ where: { id: req.params.id } });
    await logAudit(res.locals.user.userId, "DELETE_PACKAGE", "Package", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting package" });
  }
});

// ─── Package Files Management ──────────────────────────────────

router.post("/packages/:packageId/files", requireAdmin, async (req, res) => {
  try {
    const { title, fileName, fileUrl } = req.body;
    const count = await prisma.packageFile.count({ where: { packageId: req.params.packageId } });
    const file = await prisma.packageFile.create({
      data: { packageId: req.params.packageId, title, fileName, fileUrl, order: count }
    });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Error adding file" });
  }
});

router.put("/packages/:packageId/files/:fileId", requireAdmin, async (req, res) => {
  try {
    const { title, fileName, fileUrl } = req.body;
    const file = await prisma.packageFile.update({
      where: { id: req.params.fileId },
      data: { title, fileName, fileUrl }
    });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Error updating file" });
  }
});

router.delete("/packages/:packageId/files/:fileId", requireAdmin, async (req, res) => {
  try {
    const file = await prisma.packageFile.findUnique({ where: { id: req.params.fileId } });
    if (file) deleteFile(file.fileUrl);
    await prisma.packageFile.delete({ where: { id: req.params.fileId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting file" });
  }
});

// ─── Forum Management ──────────────────────────────────────────

router.post("/forum/categories", requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const cat = await prisma.forumCategory.create({ data: { name } });
    await logAudit(res.locals.user.userId, "CREATE_FORUM_CAT", "ForumCategory", cat.id);
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: "Error creating category" });
  }
});

router.delete("/forum/categories/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.forumCategory.delete({ where: { id: req.params.id } });
    await logAudit(res.locals.user.userId, "DELETE_FORUM_CAT", "ForumCategory", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting category" });
  }
});

// ─── Permission Management ─────────────────────────────────────

router.post("/doctors/:id/permissions", requireAdmin, async (req, res) => {
  try {
    const { canWriteArticles, canWriteCourses, canManageSlots } = req.body;
    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: { canWriteArticles, canWriteCourses, canManageSlots }
    });
    await logAudit(res.locals.user.userId, "UPDATE_PERMISSIONS", "Doctor", req.params.id);
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── System Maintenance ────────────────────────────────────────

router.post("/clear-data", requireAdmin, async (req, res) => {
  try {
    await prisma.courseLesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.article.deleteMany();
    await prisma.packageFile.deleteMany();
    await prisma.package.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.thread.deleteMany();
    await logAudit(res.locals.user.userId, "CLEAR_DATA", "System");
    res.json({ success: true, message: "Data cleared safely" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/audit-log", requireAdmin, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
