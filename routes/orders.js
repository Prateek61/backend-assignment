const express = require('express');
const { PrismaClient } = require("@prisma/client");
const { getPagination, getProductById, getUserById } = require('../utils/utils.js');
const { auth, admin } = require('../utils/auth.js');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the order.
 *         productId:
 *           type: integer
 *           description: The ID of the product associated with the order.
 *         userId:
 *           type: integer
 *           description: The ID of the user who placed the order.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the order was created.
 *       required:
 *         - productId
 *         - userId
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's orders (paginated)
 *     description: Retrieves a list of orders placed by the authenticated user with pagination support.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of orders per page
 *         default: 10
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error.
 */
router.get('/', auth, getPagination, async (req, res) => {
    try {
        const orders = await prisma.productOrder.findMany({
            where: {
                userId: req.user.id
            },
            skip: (req.page - 1) * req.limit,
            take: req.limit
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order with the provided product ID.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/', auth, async (req, res) => {
    const productId = parseInt(req.body.productId);

    if (!productId) {
        res.status(400).json({ error: "productId field is required" });
        return;
    }

    try {
        const product = await getProductById(productId);

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        const order = await prisma.productOrder.create({
            data: {
                product: {
                    connect: {
                        id: productId
                    }
                },
                user: {
                    connect: {
                        id: req.user.id
                    }
                },
                price: product.price
            }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Error creating order" });
    }
});

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders (paginated)
 *     description: Retrieves a list of all orders with pagination support. Admin access required.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of orders per page
 *         default: 10
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: Filter by product ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request. Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/all', auth, admin, getPagination, async (req, res) => {
    let whereClause = {};

    if (req.query.userId) {
        const user = getUserById(req.query.userId);

        if (!user) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }

        whereClause.userId = user.id;
    }

    if (req.query.productId) {
        const product = getProductById(req.query.productId);

        if (!product) {
            res.status(400).json({ error: "Invalid product ID" });
            return;
        }

        whereClause.productId = product.id;
    }

    try {
        const orders = await prisma.productOrder.findMany({
            where: whereClause,
            skip: (req.page - 1) * req.limit,
            take: req.limit
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     description: Retrieves an order by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await prisma.productOrder.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error retrieving order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
