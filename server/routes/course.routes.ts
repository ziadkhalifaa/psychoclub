import express from "express";
import prisma from "../prisma.js";
import { requireAuth, requireDoctorOrAdmin } from "../middleware/auth.js";
import { logAudit, deleteFile } from "../utils/helpers.js";

const router = express.Router();

// ─── Courses ──────────────────────────────────────────────────

// Public: list all published courses
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        instructor: { include: { user: { select: { name: true, avatar: true } } } },
        publisher: { select: { name: true, avatar: true } },
        lessons: { orderBy: { order: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: get single course by slug
router.get("/:slug", async (req, res) => {
  try {
    let course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        instructor: { include: { user: { select: { name: true, avatar: true } } } },
        publisher: { select: { name: true, avatar: true } },
        lessons: { orderBy: { order: 'asc' } }
      }
    });

    // Fallback search by ID if slug not found
    if (!course) {
      course = await prisma.course.findUnique({
        where: { id: req.params.slug },
        include: {
          instructor: { include: { user: { select: { name: true, avatar: true } } } },
          publisher: { select: { name: true, avatar: true } },
          lessons: { orderBy: { order: 'asc' } }
        }
      });
    }

    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Auth: get course for learning (includes progress)
router.get("/:slug/learn", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const role = res.locals.user.role;

    let course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: { lessons: { orderBy: { order: 'asc' } } }
    });

    if (!course) {
      course = await prisma.course.findUnique({
        where: { id: req.params.slug },
        include: { lessons: { orderBy: { order: 'asc' } } }
      });
    }

    if (!course) return res.status(404).json({ error: "Course not found" });

    // Check if user has purchased the course (or is admin)
    if (role !== 'ADMIN') {
      const purchase = await prisma.purchase.findFirst({
        where: { userId, itemId: course.id, type: 'COURSE', status: 'APPROVED' }
      });
      if (!purchase && !course.isFree) {
        return res.status(403).json({ error: "Course not purchased" });
      }
    }

    const progress = await prisma.courseProgress.findMany({
      where: { userId, courseId: course.id }
    });

    res.json({ course, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Auth: update lesson progress
router.post("/progress", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const { courseId, lessonId, completed } = req.body;

    const progress = await prisma.courseProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, courseId, lessonId, completed },
      update: { completed }
    });

    res.json({ success: true, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin/Doctor: list my courses
router.get("/my", requireDoctorOrAdmin, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
    if (!doctor && res.locals.user.role !== 'ADMIN') return res.status(404).json({ error: "Doctor not found" });

    const where = res.locals.user.role === 'ADMIN' ? {} : { instructorId: doctor?.id };
    const courses = await prisma.course.findMany({
      where,
      include: { lessons: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin/Doctor: create course
router.post("/", requireDoctorOrAdmin, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: res.locals.user.userId } });
    if (!doctor && res.locals.user.role !== 'ADMIN') return res.status(403).json({ error: "Not authorized" });

    const {
      title, description, price, isFree, duration, category, level, thumbnail,
      lessons, whatYouLearn, requirements, instructorId // Added instructorId
    } = req.body;

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const course = await prisma.course.create({
      data: {
        title, description, price: parseFloat(price) || 0, isFree: !!isFree,
        duration, category, level, thumbnail, slug,
        instructorId: instructorId || doctor?.id || (await prisma.doctor.findFirst())?.id || "", 
        whatYouLearn: typeof whatYouLearn === 'string' ? whatYouLearn : JSON.stringify(whatYouLearn || []),
        requirements: typeof requirements === 'string' ? requirements : JSON.stringify(requirements || []),
        published: true,
        lessons: {
          create: (lessons || []).map((l: any, idx: number) => ({
            title: l.title,
            resourceUrl: l.videoUrl || l.resourceUrl,
            duration: l.duration,
            order: idx,
            type: (l.type || "VIDEO").toUpperCase() // Fixed: Use provided type
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

// Admin/Doctor: update course
router.put("/:id", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, price, isFree, duration, category, level, thumbnail,
      lessons, whatYouLearn, requirements, published, instructorId
    } = req.body;

    const oldCourse = await prisma.course.findUnique({
      where: { id },
      include: { lessons: true }
    });

    if (!oldCourse) return res.status(404).json({ error: "Course not found" });

    // 1. Delete old thumbnail if replaced
    if (thumbnail && oldCourse.thumbnail && thumbnail !== oldCourse.thumbnail) {
      deleteFile(oldCourse.thumbnail);
    }

    // Use transaction for atomicity
    const updated = await prisma.$transaction(async (tx) => {
      // 2. Handle lessons update (Delete removed lesson files)
      if (Array.isArray(lessons)) {
        const newLessonResourceUrls = lessons.map((l: any) => l.videoUrl || l.resourceUrl);
        const removedLessons = oldCourse.lessons.filter(
          oldL => !newLessonResourceUrls.includes(oldL.resourceUrl)
        );
        
        removedLessons.forEach(l => deleteFile(l.resourceUrl));

        // Re-create lessons
        await tx.courseLesson.deleteMany({ where: { courseId: id } });
      }

      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      return await tx.course.update({
        where: { id },
        data: {
          title, description, price: parseFloat(price) || 0, isFree: !!isFree,
          duration, category, level, thumbnail, slug, published: !!published,
          instructorId: instructorId || undefined,
          publisherId: res.locals.user.userId, // Record who updated it
          whatYouLearn: typeof whatYouLearn === 'string' ? whatYouLearn : JSON.stringify(whatYouLearn || []),
          requirements: typeof requirements === 'string' ? requirements : JSON.stringify(requirements || []),
          lessons: Array.isArray(lessons) ? {
            create: lessons.map((l: any, idx: number) => ({
              title: l.title,
              resourceUrl: l.videoUrl || l.resourceUrl,
              duration: l.duration,
              order: idx,
              type: (l.type || "VIDEO").toUpperCase()
            }))
          } : undefined
        }
      });
    });

    await logAudit(res.locals.user.userId, "UPDATE_COURSE", "Course", id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Admin/Doctor: delete course
router.delete("/:id", requireDoctorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: { lessons: true }
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // Delete thumbnail and lesson videos
    deleteFile(course.thumbnail);
    course.lessons.forEach(lesson => {
      deleteFile(lesson.resourceUrl);
    });

    await prisma.courseLesson.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });
    await logAudit(res.locals.user.userId, "DELETE_COURSE", "Course", id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
