import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("Tsani182", 10);
  let find = await prisma.roles.findFirst({ where: { name: "Developer" } });
  if (!find) {
    find = await prisma.roles.create({
      data: {
        name: "Developer",
        description: "Role untuk manajemen semua data",
        permissions: JSON.stringify([
          { name: "Dashboard", path: "/dashboard", access: ["read"] },
          {
            name: "Roles Management",
            path: "/roles",
            access: ["read", "write", "update", "delete"],
          },
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  const config = await prisma.appsConfig.findMany();
  if (config.length === 0) {
    await prisma.appsConfig.create({
      data: {
        lateDeduction: 10000,
        fastLeaveDeduction: 5000,
        alphaDeduction: 50000,
        shiftStart: 8,
        shiftEnd: 17,
        tolerance: 5,
      },
    });
  }
  let pos = await prisma.positions.findFirst({ where: { name: "Developer" } });
  if (!pos) {
    pos = await prisma.positions.create({
      data: {
        name: "Developer",
        description: null,
        allowance: 0,
        allowanceType: "NOMINAL",
      },
    });
  }
  await prisma.users.upsert({
    where: { username: "developer" },
    update: {},
    create: {
      name: "DEVELOPER",
      username: "developer",
      password: pass,
      email: "developer@gmail.com",
      phone: "08",
      nip: "00101102025",
      face: null,
      principalSalary: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rolesId: find.id,
      positionsId: pos.id,
    },
  });

  console.log("Seeding succeesfully...");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
