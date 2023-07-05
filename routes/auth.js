const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
// import functions from utils/auth.js
const { hashPassword, comparePassword, generateJWT, verifyJWT } = require('../utils/auth.js');

const prisma = new PrismaClient();


router.post('/login', async (req, res) => {
    // parse email, password from request body
    let email, password;
    try {
        email = req.body.email;
        password = req.body.password;
    } catch (error) {
        console.error("Error parsing request body:", error);
        res.status(400).json({ message: "email and password fields are required" });
        return;
    }

    if (!email || !password) {
        res.status(400).json({ message: "email and password fields are required" });
        return;
    }

    // search for user in database
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    // compare password with hashed password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    // generate JWT
    const token = generateJWT(user);

    // return JWT to user
    res.status(200).json({ token: token });
})

module.exports = router;