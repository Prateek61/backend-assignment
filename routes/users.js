const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        console.log(req.body);
        console.log(email, name, password);
        const user = await prisma.user.create({
        data: {
            email: email,
            name: name,
            password: password,
        },
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = router;