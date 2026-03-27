import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(rootDir, "public", "uploads");

async function cleanup() {
  console.log("🚀 Starting orphaned files cleanup...");

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log("📁 Uploads directory not found. Skipping.");
    return;
  }

  // 1. Collect all referenced files from DB
  const [courses, lessons, articles, packages, packageFiles, users, doctors, bookings] = await Promise.all([
    prisma.course.findMany({ select: { thumbnail: true } }),
    prisma.courseLesson.findMany({ select: { resourceUrl: true } }),
    prisma.article.findMany({ select: { coverImage: true } }),
    prisma.package.findMany({ select: { coverImage: true } }),
    prisma.packageFile.findMany({ select: { fileUrl: true } }),
    prisma.user.findMany({ select: { avatar: true } }),
    prisma.doctor.findMany({ select: { photo: true } }),
    prisma.booking.findMany({ select: { paymentReceiptUrl: true } }),
  ]);

  const referencedFiles = new Set<string>();

  const addPath = (p: string | null | undefined) => {
    if (p && p.includes("/uploads/")) {
      // Extract just the filename at the end
      const parts = p.split("/");
      const filename = parts[parts.length - 1];
      referencedFiles.add(filename);
    }
  };

  courses.forEach(c => addPath(c.thumbnail));
  lessons.forEach(l => addPath(l.resourceUrl));
  articles.forEach(a => addPath(a.coverImage));
  packages.forEach(p => addPath(p.coverImage));
  packageFiles.forEach(f => addPath(f.fileUrl));
  users.forEach(u => addPath(u.avatar));
  doctors.forEach(d => addPath(d.photo));
  bookings.forEach(b => addPath(b.paymentReceiptUrl));

  console.log(`📊 Found ${referencedFiles.size} unique file references in database.`);

  // 2. Scan physical files
  const physicalFiles = fs.readdirSync(UPLOADS_DIR);
  console.log(`📁 Found ${physicalFiles.length} physical files in uploads directory.`);

  let deletedCount = 0;
  physicalFiles.forEach(file => {
    // Basic check: ignore directory itself and some common files if any
    if (fs.lstatSync(path.join(UPLOADS_DIR, file)).isDirectory()) return;

    if (!referencedFiles.has(file)) {
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
        deletedCount++;
        console.log(`🗑️ Deleted: ${file}`);
      } catch (err) {
        console.error(`❌ Failed to delete ${file}:`, err);
      }
    }
  });

  console.log(`✅ Cleanup complete. Deleted ${deletedCount} orphaned files.`);
  await prisma.$disconnect();
}

cleanup().catch(err => {
  console.error("💥 Fatal error during cleanup:", err);
  process.exit(1);
});
