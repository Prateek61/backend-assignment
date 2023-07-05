const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("./utils/auth.js");

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create users
    const users = [
      {
        email: "super@super.com",
        name: "Super User",
        password: await hashPassword("super"),
        isAdmin: true,
      },
      {
        email: "user1@example.com",
        name: "User 1",
        password: await hashPassword("password1"),
      },
      {
        email: "user2@example.com",
        name: "User 2",
        password: await hashPassword("password2"),
      },
      {
        email: "user3@example.com",
        name: "User 3",
        password: await hashPassword("password3"),
      },
      {
        email: "user4@example.com",
        name: "User 4",
        password: await hashPassword("password4"),
      },
    ];

    for (const user of users) {
      await prisma.user.create({
        data: user
      });
    }

    console.log(`Seeded ${users.length} users successfully.`);
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
