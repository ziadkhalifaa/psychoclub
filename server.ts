import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "./server/prisma.js";
import { logAudit, deleteFile } from "./server/utils/helpers.js";
import { requireAuth, requireAdmin, requireDoctorOrAdmin } from "./server/middleware/auth.js";
import authRoutes from "./server/routes/auth.routes.js";
import courseRoutes from "./server/routes/course.routes.js";
import articleRoutes from "./server/routes/article.routes.js";
import packageRoutes from "./server/routes/package.routes.js";
import adminRoutes from "./server/routes/admin.routes.js";
import bookingRoutes from "./server/routes/booking.routes.js";
import forumRoutes from "./server/routes/forum.routes.js";
import doctorRoutes from "./server/routes/doctor.routes.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// ─── Environment Validation ──────────────────────────────────────
const REQUIRED_ENV = ["JWT_SECRET", "DATABASE_URL"];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
  console.error("Please check your .env file.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET!;

async function startServer() {
  const app = express();
  app.set("trust proxy", 1); 
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Helmet Security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "*"],
        "media-src": ["'self'", "data:", "blob:", "*"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "connect-src": ["'self'", "*"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));
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

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });

  // Apply rate limiter to all api routes
  apiRouter.use(limiter);

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

  // Helpers and Middlewares are now imported from ./server/...

  // ─── Auth ──────────────────────────────────────────────────────

  // ─── Modular Routes ───
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/courses", courseRoutes);
  apiRouter.use("/articles", articleRoutes); // Legacy compat (some routes use /api/articles/...)
  apiRouter.use("/", articleRoutes);    // For /api/article-categories etc
  apiRouter.use("/packages", packageRoutes);
  apiRouter.use("/admin", adminRoutes);
  apiRouter.use("/booking", bookingRoutes);
  apiRouter.use("/forum", forumRoutes); // Mounted at /api/forum
  // The AdminDashboard calls /api/admin/forum/categories, so we should ALSO mount forumRoutes under /api/admin
  apiRouter.use("/admin/forum", forumRoutes); 
  apiRouter.use("/doctor", doctorRoutes);


  // Auth: download all package files (requires approved purchase)
  // Securing Download Route with Pretty Info Page
  const renderDownloadInfoPage = (reason: 'AUTH' | 'PURCHASE') => {
    const isAuth = reason === 'AUTH';
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Clinical Cases Group | الوصول مطلوب</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Tajawal', sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; color: #1F2F4A; }
              .card { background: white; padding: 3rem; border-radius: 3rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%; text-align: center; border: 1px solid #f1f5f9; }
              .icon-box { width: 80px; height: 80px; background: ${isAuth ? '#fef2f2' : '#fffbeb'}; border-radius: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; }
              h1 { font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; }
              p { color: #64748b; line-height: 1.6; margin-bottom: 2.5rem; }
              .btn { display: block; width: 100%; padding: 1.25rem; border-radius: 1.5rem; font-weight: 700; text-decoration: none; transition: all 0.3s; margin-bottom: 1rem; }
              .btn-primary { background: #6FA65A; color: white; box-shadow: 0 10px 15px -3px rgba(111, 166, 90, 0.3); }
              .btn-primary:hover { transform: translateY(-3px); background: #5d8c4b; }
              .btn-secondary { background: #f1f5f9; color: #475569; }
              .btn-secondary:hover { background: #e2e8f0; }
          </style>
      </head>
      <body>
          <div class="card">
              <div class="icon-box">
                  ${isAuth ? 
                    `<svg viewBox="0 0 24 24" width="40" height="40" stroke="#ef4444" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>` : 
                    `<svg viewBox="0 0 24 24" width="40" height="40" stroke="#f59e0b" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
                  }
              </div>
              <h1>${isAuth ? 'تحتاج إلى تسجيل الدخول أولاً' : 'تحتاج إلى شراء الحزمة'}</h1>
              <p>
                  ${isAuth ? 
                    'لا يمكنك تحميل هذه المحتويات العلمية بدون حساب مفعل. يرجى تسجيل الدخول أو إنشاء حساب جديد أولاً للوصول إلى مكتبة الأدوات.' : 
                    'هذه الحزمة مدفوعة، يرجى إتمام عملية الشراء من صفحة الحزمة للتمكن من تحميل الملفات العلمية كاملة بصيغة ZIP.'
                  }
              </p>
              <a href="${isAuth ? '/register' : '#'}" onclick="${isAuth ? '' : 'window.history.back(); return false;'}" class="btn btn-primary">
                  ${isAuth ? 'تسجيل حساب جديد' : 'الرجوع لشراء الحزمة'}
              </a>
              ${isAuth ? `<a href="/login" class="btn btn-secondary">تسجيل الدخول</a>` : ''}
              <a href="/" class="btn btn-secondary">العودة للرئيسية</a>
          </div>
      </body>
      </html>
    `;
  };



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

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Auto-seed categories
    try {
      const count = await prisma.forumCategory.count();
      if (count === 0) {
        console.log("Seeding forum categories...");
        const categories = ['العلاج المعرفي السلوكي', 'التقييم والتشخيص', 'علاج الإدمان', 'حالات إكلينيكية', 'أدوات ومقاييس'];
        await prisma.forumCategory.createMany({
          data: categories.map(name => ({ name }))
        });
      }
    } catch (e) {
      console.error("Failed to seed categories", e);
    }
  });
}

startServer();
