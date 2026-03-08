import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API routes
  const apiRouter = express.Router();

  // ─── Multer Setup for File Uploads ──────────────────────────────
  const multer = await import("multer");
  const path = await import("path");
  const fs = await import("fs");

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer.default({ storage });

  // Serve uploads statically with specific headers to prevent auto-downloads
  app.use("/uploads", express.static(uploadDir, {
    setHeaders: (res, filePath) => {
      // Force inline display instead of attachment/download
      res.setHeader("Content-Disposition", "inline");

      const ext = path.extname(filePath).toLowerCase();
      // Explicitly set correct Content-Type so the browser attempts to render it
      if (ext === '.pdf') {
        res.setHeader("Content-Type", "application/pdf");
      } else if (ext === '.mp4') {
        res.setHeader("Content-Type", "video/mp4");
      } else if (ext === '.webm') {
        res.setHeader("Content-Type", "video/webm");
      }
    }
  }));

  // Upload endpoint
  apiRouter.post("/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Server error during upload" });
    }
  });

  // ─── Middlewares ────────────────────────────────────────────────

  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const token = req.cookies.token;
      if (!token) { res.status(401).json({ error: "Not authenticated" }); return; }
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
      res.locals.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const token = req.cookies.token;
      if (!token) { res.status(401).json({ error: "Not authenticated" }); return; }
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
      if (decoded.role !== "ADMIN") { res.status(403).json({ error: "Forbidden" }); return; }
      res.locals.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const requireDoctorOrAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const token = req.cookies.token;
      if (!token) { res.status(401).json({ error: "Not authenticated" }); return; }
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
      if (decoded.role !== "ADMIN" && decoded.role !== "DOCTOR") { res.status(403).json({ error: "Forbidden" }); return; }
      res.locals.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Helper: log audit action
  const logAudit = async (actorId: string | null, action: string, entityType: string, entityId?: string) => {
    try {
      await prisma.auditLog.create({ data: { actorId, action, entityType, entityId } });
    } catch (e) { /* silent */ }
  };

  // ─── Auth ──────────────────────────────────────────────────────

  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email already exists" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, passwordHash, phone },
      });

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      if (user.status !== "ACTIVE") {
        return res.status(403).json({ error: "هذا الحساب موقوف حالياً، الرجاء التواصل مع الإدارة" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  apiRouter.get("/auth/me", async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: "Not authenticated" });

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.status(401).json({ error: "User not found" });

      const purchases = await prisma.purchase.findMany({ where: { userId: user.id } });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar
        },
        purchases
      });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  apiRouter.get("/purchases/my", requireAuth, async (req, res) => {
    try {
      const purchases = await prisma.purchase.findMany({ where: { userId: res.locals.user.userId } });
      res.json(purchases);
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.put("/auth/profile", requireAuth, async (req, res) => {
    try {
      const { name, email, phone, avatar } = req.body;
      const userId = res.locals.user.userId;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { name, email, phone, avatar },
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "خطأ في تحديث البيانات" });
    }
  });

  apiRouter.put("/auth/password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = res.locals.user.userId;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "خطأ في تغيير كلمة المرور" });
    }
  });

  // ─── Admin Stats (Dynamic) ────────────────────────────────────

  apiRouter.get("/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [totalUsers, totalCourses, totalArticles, totalTools, purchases, recentPurchases] = await Promise.all([
        prisma.user.count(),
        prisma.course.count({ where: { published: true } }),
        prisma.article.count({ where: { publishedAt: { not: null } } }),
        prisma.interactiveTool.count({ where: { published: true } }),
        prisma.purchase.findMany({ where: { status: "APPROVED" }, select: { amount: true, createdAt: true } }),
        prisma.purchase.findMany({
          where: { status: "APPROVED" },
          select: { amount: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
      ]);

      const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

      // Monthly revenue for chart
      const monthlyRevenue: Record<string, number> = {};
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      recentPurchases.forEach(p => {
        const month = monthNames[new Date(p.createdAt).getMonth()];
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
      });

      const revenueChart = monthNames.map(name => ({ name, total: monthlyRevenue[name] || 0 })).filter(d => d.total > 0);

      // Monthly user registrations
      const allUsers = await prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 200 });
      const monthlyUsers: Record<string, number> = {};
      allUsers.forEach(u => {
        const month = monthNames[new Date(u.createdAt).getMonth()];
        monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
      });
      const usersChart = monthNames.map(name => ({ name, total: monthlyUsers[name] || 0 })).filter(d => d.total > 0);

      // Pending purchases count
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

  // ─── Doctor Stats (Dynamic) ───────────────────────────────────

  apiRouter.get("/doctor/stats", requireDoctorOrAdmin, async (req, res) => {
    try {
      const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const [coursesCount, articlesCount, slotsCount, bookingsCount] = await Promise.all([
        prisma.course.count({ where: { instructorId: doctor.id } }),
        prisma.article.count({ where: { authorId: doctor.id } }),
        prisma.availableSlot.count({ where: { doctorId: doctor.id } }),
        prisma.booking.count({ where: { doctorId: doctor.id } }),
      ]);

      // Calculate earnings from course purchases
      const doctorCourses = await prisma.course.findMany({ where: { instructorId: doctor.id }, select: { id: true } });
      const courseIds = doctorCourses.map(c => c.id);
      const earnings = await prisma.purchase.findMany({
        where: { itemId: { in: courseIds }, status: "APPROVED", type: "COURSE" },
        select: { amount: true, createdAt: true },
      });
      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

      // Monthly earnings
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const monthlyEarnings: Record<string, number> = {};
      earnings.forEach(e => {
        const month = monthNames[new Date(e.createdAt).getMonth()];
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + e.amount;
      });
      const earningsChart = monthNames.map(name => ({ name, total: monthlyEarnings[name] || 0 })).filter(d => d.total > 0);

      res.json({
        coursesCount,
        articlesCount,
        slotsCount,
        bookingsCount,
        totalEarnings,
        earningsChart: earningsChart.length > 0 ? earningsChart : monthNames.slice(0, 7).map(name => ({ name, total: 0 })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Courses ──────────────────────────────────────────────────

  apiRouter.get("/courses", async (req, res) => {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        instructor: { include: { user: { select: { name: true } } } },
        lessons: { orderBy: { order: 'asc' } }
      }
    });
    res.json(courses);
  });

  apiRouter.post("/courses", requireDoctorOrAdmin, async (req, res) => {
    try {
      const { title, description, price, isFree, duration, category, level, thumbnail, lessons, whatYouLearn, requirements } = req.body;

      let doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });

      if (res.locals.user.role === "DOCTOR") {
        if (!doctor || !doctor.canWriteCourses) {
          return res.status(403).json({ error: "لا تملك صلاحية إضافة دورات" });
        }
      } else if (res.locals.user.role === "ADMIN") {
        if (!doctor) {
          doctor = await prisma.doctor.create({
            data: {
              userId: res.locals.user.userId,
              specialties: "[]",
              title: "Admin Instructor",
              canWriteCourses: true
            }
          });
        }
      }

      const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

      const course = await prisma.course.create({
        data: {
          title, slug, description,
          price: isFree ? 0 : parseFloat(price),
          isFree: isFree || false,
          duration,
          category: category || "عام",
          level: level || "مبتدئ",
          thumbnail,
          whatYouLearn: whatYouLearn ? whatYouLearn.split('\n').filter((s: string) => s.trim()).join('|') : null,
          requirements: requirements ? requirements.split('\n').filter((s: string) => s.trim()).join('|') : null,
          instructorId: doctor!.id,
          published: true,
          lessons: {
            create: (lessons || []).map((l: any, i: number) => ({
              title: l.title,
              type: l.type || "video",
              resourceUrl: l.resourceUrl || "",
              duration: l.duration || null,
              content: l.content || null,
              order: i
            }))
          }
        }
      });

      await logAudit(res.locals.user.userId, "CREATE_COURSE", "Course", course.id);
      res.json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.get("/courses/:slug", async (req, res) => {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        instructor: { include: { user: { select: { name: true } } } },
        lessons: { orderBy: { order: 'asc' } }
      }
    });
    if (!course) { res.status(404).json({ error: "Not found" }); return; }
    res.json(course);
  });

  apiRouter.get("/courses/:slug/learn", requireAuth, async (req, res) => {
    try {
      const userId = res.locals.user.userId;
      const role = res.locals.user.role;
      const slug = req.params.slug;

      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          instructor: { include: { user: { select: { name: true } } } },
          lessons: { orderBy: { order: 'asc' } }
        }
      });

      if (!course) return res.status(404).json({ error: "Course not found" });

      // Check access
      if (role !== "ADMIN") {
        const purchase = await prisma.purchase.findFirst({
          where: { userId, itemId: course.id, type: "COURSE", status: "APPROVED" }
        });
        if (!purchase) {
          return res.status(403).json({ error: "You don't have access to this course" });
        }
      }

      // Fetch progress
      const progress = await prisma.courseProgress.findMany({
        where: { userId, courseId: course.id }
      });

      res.json({ course, progress });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/courses/progress", requireAuth, async (req, res) => {
    try {
      const userId = res.locals.user.userId;
      const { courseId, lessonId, completed } = req.body;

      const progress = await prisma.courseProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completed, courseId },
        create: { userId, courseId, lessonId, completed }
      });

      res.json({ success: true, progress });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.put("/courses/:id", requireDoctorOrAdmin, async (req, res) => {
    try {
      const { title, description, price, isFree, duration, category, level, thumbnail, lessons, whatYouLearn, requirements } = req.body;
      const courseId = req.params.id;

      // ── 1. Update course metadata ─────────────────────────────
      const course = await prisma.course.update({
        where: { id: courseId },
        data: {
          title, description,
          price: isFree ? 0 : parseFloat(price),
          isFree: isFree || false,
          duration, category, level, thumbnail,
          whatYouLearn: whatYouLearn !== undefined ? (whatYouLearn ? whatYouLearn.split('\n').filter((s: string) => s.trim()).join('|') : null) : undefined,
          requirements: requirements !== undefined ? (requirements ? requirements.split('\n').filter((s: string) => s.trim()).join('|') : null) : undefined,
        }
      });

      // ── 2. Sync curriculum (smart upsert) ─────────────────────
      if (Array.isArray(lessons)) {
        // IDs of lessons the admin kept (lessons that already existed)
        const keptIds = (lessons as any[]).filter(l => l.id).map(l => l.id as string);

        // Find lesson IDs currently in DB that are no longer in the form
        const existingLessons = await prisma.courseLesson.findMany({
          where: { courseId },
          select: { id: true }
        });
        const removedIds = existingLessons.map(l => l.id).filter(id => !keptIds.includes(id));

        if (removedIds.length > 0) {
          // Delete progress rows first to satisfy FK constraints
          await prisma.courseProgress.deleteMany({ where: { lessonId: { in: removedIds } } });
          await prisma.courseLesson.deleteMany({ where: { id: { in: removedIds } } });
        }

        // Upsert remaining / new lessons
        for (let i = 0; i < (lessons as any[]).length; i++) {
          const l = (lessons as any[])[i];
          if (l.id) {
            // Update existing lesson
            await prisma.courseLesson.update({
              where: { id: l.id },
              data: {
                title: l.title,
                type: l.type || 'video',
                resourceUrl: l.resourceUrl || '',
                duration: l.duration || null,
                content: l.content || null,
                order: i,
              }
            });
          } else {
            // Create new lesson
            await prisma.courseLesson.create({
              data: {
                courseId,
                title: l.title,
                type: l.type || 'video',
                resourceUrl: l.resourceUrl || '',
                duration: l.duration || null,
                content: l.content || null,
                order: i,
              }
            });
          }
        }
      }

      await logAudit(res.locals.user.userId, "UPDATE_COURSE", "Course", course.id);
      res.json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.delete("/courses/:id", requireDoctorOrAdmin, async (req, res) => {
    try {
      // Delete related lessons first
      await prisma.courseLesson.deleteMany({ where: { courseId: req.params.id } });
      await prisma.course.delete({ where: { id: req.params.id } });
      await logAudit(res.locals.user.userId, "DELETE_COURSE", "Course", req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Article Categories & Tags ────────────────────────────────

  apiRouter.get("/article-categories", async (req, res) => {
    try {
      const cats = await prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
      res.json(cats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/article-categories", requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-");
      const cat = await prisma.articleCategory.create({ data: { name, slug } });
      res.json(cat);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.delete("/article-categories/:id", requireAdmin, async (req, res) => {
    try {
      await prisma.articleCategory.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.get("/article-tags", async (req, res) => {
    try {
      const tags = await prisma.articleTag.findMany({ orderBy: { name: 'asc' } });
      res.json(tags);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/article-tags", requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-");
      const tag = await prisma.articleTag.create({ data: { name, slug } });
      res.json(tag);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.delete("/article-tags/:id", requireAdmin, async (req, res) => {
    try {
      await prisma.articleTag.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Articles ─────────────────────────────────────────────────
  apiRouter.get("/articles", async (req, res) => {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      include: { author: { include: { user: { select: { name: true } } } } },
      orderBy: { publishedAt: 'desc' }
    });
    res.json(articles);
  });

  apiRouter.get("/articles/:slug", async (req, res) => {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: { author: { include: { user: { select: { name: true } } } } }
    });
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  });

  apiRouter.post("/articles", requireDoctorOrAdmin, async (req, res) => {
    try {
      const { title, excerpt, coverImage, contentRichText, tags, category } = req.body;

      let doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });

      if (res.locals.user.role === "DOCTOR") {
        if (!doctor || !doctor.canWriteArticles) {
          return res.status(403).json({ error: "لا تملك صلاحية إضافة مقالات" });
        }
      } else if (res.locals.user.role === "ADMIN") {
        if (!doctor) {
          doctor = await prisma.doctor.create({
            data: { userId: res.locals.user.userId, specialties: "[]", title: "Admin", canWriteArticles: true }
          });
        }
      }

      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();

      const article = await prisma.article.create({
        data: {
          title, slug, excerpt: excerpt || "",
          coverImage: coverImage || null,
          contentRichText: contentRichText || "<p></p>",
          tags: JSON.stringify(tags || []),
          category: category || "عام",
          authorId: doctor!.id,
          publishedAt: new Date(),
        }
      });

      await logAudit(res.locals.user.userId, "CREATE_ARTICLE", "Article", article.id);
      res.json(article);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.put("/articles/:id", requireDoctorOrAdmin, async (req, res) => {
    try {
      const { title, excerpt, coverImage, contentRichText, tags, category } = req.body;
      const article = await prisma.article.update({
        where: { id: req.params.id },
        data: {
          title, excerpt, coverImage,
          contentRichText,
          tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
          category,
        }
      });
      await logAudit(res.locals.user.userId, "UPDATE_ARTICLE", "Article", article.id);
      res.json(article);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.delete("/articles/:id", requireDoctorOrAdmin, async (req, res) => {
    try {
      await prisma.article.delete({ where: { id: req.params.id } });
      await logAudit(res.locals.user.userId, "DELETE_ARTICLE", "Article", req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Tools ────────────────────────────────────────────────────

  apiRouter.get("/tools", async (req, res) => {
    const tools = await prisma.interactiveTool.findMany({
      where: { published: true }
    });
    res.json(tools);
  });

  apiRouter.get("/admin/tools", requireAdmin, async (req, res) => {
    const tools = await prisma.interactiveTool.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(tools);
  });

  apiRouter.post("/tools", requireAdmin, async (req, res) => {
    try {
      const { title, description, type, categories, priceView, priceDownload, fileUrl } = req.body;
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();

      const tool = await prisma.interactiveTool.create({
        data: {
          title, slug, description,
          type: type || "PDF",
          categories: JSON.stringify(categories || []),
          priceView: parseFloat(priceView) || 0,
          priceDownload: priceDownload ? parseFloat(priceDownload) : null,
          fileKey: fileUrl || null,
          published: true,
        }
      });

      await logAudit(res.locals.user.userId, "CREATE_TOOL", "InteractiveTool", tool.id);
      res.json(tool);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.put("/tools/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, type, categories, priceView, priceDownload, published, fileUrl } = req.body;
      const tool = await prisma.interactiveTool.update({
        where: { id: req.params.id },
        data: {
          title, description, type,
          categories: typeof categories === 'string' ? categories : JSON.stringify(categories || []),
          priceView: parseFloat(priceView) || 0,
          priceDownload: priceDownload ? parseFloat(priceDownload) : null,
          fileKey: fileUrl !== undefined ? fileUrl : null,
          published: published !== undefined ? published : true,
        }
      });
      await logAudit(res.locals.user.userId, "UPDATE_TOOL", "InteractiveTool", tool.id);
      res.json(tool);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.delete("/tools/:id", requireAdmin, async (req, res) => {
    try {
      await prisma.interactiveTool.delete({ where: { id: req.params.id } });
      await logAudit(res.locals.user.userId, "DELETE_TOOL", "InteractiveTool", req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Manual Checkout ──────────────────────────────────────────

  apiRouter.post("/checkout/manual", requireAuth, async (req, res) => {
    try {
      const userId = res.locals.user.userId;
      const { itemId, type, paymentMethod } = req.body; // type can be 'COURSE' or 'TOOL'

      let amount = 0;
      if (type === 'COURSE') {
        const course = await prisma.course.findUnique({ where: { id: itemId } });
        if (!course) return res.status(404).json({ error: "Course not found" });
        amount = course.price;
      } else if (type === 'TOOL') {
        const tool = await prisma.interactiveTool.findUnique({ where: { id: itemId } });
        if (!tool) return res.status(404).json({ error: "Tool not found" });
        amount = tool.priceView || 0; // default to priceView for tools
      } else {
        return res.status(400).json({ error: "Invalid purchase type" });
      }

      const existingPurchase = await prisma.purchase.findFirst({
        where: { userId, itemId, type }
      });

      if (existingPurchase) {
        return res.status(400).json({ error: "Already purchased or pending verification" });
      }

      const purchase = await prisma.purchase.create({
        data: {
          userId, type, itemId,
          amount, currency: "EGP",
          status: "PENDING", paymentMethod: paymentMethod || "MANUAL"
        }
      });

      await logAudit(userId, "MANUAL_CHECKOUT", "Purchase", purchase.id);
      res.json({ success: true, purchaseId: purchase.id });
    } catch (err) {
      console.error("Manual Checkout Error:", err);
      res.status(500).json({ error: "Checkout failed" });
    }
  });

  apiRouter.post("/checkout/free", requireAuth, async (req, res) => {
    try {
      const userId = res.locals.user.userId;
      const { itemId, type } = req.body;

      if (type !== 'COURSE') {
        return res.status(400).json({ error: "Only free courses are supported right now" });
      }

      const course = await prisma.course.findUnique({ where: { id: itemId } });
      if (!course || !course.isFree) {
        return res.status(400).json({ error: "Course is not free or not found" });
      }

      const existingPurchase = await prisma.purchase.findFirst({
        where: { userId, itemId, type }
      });

      if (existingPurchase) {
        return res.status(400).json({ error: "Already added to your account" });
      }

      const purchase = await prisma.purchase.create({
        data: {
          userId, type, itemId,
          amount: 0, currency: "EGP",
          status: "APPROVED", paymentMethod: "FREE"
        }
      });

      await logAudit(userId, "FREE_CHECKOUT", "Purchase", purchase.id);
      res.json({ success: true, purchaseId: purchase.id });
    } catch (err) {
      console.error("Free Checkout Error:", err);
      res.status(500).json({ error: "Checkout failed" });
    }
  });

  // ─── Admin Purchases ──────────────────────────────────────────

  apiRouter.get("/admin/purchases", requireAdmin, async (req, res) => {
    try {
      const purchases = await prisma.purchase.findMany({
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' }
      });
      // Enrich with course info
      const enriched = await Promise.all(purchases.map(async (p) => {
        let courseTitle = null;
        if (p.type === "COURSE") {
          const course = await prisma.course.findUnique({ where: { id: p.itemId }, select: { title: true } });
          courseTitle = course?.title || null;
        }
        return { ...p, courseTitle };
      }));
      res.json(enriched);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/admin/purchases/:id/approve", requireAdmin, async (req, res) => {
    try {
      const purchase = await prisma.purchase.update({
        where: { id: req.params.id },
        data: { status: 'APPROVED' }
      });
      await logAudit(res.locals.user.userId, "APPROVE_PURCHASE", "Purchase", purchase.id);
      res.json(purchase);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/admin/purchases/:id/reject", requireAdmin, async (req, res) => {
    try {
      const purchase = await prisma.purchase.update({
        where: { id: req.params.id },
        data: { status: 'REJECTED' }
      });
      await logAudit(res.locals.user.userId, "REJECT_PURCHASE", "Purchase", purchase.id);
      res.json(purchase);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Doctor Profile ───────────────────────────────────────────

  apiRouter.get("/doctor/me", async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: "Not authenticated" });
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const doctor = await prisma.doctor.findUnique({
        where: { userId: decoded.userId },
        include: { user: { select: { name: true, email: true } } }
      });
      if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });
      res.json(doctor);
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // ─── Admin Users Management ───────────────────────────────────

  apiRouter.get("/admin/users", requireAdmin, async (req, res) => {
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

  apiRouter.post("/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body; // USER, DOCTOR, ADMIN
      if (!["USER", "DOCTOR", "ADMIN"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Check if trying to modify an admin
      const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!targetUser) return res.status(404).json({ error: "User not found" });
      if (targetUser.role === "ADMIN" && res.locals.user.userId !== targetUser.id) {
        return res.status(403).json({ error: "لا تملك صلاحية تعديل دور لمدير نظام آخر" });
      }
      if (targetUser.role === "ADMIN" && res.locals.user.userId === targetUser.id && role !== "ADMIN") {
        return res.status(403).json({ error: "لا يمكنك إزالة صلاحية المدير عن حسابك" });
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role }
      });

      // Create doctor profile if promoting to DOCTOR
      if (role === "DOCTOR") {
        const existingDoctor = await prisma.doctor.findUnique({ where: { userId: req.params.id } });
        if (!existingDoctor) {
          await prisma.doctor.create({
            data: { userId: req.params.id, specialties: "[]", title: "طبيب" }
          });
        }
      }

      await logAudit(res.locals.user.userId, "CHANGE_ROLE", "User", req.params.id);
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body; // ACTIVE, INACTIVE
      if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!targetUser) return res.status(404).json({ error: "User not found" });

      if (targetUser.role === "ADMIN") {
        return res.status(403).json({ error: "لا يمكنك تغيير حالة حساب لمدير نظام" });
      }

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

  // ─── Admin Doctor Permissions ─────────────────────────────────

  apiRouter.post("/admin/doctors/:id/permissions", requireAdmin, async (req, res) => {
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

  // ─── Admin Clear Data ─────────────────────────────────────────

  apiRouter.post("/admin/clear-data", requireAdmin, async (req, res) => {
    try {
      await prisma.courseLesson.deleteMany();
      await prisma.course.deleteMany();
      await prisma.article.deleteMany();
      await prisma.interactiveTool.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.thread.deleteMany();
      await logAudit(res.locals.user.userId, "CLEAR_DATA", "System");
      res.json({ success: true, message: "تم مسح البيانات بنجاح" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Admin Audit Log ──────────────────────────────────────────

  apiRouter.get("/admin/audit-log", requireAdmin, async (req, res) => {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      // Enrich with actor names
      const enriched = await Promise.all(logs.map(async (log) => {
        let actorName = "النظام";
        if (log.actorId) {
          const user = await prisma.user.findUnique({ where: { id: log.actorId }, select: { name: true } });
          actorName = user?.name || "غير معروف";
        }
        return { ...log, actorName };
      }));
      res.json(enriched);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Doctor Articles (my articles) ────────────────────────────

  apiRouter.get("/doctor/articles", requireDoctorOrAdmin, async (req, res) => {
    try {
      const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const articles = await prisma.article.findMany({
        where: { authorId: doctor.id },
        include: { author: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(articles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Doctor Portfolio & Slots ──────────────────────────────────

  apiRouter.put("/doctor/portfolio", requireDoctorOrAdmin, async (req, res) => {
    try {
      const { bio, specialties, title, photo, sessionPrice, sessionLink } = req.body;
      const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const updated = await prisma.doctor.update({
        where: { id: doctor.id },
        data: {
          bio,
          specialties: typeof specialties === 'string' ? specialties : JSON.stringify(specialties || []),
          title,
          photo,
          sessionPrice: parseFloat(sessionPrice) || 0,
          sessionLink
        }
      });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.get("/doctor/slots", requireDoctorOrAdmin, async (req, res) => {
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

  apiRouter.post("/doctor/slots", requireDoctorOrAdmin, async (req, res) => {
    try {
      const { startAt, endAt } = req.body;
      const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const slot = await prisma.availableSlot.create({
        data: {
          doctorId: doctor.id,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
        }
      });
      res.json(slot);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.delete("/doctor/slots/:id", requireDoctorOrAdmin, async (req, res) => {
    try {
      const slotId = req.params.id;
      await prisma.availableSlot.delete({ where: { id: slotId } });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Public Doctors Directory ──────────────────────────────────

  apiRouter.get("/doctors", async (req, res) => {
    try {
      const doctors = await prisma.doctor.findMany({
        where: {
          user: {
            status: "ACTIVE",
            role: "DOCTOR"
          }
        },
        include: {
          user: { select: { name: true, avatar: true } }
        }
      });
      res.json(doctors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.get("/doctors/:id", async (req, res) => {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: req.params.id },
        include: {
          user: { select: { name: true, avatar: true } },
          slots: {
            where: { isBooked: false, startAt: { gte: new Date() } },
            orderBy: { startAt: 'asc' }
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

  // ─── Bookings ──────────────────────────────────────────────────

  apiRouter.post("/bookings", requireAuth, async (req, res) => {
    try {
      const { doctorId, slotId, paymentMethod, amount } = req.body;
      const userId = res.locals.user.userId;

      // Check slot exists and is not booked
      const slot = await prisma.availableSlot.findUnique({
        where: { id: slotId }
      });
      if (!slot || slot.isBooked) {
        return res.status(400).json({ error: "Slot not available" });
      }

      // Mark slot as booked
      await prisma.availableSlot.update({
        where: { id: slotId },
        data: { isBooked: true }
      });

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          doctorId,
          slotId,
          amount: parseFloat(amount) || 0,
          paymentMethod,
          status: "PENDING",
          paymentStatus: "PENDING"
        }
      });

      await logAudit(userId, "CREATE_BOOKING", "Booking", booking.id);
      res.json({ success: true, bookingId: booking.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.get("/bookings/my", requireAuth, async (req, res) => {
    try {
      const userId = res.locals.user.userId;
      const bookings = await prisma.booking.findMany({
        where: { userId },
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

  // ─── Admin Bookings ─────────────────────────────────────────────

  apiRouter.get("/admin/bookings", requireAdmin, async (req, res) => {
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

  apiRouter.post("/admin/bookings/:id/approve", requireAdmin, async (req, res) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.id },
        include: { doctor: true }
      });

      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'APPROVED',
          meetingLink: booking.doctor.sessionLink
        }
      });
      await logAudit(res.locals.user.userId, "APPROVE_BOOKING", "Booking", booking.id);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  apiRouter.post("/admin/bookings/:id/reject", requireAdmin, async (req, res) => {
    try {
      const booking = await prisma.booking.update({
        where: { id: req.params.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REJECTED'
        }
      });
      // Free up the slot if it still exists
      if (booking.slotId) {
        try {
          await prisma.availableSlot.update({
            where: { id: booking.slotId },
            data: { isBooked: false }
          });
        } catch (e) {
          console.warn("Slot may have been deleted already", e);
        }
      }

      await logAudit(res.locals.user.userId, "REJECT_BOOKING", "Booking", booking.id);
      res.json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Mount Routes ─────────────────────────────────────────────

  app.use("/api", apiRouter);

  // Vite middleware for development, or static for production
  const fsModule = await import("fs");
  const distExists = fsModule.existsSync("dist/index.html");

  if (process.env.NODE_ENV === "production" && distExists) {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
