const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { comparePassword, generateJWT } = require('../utils/auth.js');

const prisma = new PrismaClient();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Logs in a user and returns a JWT token.
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
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successful login. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token.
 *       400:
 *         description: Bad request. Invalid or missing email/password fields.
 *       401:
 *         description: Unauthorized. Invalid credentials.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "email and password fields are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateJWT(user);

    res.status(200).json({ token: token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user" });
  }
});

module.exports = router;
