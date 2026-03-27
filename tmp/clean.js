const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('--- Starting One-Time Orphaned File Cleanup (JS) ---');

  const validUrls = new Set();

  users.forEach(u => { if (u.avatar) validUrls.add(u.avatar); });
  doctors.forEach(d => { if (d.photo) validUrls.add(d.photo); });
  articles.forEach(a => { if (a.coverImage) validUrls.add(a.coverImage); });
  courses.forEach(c => { if (c.thumbnail) validUrls.add(c.thumbnail); });
  lessons.forEach(l => { if (l.resourceUrl) validUrls.add(l.resourceUrl); });
  packages.forEach(p => { if (p.coverImage) validUrls.add(p.coverImage); });
  packageFiles.forEach(f => { if (f.fileUrl) validUrls.add(f.fileUrl); });

  console.log(`Found ${validUrls.size} unique file references in database.`);

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory not found.');
    return;
  }

  const physicalFiles = fs.readdirSync(uploadsDir);
  console.log(`Found ${physicalFiles.length} files in public/uploads.`);

  let deletedCount = 0;
  let totalSavedSpace = 0;

  for (const filename of physicalFiles) {
    const webPath = `/uploads/${filename}`;
    const fullPath = path.join(uploadsDir, filename);

    if (fs.statSync(fullPath).isDirectory()) continue;

    if (!validUrls.has(webPath)) {
      const stats = fs.statSync(fullPath);
      totalSavedSpace += stats.size;
      fs.unlinkSync(fullPath);
      deletedCount++;
      console.log(`Deleted: ${filename} (${(stats.size/1024/1024).toFixed(2)} MB)`);
    }
  }

  console.log('--- Cleanup Finished ---');
  console.log(`${deletedCount} files deleted, ${(totalSavedSpace/1024/1024).toFixed(2)} MB saved.`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
