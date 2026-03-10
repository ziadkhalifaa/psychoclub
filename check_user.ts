
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        where: { name: { contains: 'Mustafa' } },
        select: { id: true, name: true, role: true }
    });
    console.log('Found users:', JSON.stringify(users, null, 2));
    process.exit(0);
}
main();
