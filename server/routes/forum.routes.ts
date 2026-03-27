import express from "express";
import prisma from "../prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { logAudit } from "../utils/helpers.js";

const router = express.Router();

// ─── Forum Categories ──────────────────────────────────────────

router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      include: { _count: { select: { threads: true } } }
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Forum Threads ─────────────────────────────────────────────

router.get("/posts", async (req, res) => {
  try {
    const { categoryId, q, page = 1 } = req.query;
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    const where: any = {};
    if (categoryId) where.categoryId = String(categoryId);
    if (q) {
      where.OR = [
        { title: { contains: String(q) } },
        { body: { contains: String(q) } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        include: {
          author: { select: { name: true, avatar: true } },
          category: true,
          _count: { select: { comments: true, likes: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.thread.count({ where })
    ]);

    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await prisma.thread.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { name: true, avatar: true, role: true } },
        category: true,
        comments: {
          include: { author: { select: { name: true, avatar: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        },
        _count: { select: { likes: true } }
      }
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    await prisma.thread.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/posts", requireAuth, async (req, res) => {
  try {
    const { title, body, categoryId } = req.body;
    const authorId = res.locals.user.userId;

    const post = await prisma.thread.create({
      data: { title, body, categoryId, authorId, tags: "[]" }
    });

    await logAudit(authorId, "CREATE_FORUM_POST", "Thread", post.id);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Forum Comments & Engagement ────────────────────────────────

router.post("/posts/:id/comments", requireAuth, async (req, res) => {
  try {
    const { body } = req.body;
    const authorId = res.locals.user.userId;

    const comment = await prisma.comment.create({
      data: { body, threadId: req.params.id, authorId },
      include: { author: { select: { name: true, avatar: true } } }
    });

    await logAudit(authorId, "CREATE_FORUM_COMMENT", "Comment", comment.id);
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const threadId = req.params.id;

    const existing = await prisma.forumLike.findFirst({ where: { userId, threadId } });

    if (existing) {
      await prisma.forumLike.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      await prisma.forumLike.create({ data: { userId, threadId } });
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
