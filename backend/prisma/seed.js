import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import prisma from "../src/services/prisma.js";

dotenv.config();

// Must match the pepper logic in your auth controller
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER;
if (!PASSWORD_PEPPER) throw new Error("PASSWORD_PEPPER must be set in .env");

function applyPepper(password) {
  return password + PASSWORD_PEPPER;
}

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding");
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  // Apply pepper before hashing
  const passwordHash = await bcrypt.hash(applyPepper(ADMIN_PASSWORD), 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash, role: "admin", isActive: true },
    create: { email: ADMIN_EMAIL.toLowerCase(), passwordHash, role: "admin", isActive: true, firstName: "Admin", lastName: "User", phone: "0000000000" },
  });

  console.log(`Admin account ready: ${ADMIN_EMAIL}`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());