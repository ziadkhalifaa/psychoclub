
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const categories = [
        'العلاج المعرفي السلوكي',
        'التقييم والتشخيص',
        'علاج الإدمان',
        'حالات إكلينيكية',
        'أدوات ومقاييس'
    ];

    for (const name of categories) {
        await prisma.forumCategory.upsert({
            where: { id: name }, // This is a hack because name isn't unique in schema, but for seeding it's fine if we just check by name
            update: {},
            create: { name }
        }).catch(async () => {
            // if id doesn't exist, try to find by name
            const exists = await prisma.forumCategory.findFirst({ where: { name } });
            if (!exists) {
                await prisma.forumCategory.create({ data: { name } });
            }
        });
    }
    console.log('Categories seeded successfully');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
