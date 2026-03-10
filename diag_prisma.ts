
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking forumCategory model in Prisma Client...");
        // @ts-ignore
        if (!prisma.forumCategory) {
            console.error("FAILURE: forumCategory model NOT found in PrismaClient instance.");
        } else {
            // @ts-ignore
            const count = await prisma.forumCategory.count();
            console.log("SUCCESS: forumCategory model exists. Count: " + count);
        }
    } catch (err: any) {
        console.error("PRISMA ERROR:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}
check();
