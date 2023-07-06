const express = require('express');
const { PrismaClient } = require("@prisma/client");
const { auth, admin } = require('../utils/auth.js');
const { parsePeriod } = require('../utils/utils.js');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /reports/sales/period:
 *   get:
 *     summary: Generate Sales Report by Period
 *     description: Generates a sales report with total sales by day, week, month, or year.
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         description: The period to generate the sales report (day, week, month, or year).
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *       - in: query
 *         name: start
 *         description: The start date for the sales data in the format YYYY-MM-DD. If not provided, it will default current date minus period.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns the sales report containing the period, start date, end date, and total sales amount for the specified period.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   description: The period for the sales report (day, week, month, or year).
 *                 startDate:
 *                   type: string
 *                   description: The start date used for generating the sales report.
 *                 endDate:
 *                   type: string
 *                   description: The end date for the sales report.
 *                 totalSales:
 *                   type: number
 *                   description: The total sales amount for the specified period.
 *       400:
 *         description: Bad request. Invalid or missing period parameter.
 */
router.get('/sales/period', async (req, res) => {
    const { period, start } = req.query;

    if (!period) {
        return res.status(400).json({ error: 'Missing period parameter.' });
    }

    const { startDate, endDate } = parsePeriod(period, start);
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Invalid period or date parameter.' });
    }

    // for all orders, sum the price of its order products
    const totalSales = await prisma.productOrder.aggregate({
        _sum: {
            price: true
        },
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }
    })

    // Also select the most popular product
    const mostPopularProduct = await prisma.productOrder.aggregate({
        _count: {
            productId: true
        },
        _sum: {
            price: true
        },
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            productId: 'desc'
        }
    })        

    return res.status(200).json({
        period: period,
        startDate: startDate,
        endDate: endDate,
        totalSales: totalSales._sum.price,
        mostPopularProduct: {
            productId: mostPopularProduct._count.productId,
            totalSales: mostPopularProduct._sum.price
        }
    });
})

/**
 * @swagger
 * /reports/sales/daterange:
 *   get:
 *     summary: Get total sales within a date range
 *     description: Retrieve the total sales within a specified date range.
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         description: The start date of the date range (YYYY-MM-DD).
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: endDate
 *         description: The end date of the date range (YYYY-MM-DD).
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Successful operation. Returns the total sales within the specified date range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                   description: The total sales within the specified date range.
 *       400:
 *         description: Bad request. Invalid or missing parameters.
 *       500:
 *         description: Internal server error. Failed to retrieve total sales.
 */
router.get('/sales/daterange', async (req, res) => {
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Missing date range parameters.' });
    }

    try {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid date range parameters.' });
    }

    // for all orders, sum the price of its order products
    const totalSales = await prisma.productOrder.aggregate({
        _sum: {
            price: true
        },
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }
    })

    // Also select the most popular product
    const mostPopularProduct = await prisma.productOrder.aggregate({
        _count: {
            productId: true
        },
        _sum: {
            price: true
        },
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            productId: 'desc'
        }
    })

    return res.status(200).json({
        period: period,
        startDate: startDate,
        endDate: endDate,
        totalSales: totalSales._sum.price,
        mostPopularProduct: {
            productId: mostPopularProduct._count.productId,
            totalSales: mostPopularProduct._sum.price
        }
    });
});
  

module.exports = router;