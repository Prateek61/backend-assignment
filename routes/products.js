/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the product.
 *         name:
 *           type: string
 *           description: The name of the product.
 *         price:
 *           type: number
 *           description: The price of the product.
 *         description:
 *           type: string
 *           description: The description of the product.
 *         isAvailable:
 *           type: boolean
 *           description: Indicates whether the product is available.
 */

const express = require('express');
const { PrismaClient } = require("@prisma/client");
const { auth, admin } = require('../utils/auth.js');
const { getPagination } = require('../utils/utils.js');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieves all products.
 *     parameters:
 *       - name: availableOnly
 *         in: query
 *         description: Filter products by availability (true/false).
 *         default: true
 *         schema:
 *           type: boolean
 *       - name: page
 *         in: query
 *         description: Page number.
 *         default: 1
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Maximum number of items in response.
 *         default: 10
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Invalid availableOnly parameter.
 *       500:
 *         description: Internal server error.
 */
router.get('/', getPagination, async (req, res) => {
    let availableOnly = req.query.availableOnly || true;

    try {
        // Convert availableOnly to boolean
        availableOnly = JSON.parse(availableOnly);
    } catch (error) {
        console.error("Error parsing availableOnly:", error);
        res.status(400).json({ error: "Invalid availableOnly" });
        return;
    }

    const whereClause = availableOnly ? { isAvailable: true } : {};

    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                description: true
            },
            where: whereClause,
            skip: (req.page - 1) * req.limit,
            take: req.limit
        });
        res.json(products);
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product
 *     description: Creates a new product.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */
router.post('/', auth, admin, async (req, res) => {
    const { name, price, description, isAvailable } = req.body;

    if (!name || !price || !description || !isAvailable) {
        res.status(400).json({ error: "name, price, description, and isAvailable fields are required" });
        return;
    }

    try {
        const parsedPrice = parseFloat(price);
        const parsedIsAvailable = JSON.parse(isAvailable);

        const product = await prisma.product.create({
            data: {
                name: name,
                price: parsedPrice,
                description: description,
                isAvailable: parsedIsAvailable
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieves a product by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Invalid product ID.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
    }

    try {
        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        res.json(product);
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     description: Updates an existing product by its ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id', auth, admin, async (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, price, description, isAvailable } = req.body;

    if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
    }

    if (!name || !price || !description || !isAvailable) {
        res.status(400).json({ error: "name, price, description, and isAvailable fields are required" });
        return;
    }
    try {
        const parsedPrice = parseFloat(price);
        const parsedIsAvailable = JSON.parse(isAvailable);

        const product = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: name,
                price: parsedPrice,
                description: description,
                isAvailable: parsedIsAvailable
            }
        });

        res.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Deletes a product by its ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Invalid product ID.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', auth, admin, async (req, res) => {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
    }

    try {
        const product = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                isAvailable: false
            }
        });

        res.json(product);
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
