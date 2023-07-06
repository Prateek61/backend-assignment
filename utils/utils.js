const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Middleware to get pagination info from query string
function getPagination(req, res, next) {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1 || isNaN(page)) {
    page = 1;
  }
  if (limit < 1 || isNaN(limit)) {
    limit = 10;
  }

  req.page = page;
  req.limit = limit;

  next();
}

// Async function to get user by id
async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

// Async function to get product by id
async function getProductById(id) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    return product;
  } catch (error) {
    console.error("Error getting product:", error);
    return null;
  }
}

module.exports = {
  getPagination,
  getUserById,
  getProductById
};
