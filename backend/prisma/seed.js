import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import prisma from "../src/services/prisma.js";

dotenv.config();

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding");
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash, role: "admin", isActive: true },
    create: { email: ADMIN_EMAIL.toLowerCase(), passwordHash, role: "admin" },
  });
  console.log(`Admin account ready: ${ADMIN_EMAIL}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
