const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require('./utils/auth.js');

async function seed() {
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: await hashPassword("admin123"),
      isAdmin: true,
    },
  });

  // Create other users
  const users = [];
  for (let i = 1; i <= 6; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        password: await hashPassword(`user${i}123`),
      },
    });
    users.push(user);
  }

  // Create products
  const products = [];
  const productCount = 12
  for (let i = 1; i <= productCount; i++) {
    const product = await prisma.product.create({
      data: {
        name: `Product ${i}`,
        description: `Description for Product ${i}`,
        price: getRandomFloat(10, 100),
      },
    });
    products.push(product);
  }

  // Create orders
  const orders = [];
  const orderCount = 35
  for (let i = 1; i <= orderCount; i++) {
    const randomUser = users[getRandomInt(0, users.length - 1)];
    const randomProduct = products[getRandomInt(0, products.length - 1)];
    const order = await prisma.productOrder.create({
      data: {
        userId: randomUser.id,
        productId: randomProduct.id,
      },
    });
    orders.push(order);
  }

  console.log("Seeding completed successfully!");
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
