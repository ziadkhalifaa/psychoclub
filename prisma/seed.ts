import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up
  await prisma.comment.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availableSlot.deleteMany();
  await prisma.interactiveTool.deleteMany();
  await prisma.article.deleteMany();
  await prisma.courseLesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash('admin123', 10);
  const userPw = await bcrypt.hash('user123', 10);

  // Admin
  const admin = await prisma.user.create({ data: { name: 'Admin User', email: 'admin@psychoclub.org', passwordHash: pw, role: 'ADMIN' } });

  // Doctors
  const drAhmedUser = await prisma.user.create({ data: { name: 'د. أحمد محمود', email: 'ahmed@psychoclub.space', passwordHash: pw, role: 'DOCTOR', phone: '01012345678' } });
  const drAhmed = await prisma.doctor.create({ data: { userId: drAhmedUser.id, bio: 'استشاري الطب النفسي وعلاج الإدمان - خبرة 15 عام', specialties: JSON.stringify(['علاج الإدمان', 'الطب النفسي', 'العلاج الدوائي']), title: 'استشاري', canWriteArticles: true, canWriteCourses: true, canManageSlots: true, rating: 4.8 } });

  const drSaraUser = await prisma.user.create({ data: { name: 'د. سارة كمال', email: 'sara@psychoclub.space', passwordHash: pw, role: 'DOCTOR', phone: '01098765432' } });
  const drSara = await prisma.doctor.create({ data: { userId: drSaraUser.id, bio: 'أخصائي العلاج المعرفي السلوكي - ماجستير علم نفس إكلينيكي', specialties: JSON.stringify(['CBT', 'القلق والاكتئاب', 'العلاج النفسي']), title: 'أخصائي', canWriteArticles: true, canWriteCourses: true, canManageSlots: true, rating: 4.9 } });

  const drKhaledUser = await prisma.user.create({ data: { name: 'د. خالد حسن', email: 'khaled@psychoclub.space', passwordHash: pw, role: 'DOCTOR', phone: '01155667788' } });
  const drKhaled = await prisma.doctor.create({ data: { userId: drKhaledUser.id, bio: 'أخصائي نفسي متخصص في علاج الأطفال والمراهقين', specialties: JSON.stringify(['علم نفس الأطفال', 'اضطرابات النمو']), title: 'أخصائي', canWriteArticles: true, canWriteCourses: false, canManageSlots: true, rating: 4.7 } });

  // Regular Users
  const user1 = await prisma.user.create({ data: { name: 'محمد علي', email: 'mohamed@example.com', passwordHash: userPw, role: 'USER', phone: '01234567890' } });
  const user2 = await prisma.user.create({ data: { name: 'فاطمة أحمد', email: 'fatma@example.com', passwordHash: userPw, role: 'USER', phone: '01122334455' } });
  const user3 = await prisma.user.create({ data: { name: 'عمر حسين', email: 'omar@example.com', passwordHash: userPw, role: 'USER' } });
  const user4 = await prisma.user.create({ data: { name: 'نور الدين', email: 'nour@example.com', passwordHash: userPw, role: 'USER' } });

  // Courses
  const course1 = await prisma.course.create({
    data: {
      slug: 'cbt-basics', title: 'أساسيات العلاج المعرفي السلوكي',
      description: 'دورة شاملة تغطي المبادئ الأساسية للعلاج المعرفي السلوكي وتطبيقاته الإكلينيكية مع حالات عملية.',
      price: 1500, discount: 1200, category: 'العلاج النفسي', level: 'مبتدئ', duration: '12 ساعة',
      instructorId: drSara.id, published: true, thumbnail: 'https://picsum.photos/seed/cbt/800/600',
      lessons: {
        create: [
          { title: 'مقدمة في CBT', type: 'video', resourceUrl: '#', order: 1, isPreview: true },
          { title: 'التقييم والتشخيص', type: 'video', resourceUrl: '#', order: 2 },
          { title: 'التشوهات المعرفية', type: 'video', resourceUrl: '#', order: 3 },
          { title: 'تقنيات إعادة الهيكلة', type: 'video', resourceUrl: '#', order: 4 },
          { title: 'التعرض التدريجي', type: 'video', resourceUrl: '#', order: 5 },
        ]
      }
    }
  });

  const course2 = await prisma.course.create({
    data: {
      slug: 'addiction-treatment', title: 'بروتوكولات علاج الإدمان',
      description: 'دورة متقدمة في أحدث بروتوكولات علاج الإدمان والتعامل مع الانتكاسات وبناء خطط التعافي.',
      price: 2000, category: 'علاج الإدمان', level: 'متقدم', duration: '20 ساعة',
      instructorId: drAhmed.id, published: true, thumbnail: 'https://picsum.photos/seed/addiction/800/600',
      lessons: {
        create: [
          { title: 'فهم الإدمان', type: 'video', resourceUrl: '#', order: 1, isPreview: true },
          { title: 'المقابلة التحفيزية', type: 'video', resourceUrl: '#', order: 2 },
          { title: 'خطة الوقاية من الانتكاس', type: 'video', resourceUrl: '#', order: 3 },
        ]
      }
    }
  });

  const course3 = await prisma.course.create({
    data: {
      slug: 'child-psychology', title: 'علم نفس الطفل والمراهق',
      description: 'دورة متخصصة في فهم التطور النفسي للأطفال والمراهقين وأساليب التدخل العلاجي.',
      price: 1800, category: 'علم نفس الأطفال', level: 'متوسط', duration: '15 ساعة',
      instructorId: drKhaled.id, published: true, thumbnail: 'https://picsum.photos/seed/child/800/600',
    }
  });

  await prisma.course.create({
    data: {
      slug: 'dbt-skills', title: 'مهارات العلاج الجدلي السلوكي DBT',
      description: 'تعلم المهارات الأساسية للعلاج الجدلي السلوكي: الوعي الكامل، تحمل الضيق، تنظيم المشاعر.',
      price: 0, isFree: true, category: 'العلاج النفسي', level: 'مبتدئ', duration: '6 ساعات',
      instructorId: drSara.id, published: true, thumbnail: 'https://picsum.photos/seed/dbt/800/600',
    }
  });

  // Articles
  await prisma.article.create({ data: { slug: 'understanding-anxiety', title: 'فهم اضطرابات القلق في العصر الحديث', excerpt: 'نظرة شاملة على أسباب وطرق علاج القلق المزمن ونوبات الهلع.', contentRichText: '<h2>ما هو القلق؟</h2><p>القلق هو استجابة طبيعية للتوتر، ولكن عندما يصبح مزمناً ويؤثر على حياتك اليومية، فإنه يتحول إلى اضطراب يحتاج علاجاً متخصصاً.</p><h2>أنواع اضطرابات القلق</h2><p>تشمل اضطراب القلق العام، واضطراب الهلع، والرهاب الاجتماعي، واضطراب الوسواس القهري.</p><h2>العلاج</h2><p>يعتمد العلاج على مزيج من العلاج المعرفي السلوكي والعلاج الدوائي عند الحاجة.</p>', tags: JSON.stringify(['القلق', 'الصحة النفسية', 'CBT']), category: 'مقالات عامة', authorId: drSara.id, publishedAt: new Date('2026-01-15') } });

  await prisma.article.create({ data: { slug: 'addiction-recovery-phases', title: 'مراحل التعافي من الإدمان: دليلك الشامل', excerpt: 'تعرف على المراحل الخمس للتعافي والتحديات في كل مرحلة.', contentRichText: '<h2>مراحل التعافي</h2><p>التعافي ليس خطاً مستقيماً، بل هو رحلة تتطلب الصبر والمثابرة.</p><h2>المرحلة الأولى: ما قبل التأمل</h2><p>في هذه المرحلة لا يدرك الشخص وجود مشكلة.</p><h2>المرحلة الثانية: التأمل</h2><p>يبدأ الشخص في التفكير في إمكانية التغيير.</p>', tags: JSON.stringify(['الإدمان', 'التعافي', 'الصحة النفسية']), category: 'علاج الإدمان', authorId: drAhmed.id, publishedAt: new Date('2026-02-01') } });

  await prisma.article.create({ data: { slug: 'child-development-milestones', title: 'المحطات التطورية للأطفال: متى يجب القلق؟', excerpt: 'دليل للأهل والمختصين حول مراحل التطور الطبيعي وعلامات الخطر.', contentRichText: '<h2>التطور الطبيعي</h2><p>كل طفل فريد في معدل نموه، لكن هناك محطات أساسية يجب مراقبتها.</p><h2>علامات تستدعي الانتباه</h2><p>تأخر الكلام بعد عمر سنتين، صعوبة التفاعل الاجتماعي، أو السلوكيات المتكررة.</p>', tags: JSON.stringify(['أطفال', 'نمو', 'تشخيص']), category: 'علم نفس الأطفال', authorId: drKhaled.id, publishedAt: new Date('2026-02-15') } });

  await prisma.article.create({ data: { slug: 'burnout-therapists', title: 'الاحتراق النفسي للمعالجين: كيف تحمي نفسك؟', excerpt: 'مقال موجه للممارسين عن كيفية الحفاظ على صحتهم النفسية.', contentRichText: '<h2>ظاهرة الاحتراق</h2><p>المعالجون النفسيون معرضون بشكل خاص للاحتراق النفسي بسبب طبيعة عملهم.</p><h2>استراتيجيات الوقاية</h2><p>الإشراف المنتظم، الحدود المهنية، والرعاية الذاتية هي أساس الوقاية.</p>', tags: JSON.stringify(['احتراق نفسي', 'ممارسين', 'رعاية ذاتية']), category: 'تطوير مهني', authorId: drSara.id, publishedAt: new Date('2026-02-20') } });

  // Tools
  await prisma.interactiveTool.create({ data: { slug: 'cbt-worksheets', title: 'حزمة أوراق عمل CBT', description: 'مجموعة متكاملة من 20 ورقة عمل للمعالج المعرفي السلوكي تشمل سجل الأفكار وخطط العلاج.', type: 'PDF', categories: JSON.stringify(['CBT', 'أدوات الممارس']), priceView: 200, priceDownload: 500, published: true } });
  await prisma.interactiveTool.create({ data: { slug: 'anxiety-scale', title: 'مقياس القلق BAI', description: 'النسخة العربية المعتمدة من مقياس بيك للقلق مع دليل التصحيح والتفسير.', type: 'PDF', categories: JSON.stringify(['مقاييس', 'القلق']), priceView: 150, priceDownload: 300, published: true } });
  await prisma.interactiveTool.create({ data: { slug: 'depression-scale', title: 'مقياس الاكتئاب BDI-II', description: 'مقياس بيك للاكتئاب - الإصدار الثاني مع دليل شامل للاستخدام الإكلينيكي.', type: 'PDF', categories: JSON.stringify(['مقاييس', 'الاكتئاب']), priceView: 150, priceDownload: 350, published: true } });
  await prisma.interactiveTool.create({ data: { slug: 'treatment-planner', title: 'منظم خطط العلاج التفاعلي', description: 'أداة تفاعلية لإنشاء وتنظيم خطط العلاج بشكل احترافي.', type: 'HTML', categories: JSON.stringify(['أدوات الممارس', 'تخطيط']), priceView: 300, priceDownload: 600, published: true } });

  // Purchases (to show in financials)
  const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  await prisma.purchase.create({ data: { userId: user1.id, type: 'COURSE', itemId: course1.id, amount: 1200, currency: 'EGP', status: 'APPROVED', paymentMethod: 'VODAFONE_CASH', createdAt: pastDate(30) } });
  await prisma.purchase.create({ data: { userId: user2.id, type: 'COURSE', itemId: course2.id, amount: 2000, currency: 'EGP', status: 'APPROVED', paymentMethod: 'INSTAPAY', createdAt: pastDate(20) } });
  await prisma.purchase.create({ data: { userId: user3.id, type: 'COURSE', itemId: course1.id, amount: 1200, currency: 'EGP', status: 'PENDING', paymentMethod: 'VODAFONE_CASH', createdAt: pastDate(5) } });
  await prisma.purchase.create({ data: { userId: user4.id, type: 'COURSE', itemId: course3.id, amount: 1800, currency: 'EGP', status: 'PENDING', paymentMethod: 'INSTAPAY', createdAt: pastDate(2) } });
  await prisma.purchase.create({ data: { userId: user1.id, type: 'COURSE', itemId: course2.id, amount: 2000, currency: 'EGP', status: 'APPROVED', paymentMethod: 'VODAFONE_CASH', createdAt: pastDate(15) } });

  // Forum
  const cat1 = await prisma.forumCategory.create({ data: { name: 'نقاشات عامة' } });
  const cat2 = await prisma.forumCategory.create({ data: { name: 'حالات إكلينيكية' } });
  await prisma.forumCategory.create({ data: { name: 'أسئلة وأجوبة' } });
  await prisma.forumCategory.create({ data: { name: 'موارد ومراجع' } });

  const thread1 = await prisma.thread.create({ data: { categoryId: cat1.id, authorId: user1.id, title: 'ما رأيكم في فعالية EMDR مقارنة بـ CBT في علاج PTSD؟', body: 'أود معرفة تجاربكم العملية مع كلا النهجين.', tags: JSON.stringify(['EMDR', 'CBT', 'PTSD']) } });
  await prisma.comment.create({ data: { threadId: thread1.id, authorId: drSaraUser.id, body: 'من خبرتي السريرية، كلاهما فعال ولكن EMDR يعطي نتائج أسرع في بعض الحالات.' } });
  await prisma.comment.create({ data: { threadId: thread1.id, authorId: drAhmedUser.id, body: 'أتفق مع د. سارة، لكن أضيف أن اختيار النهج يعتمد على طبيعة الصدمة وتفضيل المريض.' } });

  const thread2 = await prisma.thread.create({ data: { categoryId: cat2.id, authorId: user2.id, title: 'حالة: مراهق 16 سنة يعاني من رهاب اجتماعي شديد', body: 'أحتاج استشارتكم في خطة العلاج المناسبة لحالة رهاب اجتماعي عند مراهق.', tags: JSON.stringify(['رهاب اجتماعي', 'مراهقين', 'خطة علاج']) } });
  await prisma.comment.create({ data: { threadId: thread2.id, authorId: drKhaledUser.id, body: 'أنصح بالبدء بالعلاج المعرفي السلوكي مع تدريب على المهارات الاجتماعية.' } });

  // Audit Logs
  await prisma.auditLog.create({ data: { actorId: admin.id, action: 'SEED_DATABASE', entityType: 'System', createdAt: new Date() } });

  console.log('Database seeded successfully! ✅');
  console.log('Admin: admin@psychoclub.space / admin123');
  console.log('Doctor: ahmed@psychoclub.space / admin123');
  console.log('Doctor: sara@psychoclub.space / admin123');
  console.log('User: mohamed@example.com / user123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
