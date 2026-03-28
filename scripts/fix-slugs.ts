import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixSlugs() {
  console.log("Checking Courses for missing slugs...");
  const courses = await prisma.course.findMany({
    where: { 
      OR: [
        { slug: null },
        { slug: "" }
      ]
    }
  });
  console.log(`Found ${courses.length} courses with missing slugs.`);

  for (const course of courses) {
    let slug = course.title.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!slug || slug === "") {
      slug = `course-${course.id.substring(0, 8)}`;
    }
    
    await prisma.course.update({
      where: { id: course.id },
      data: { slug: slug }
    });
    console.log(`Updated course ${course.id} with slug: ${slug}`);
  }

  console.log("Checking Articles for missing slugs...");
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: "" }
      ]
    }
  });
  console.log(`Found ${articles.length} articles with missing slugs.`);

  for (const article of articles) {
    let slug = article.title.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!slug || slug === "") {
      slug = `article-${article.id.substring(0, 8)}`;
    }
    
    await prisma.article.update({
      where: { id: article.id },
      data: { slug: slug }
    });
    console.log(`Updated article ${article.id} with slug: ${slug}`);
  }

  console.log("Done.");
}

fixSlugs()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
