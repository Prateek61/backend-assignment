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

function parsePeriod(period, startDate) {
  const currentDate = new Date();
  let startDateObj, endDateObj;

  switch (period) {
    case 'day':
      // get yesterday
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);

      startDateObj = startDate ? new Date(startDate) : yesterday;
      endDateObj = new Date(startDateObj);
      endDateObj.setDate(endDateObj.getDate() + 1);
      break;
    case 'week':
      const firstDayOfWeek = startDate ? new Date(startDate) : new Date(currentDate);
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
      startDateObj = firstDayOfWeek;
      endDateObj = lastDayOfWeek;
      break;
    case 'month':
      const firstDayOfMonth = startDate
        ? new Date(startDate)
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      startDateObj = firstDayOfMonth;
      endDateObj = lastDayOfMonth;
      break;
    case 'year':
      const firstDayOfYear = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);
      startDateObj = firstDayOfYear;
      endDateObj = lastDayOfYear;
      break;
    default:
      startDateObj = null;
      endDateObj = null;
      break;
  }

  console.log('startDateObj', startDateObj);
  console.log('endDateObj', endDateObj);
  return { startDate: startDateObj, endDate: endDateObj };
}





module.exports = {
  getPagination,
  getUserById,
  getProductById,
  parsePeriod
};
