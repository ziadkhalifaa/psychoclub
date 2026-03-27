import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('--- Starting One-Time Orphaned File Cleanup ---');

  // 1. Collect all valid URLs from DB
  const validUrls = new Set<string>();

  const users = await prisma.user.findMany({ select: { avatar: true } });
  users.forEach(u => { if (u.avatar) validUrls.add(u.avatar); });

  const doctors = await prisma.doctor.findMany({ select: { photo: true } });
  doctors.forEach(d => { if (d.photo) validUrls.add(d.photo); });

  const articles = await prisma.article.findMany({ select: { coverImage: true } });
  articles.forEach(a => { if (a.coverImage) validUrls.add(a.coverImage); });

  const courses = await prisma.course.findMany({ select: { thumbnail: true } });
  courses.forEach(c => { if (c.thumbnail) validUrls.add(c.thumbnail); });

  const lessons = await prisma.courseLesson.findMany({ select: { resourceUrl: true } });
  lessons.forEach(l => { if (l.resourceUrl) validUrls.add(l.resourceUrl); });

  const packages = await prisma.package.findMany({ select: { coverImage: true } });
  packages.forEach(p => { if (p.coverImage) validUrls.add(p.coverImage); });

  const packageFiles = await prisma.packageFile.findMany({ select: { fileUrl: true } });
  packageFiles.forEach(f => { if (f.fileUrl) validUrls.add(f.fileUrl); });

  console.log(`Found ${validUrls.size} unique file references in database.`);

  // 2. Scan physical uploads folder
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory not found. Skipping.');
    return;
  }

  const physicalFiles = fs.readdirSync(uploadsDir);
  console.log(`Found ${physicalFiles.length} files in public/uploads.`);

  let deletedCount = 0;
  let totalSavedSpace = 0;

  for (const filename of physicalFiles) {
    const webPath = `/uploads/${filename}`;
    const fullPath = path.join(uploadsDir, filename);

    // Skip directories
    if (fs.statSync(fullPath).isDirectory()) continue;

    if (!validUrls.has(webPath)) {
      const stats = fs.statSync(fullPath);
      totalSavedSpace += stats.size;
      fs.unlinkSync(fullPath);
      deletedCount++;
      console.log(`Deleted orphaned file: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }

  console.log('--- Cleanup Finished ---');
  console.log(`Total Orphaned Files Deleted: ${deletedCount}`);
  console.log(`Total Space Saved: ${(totalSavedSpace / 1024 / 1024).toFixed(2)} MB`);
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
