const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create users
    const users = [
      {
        email: "user1@example.com",
        name: "User 1",
        password: "password1",
      },
      {
        email: "user2@example.com",
        name: "User 2",
        password: "password2",
      },
      {
        email: "user3@example.com",
        name: "User 3",
        password: "password3",
      },
      {
        email: "user4@example.com",
        name: "User 4",
        password: "password4",
      },
    ];

    for (const user of users) {
      await prisma.user.create({
        data: user,
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
