import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("Checking database connection...");
    const userCount = await prisma.user.count();
    console.log(`Connection successful! Total users: ${userCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

check();
