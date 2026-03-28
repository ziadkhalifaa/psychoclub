import express from "express";
import prisma from "../prisma.js";
import { requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit, deleteFile } from "../utils/helpers.js";

const router = express.Router();

// ─── Articles ─────────────────────────────────────────────────

// Public: list published articles
router.get("/", async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { author: { include: { user: { select: { name: true, avatar: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: get single article by slug
router.get("/:slug", async (req, res) => {
  try {
    let article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: { include: { user: { select: { name: true, avatar: true } } } },
        tags: true
      }
    });

    // Fallback to ID if slug not found
    if (!article) {
      article = await prisma.article.findUnique({
        where: { id: req.params.slug },
        include: {
          author: { include: { user: { select: { name: true, avatar: true } } } },
          tags: true
        }
      });
    }

    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin/Doctor: create/update article
router.post("/", requireDoctorOrAdmin, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
    if (!doctor) return res.status(401).json({ error: "Doctor profile required" });

    const { id, title, excerpt, coverImage, contentRichText, tags, category } = req.body;
    
    const slug = title.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '') || `article-${Math.random().toString(36).slice(2, 9)}`;

    if (id) {
      // Delete old cover image if it changed
      const oldArticle = await prisma.article.findUnique({ where: { id } });
      if (coverImage && oldArticle?.coverImage && coverImage !== oldArticle.coverImage) {
        deleteFile(oldArticle.coverImage);
      }

      // Update
      const article = await prisma.article.update({
        where: { id },
        data: {
          title, excerpt, coverImage, contentRichText,
          tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
          category,
          slug
        }
      });
      await logAudit(res.locals.user.userId, "UPDATE_ARTICLE", "Article", article.id);
      return res.json(article);
    } else {
      // Create
      const article = await prisma.article.create({
        data: {
          title, excerpt, coverImage, contentRichText,
          tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
          category,
          slug,
          authorId: doctor.id
        }
      });
      await logAudit(res.locals.user.userId, "CREATE_ARTICLE", "Article", article.id);
      return res.json(article);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin/Doctor: delete article
router.delete("/:id", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: "Article not found" });

    // Delete cover image
    deleteFile(article.coverImage);

    await prisma.article.delete({ where: { id } });
    await logAudit(res.locals.user.userId, "DELETE_ARTICLE", "Article", id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Categories & Tags ────────────────────────────────────────

router.get("/article-categories", async (req, res) => {
  try {
    const cats = await prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/article-categories", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const cat = await prisma.articleCategory.create({ data: { name, slug } });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/article-categories/:id", requireDoctorOrAdmin, async (req, res) => {
  try {
    await prisma.articleCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/article-tags", async (req, res) => {
  try {
    const tags = await prisma.articleTag.findMany({ orderBy: { name: 'asc' } });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/article-tags", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const tag = await prisma.articleTag.create({ data: { name, slug } });
    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/article-tags/:id", requireDoctorOrAdmin, async (req, res) => {
  try {
    await prisma.articleTag.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
