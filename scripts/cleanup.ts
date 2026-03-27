import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive cleanup...');

  // Order of deletion matters due to foreign key constraints if not using Cascade
  // We'll use a transaction to ensure everything is deleted correctly
  
  await prisma.$transaction([
    // Forum related
    prisma.forumLike.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.thread.deleteMany(),
    prisma.forumCategory.deleteMany(),
    
    // Course related
    prisma.courseProgress.deleteMany(),
    prisma.courseLesson.deleteMany(),
    prisma.course.deleteMany(),
    
    // Article related
    prisma.article.deleteMany(),
    prisma.articleCategory.deleteMany(),
    prisma.articleTag.deleteMany(),
    
    // Booking and Sessions related
    prisma.review.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.availableSlot.deleteMany(),
    
    // Purchases and Packages
    prisma.purchase.deleteMany(),
    prisma.packageFile.deleteMany(),
    prisma.package.deleteMany(),
    
    // System logs and notifications
    prisma.notification.deleteMany(),
    prisma.report.deleteMany(),
    prisma.moderationAction.deleteMany(),
    prisma.auditLog.deleteMany(),
    
    // Finally Doctors and Users
    // We'text delete all doctors
    prisma.doctor.deleteMany(),
    
    // Delete all users EXCEPT ADMIn
    prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    }),
  ]);

  console.log('Cleanup completed successfully.');
  
  const remainingUsers = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log('Remaining Users (Admins):', remainingUsers);
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
