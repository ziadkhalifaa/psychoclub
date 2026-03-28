import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixSlugs() {
  console.log("Checking Courses...");
  const courses = await prisma.course.findMany();
  for (const c of courses) {
    if (!c.slug || c.slug.trim() === "") {
      const newSlug = c.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      await prisma.course.update({
        where: { id: c.id },
        data: { slug: newSlug || `course-${c.id.slice(0, 5)}` }
      });
      console.log(`Fixed Course: ${c.title} -> ${newSlug}`);
    }
  }

  console.log("Checking Articles...");
  const articles = await prisma.article.findMany();
  for (const a of articles) {
    if (!a.slug || a.slug.trim() === "") {
      const newSlug = a.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      await prisma.article.update({
        where: { id: a.id },
        data: { slug: newSlug || `article-${a.id.slice(0, 5)}` }
      });
      console.log(`Fixed Article: ${a.title} -> ${newSlug}`);
    }
  }
  console.log("Done.");
}

fixSlugs().catch(console.error).finally(() => prisma.$disconnect());
