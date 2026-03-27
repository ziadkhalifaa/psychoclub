const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();
async function cleanup() {
  console.log('--- Starting One-Time Orphaned File Cleanup (JS) ---');
  const validUrls = new Set();
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
  console.log('Found ' + validUrls.size + ' unique file references in database.');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory not found.');
    return;
  }
  const physicalFiles = fs.readdirSync(uploadsDir);
  console.log('Found ' + physicalFiles.length + ' files in public/uploads.');
  let deletedCount = 0;
  let totalSavedSpace = 0;
  for (const filename of physicalFiles) {
    const webPath = '/uploads/' + filename;
    const fullPath = path.join(uploadsDir, filename);
    if (fs.statSync(fullPath).isDirectory()) continue;
    if (!validUrls.has(webPath)) {
      const stats = fs.statSync(fullPath);
      totalSavedSpace += stats.size;
      fs.unlinkSync(fullPath);
      deletedCount++;
      console.log('Deleted: ' + filename + ' (' + (stats.size/1024/1024).toFixed(2) + ' MB)');
    }
  }
  console.log('--- Cleanup Finished ---');
  console.log(deletedCount + ' files deleted, ' + (totalSavedSpace/1024/1024).toFixed(2) + ' MB saved.');
}
cleanup().catch(console.error).finally(() => prisma.$disconnect());
