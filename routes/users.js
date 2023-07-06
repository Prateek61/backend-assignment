/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 */

const express = require('express');
const { PrismaClient } = require("@prisma/client");
const { hashPassword, auth } = require('../utils/auth.js');
const { getPagination } =  require('../utils/utils.js');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user and returns the created user object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *             required:
 *               - email
 *               - password
 *               - name
 *     responses:
 *       201:
 *         description: User created successfully. Returns the created user object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid or missing email/password/name fields.
 *       409:
 *         description: Conflict. User already exists.
 */
router.post('/', async (req, res) => {
    let email, password, name;
    try {
        email = req.body.email;
        password = req.body.password;
        name = req.body.name;
    } catch (error) {
        console.error("Error getting user info from request:", error);
        res.status(400).json({ error: "email, name and password fields are required" });
        return;
    }

    if (!email || !password || !name) {
        res.status(400).json({ error: "email, name and password fields are required" });
        return;
    }

    let user;

    try {
        user = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: await hashPassword(password)
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(409).json({ error: "User already exists" });
        return;
    }

    // remove password from response
    delete user.password;

    res.status(201).json(user);
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (paginated)
 *     description: Retrieves all users in a paginated format.
 *     parameters:
 *       - in: query
 *         name: page
 *         default: 1
 *         schema:
 *           type: integer
 *         description: The page number.
 *       - in: query
 *         name: limit
 *         default: 10
 *         schema:
 *           type: integer
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid page or limit values.
 */
router.get('/', getPagination, async (req, res) => {
    // select id, name, email from user
    let users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email:true
        },
        skip: (req.page - 1) * req.limit,
        take: req.limit
    });

    res.status(200).json(users);
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user
 *     description: Retrieves the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized. User token is missing or invalid.
 */
router.get('/me', auth, async (req, res) => {
    // remove password from response
    delete req.user.password;
    res.json(req.user);
});

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update the authenticated user
 *     description: Updates the authenticated user and returns the updated user object.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The new email of the user.
 *               password:
 *                 type: string
 *                 description: The new password of the user.
 *               name:
 *                 type: string
 *                 description: The new name of the user.
 *             required:
 *               - email
 *               - password
 *               - name
 *     responses:
 *       200:
 *         description: User updated successfully. Returns the updated user object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid or missing email/password/name fields.
 *       401:
 *         description: Unauthorized. User token is missing or invalid.
 */
router.put('/me', auth, async (req, res) => {
    const id = req.user.id;
    let email, password, name;
    try {
        email = req.body.email;
        password = req.body.password;
        name = req.body.name;
    } catch (error) {
        console.error("Error getting user info from request:", error);
        res.status(400).json({ error: "email, name and password fields are required" });
        return;
    }

    if (!email || !password || !name) {
        res.status(400).json({ error: "email, name and password fields are required" });
        return;
    }

    let user;
    try {
        user = await prisma.user.update({
            select: {
                id: true,
                name: true,
                email: true
            },
            where: {
                id: id
            },
            data: {
                email: email,
                name: name,
                password: await hashPassword(password)
            }
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(400).json({ error: "User not found" });
        return;
    }

    // remove password from response
    delete user.password;

    res.status(200).json(user);
});

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete the authenticated user
 *     description: Deletes the authenticated user and returns the deleted user object.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully. Returns the deleteduser object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized. User token is missing or invalid.
 */
router.delete('/me', auth, async (req, res) => {
    const id = req.user.id;

    let user;
    try {
        user = await prisma.user.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(400).json({ error: "User not found" });
        return;
    }

    // remove password from response
    delete user.password;

    res.status(200).json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieves a user by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid user ID.
 */
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(400).json({ error: "User not found" });
        return;
    }

    if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
    }

    res.status(200).json(user);
});

module.exports = router;
