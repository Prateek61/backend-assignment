const express = require('express');
const router = express.Router();

const { getPagination, getProductById, getUserById } = require('../utils/utils.js');
const { auth, admin } = require('../utils/auth.js');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get my orders (paginated)
router.get('/', auth, getPagination, async (req, res) => {
    let orders;
    try {
        orders = await prisma.productOrder.findMany({
            where: {
                userId: req.user.id
            },
            skip: (req.page - 1) * req.limit,
            take: req.limit
        }); 
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ error: "Error getting orders" });
        return;
    }

    res.json(orders);
})

// Create an order
router.post('/', auth, async (req, res) => {
    let productId;
    try {
        productId = parseInt(req.body.productId);
    } catch (error) {
        console.error("Error getting product id from request:", error);
        res.status(400).json({ error: "productId field is required" });
        return;
    }
    if (!productId) {
        res.status(400).json({ error: "productId field is required" });
        return;
    }

    let product = await getProductById(productId);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
    }

    let order;
    try {
        order = await prisma.productOrder.create({
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
                }
            }
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Error creating order" });
        return;
    }

    res.status(201).json(order);
})

// Get all orders (paginated)
router.get('/all', auth, admin, getPagination, async (req, res) => {
    // Filter by user or product
    whereClause = {};
    if (req.query.userId) {
        const user = getUserById(req.query.userId);
        if (!user) {
            res.status(400).json({ error: "error getting user" });
            return;
        }
        whereClause.userId = user.id;
    }
    if (req.query.productId) {
        const product = getProductById(req.query.productId);
        if (!product) {
            res.status(400).json({ error: "error getting product" });
            return;
        }
        whereClause.productId = product.id;
    }


    let orders;
    try {
        orders = await prisma.productOrder.findMany({
            where: whereClause,
            skip: (req.page - 1) * req.limit,
            take: req.limit
        });
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ error: "Error getting orders" });
        return;
    }

    res.json(orders);
})

// Middleware to get an order by id
router.use('/:id', async (req, res, next) => {
    let order;
    try {
        order = await prisma.productOrder.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });
    } catch (error) {
        console.error("Error getting order:", error);
        res.status(500).json({ error: "Error getting order" });
        return;
    }

    if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
    }

    req.order = order;
    next();
})

// Operations on a specific order
router.route('/:id')
    // Get an order
    .get(auth, async (req, res) => {
        res.json(req.order);
    })

module.exports = router;