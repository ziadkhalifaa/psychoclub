import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            createdAt: true,
            published: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 5
    });

    console.log(JSON.stringify(courses, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
