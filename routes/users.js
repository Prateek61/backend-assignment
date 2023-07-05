const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { hashPassword, auth } = require('../utils/auth.js');

const prisma = new PrismaClient();

// Register a new user
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
        res.status(400).json({ error: "User alreadt exists" });
        return;
    }

    // remove password from response
    delete user.password;

    res.status(201).json(user);
});

// Get all users (paginated)
router.get('/', async (req, res) => {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    page = parseInt(page);
    limit = parseInt(limit);

    // select id, name, email from user
    let users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true
        },
        skip: (page - 1) * limit,
        take: limit
    });
    
    res.status(200).json(users);
});

// Operations on the authenticated user
router.route('/me')
    // Get the authenticated user
    .get(auth, async (req, res) => {
        res.json(req.user);
    })
    // Update the authenticated user
    .put(auth, async (req, res) => {
        const id = req.user.id;
        let email, password, name;
        try {
            email = req.body.email;
            password = req.body.password;
            name = req.body.name;
        }
        catch (error) {
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
        }
        catch (error) {
            console.error("Error updating user:", error);
            res.status(400).json({ error: "User not found" });
            return;
        }

        // remove password from response
        delete user.password;

        res.status(200).json(user);
    })
    // Delete the authenticated user
    .delete(auth, async (req, res) => {
        const id = req.user.id;

        let user;
        try {
            user = await prisma.user.delete({
                where: {
                    id: id
                }
            });
        }
        catch (error) {
            console.error("Error deleting user:", error);
            res.status(400).json({ error: "User not found" });
            return;
        }

        // remove password from response
        delete user.password;

        res.status(200).json(user);
    })


// Get a user by id
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
    }
    catch (error) {
        console.error("Error getting user:", error);
        res.status(400).json({ error: "User not found" });
        return;
    }

    if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
    }

    res.status(200).json(user);
})


module.exports = router;