import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdmin() {
    try {
        const passwordHash = await bcrypt.hash('0123456', 10);
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
            await prisma.user.update({
                where: { id: admin.id },
                data: {
                    email: 'admin@psychoclub.org',
                    passwordHash: passwordHash
                }
            });
            console.log('Admin user updated with new password!');
        } else {
            console.log('No admin found.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
