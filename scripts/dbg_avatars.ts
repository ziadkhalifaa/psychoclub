
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        where: { published: true },
        include: {
            instructor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    console.log('COURSE DATA:');
    courses.forEach(c => {
        console.log(`Title: ${c.title}`);
        console.log(`Instructor: ${c.instructor.user.name}`);
        console.log(`User Avatar: ${c.instructor.user.avatar}`);
        console.log(`Doctor Photo: ${c.instructor.photo}`);
        console.log('---');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
