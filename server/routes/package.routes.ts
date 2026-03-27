import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { logAudit, deleteFile } from "../utils/helpers.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// ─── Packages (الحزم/الأدوات) ───────────────────────────────────

// Public: list published packages
router.get("/", async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { published: true },
      include: { files: { select: { id: true }, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    const result = packages.map(p => ({ ...p, fileCount: p.files.length }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: get single package with files
router.get("/:id", async (req, res) => {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: req.params.id },
      include: { files: { orderBy: { order: 'asc' } } }
    });
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: preview an HTML file (server logic with watermark)
router.get("/:id/files/:fileId/preview", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Unauthorized");
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, email: true }
    });

    const file = await prisma.packageFile.findFirst({
      where: { id: req.params.fileId, packageId: req.params.id }
    });
    if (!file) return res.status(404).json({ error: "File not found" });

    const relativeUrl = file.fileUrl.startsWith('/') ? file.fileUrl.substring(1) : file.fileUrl;
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server");
    }

    if (path.extname(filePath).toLowerCase() === '.html') {
      let content = fs.readFileSync(filePath, 'utf8');
      const userIdentifier = `${user?.name || 'User'} (${user?.email || ''})`;
      const watermarkText = `${userIdentifier} - ${new Date().toLocaleDateString('ar-EG')}`;
      const fileDir = path.dirname(file.fileUrl).replace(/\\/g, '/');
      const baseUrl = fileDir.endsWith('/') ? fileDir : `${fileDir}/`;

      const securityStyle = `
        <style>
          @media print { body { display: none !important; } }
          .security-tag {
            position: fixed; color: rgba(111, 166, 90, 0.3); font-weight: 900; z-index: 2147483646;
            pointer-events: none; white-space: nowrap; font-size: 12px;
            animation: floatTag 15s linear infinite;
            font-family: sans-serif;
          }
          @keyframes floatTag {
            0% { transform: translate(-100%, -100%); top: 0; left: 0; }
            100% { transform: translate(100vw, 100vh); top: 0; left: 0; }
          }
        </style>
      `;
      
      const securityElements = `
        <div class="security-tag">${watermarkText}</div>
        <div class="security-tag" style="animation-delay: -5s; animation-duration: 25s;">${watermarkText}</div>
        <div class="security-tag" style="animation-delay: -10s; animation-duration: 20s;">${watermarkText}</div>
      `;

      const headMatch = content.match(/<head[^>]*>/i);
      if (headMatch) {
        content = content.replace(headMatch[0], `${headMatch[0]}<base href="${baseUrl}">${securityStyle}`);
      }
      const bodyMatch = content.match(/<body[^>]*>/i);
      if (bodyMatch) {
        content = content.replace(bodyMatch[0], `${bodyMatch[0]}${securityElements}`);
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } else {
      res.sendFile(filePath);
    }
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
});

// Admin: create/update package
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { id, title, description, coverImage, files } = req.body;
    
    if (id) {
      // Update metadata
      const pkg = await prisma.package.update({
        where: { id },
        data: { title, description, coverImage, published: true }
      });

      // Handle files sync
      if (Array.isArray(files)) {
        const keptIds = files.filter(f => f.id).map(f => f.id);
        const existingFiles = await prisma.packageFile.findMany({ where: { packageId: id } });
        const removed = existingFiles.filter(f => !keptIds.includes(f.id));
        
        for (const f of removed) {
          deleteFile(f.fileUrl);
          await prisma.packageFile.delete({ where: { id: f.id } });
        }

        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          if (f.id) {
            await prisma.packageFile.update({
              where: { id: f.id },
              data: { title: f.title, fileUrl: f.fileUrl, fileName: f.fileName, order: i }
            });
          } else {
            await prisma.packageFile.create({
              data: { packageId: id, title: f.title, fileUrl: f.fileUrl, fileName: f.fileName, order: i }
            });
          }
        }
      }
      await logAudit(res.locals.user.userId, "UPDATE_PACKAGE", "Package", id);
      res.json(pkg);
    } else {
      // Create
      const pkg = await prisma.package.create({
        data: {
          title, description, coverImage, published: true,
          files: {
            create: (files || []).map((f: any, i: number) => ({
              title: f.title, fileUrl: f.fileUrl, fileName: f.fileName, order: i
            }))
          }
        }
      });
      await logAudit(res.locals.user.userId, "CREATE_PACKAGE", "Package", pkg.id);
      res.json(pkg);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: delete package
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: { files: true }
    });
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    deleteFile(pkg.coverImage);
    pkg.files.forEach(f => deleteFile(f.fileUrl));

    await prisma.packageFile.deleteMany({ where: { packageId: id } });
    await prisma.package.delete({ where: { id } });
    await logAudit(res.locals.user.userId, "DELETE_PACKAGE", "Package", id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
