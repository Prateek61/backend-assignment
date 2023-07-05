const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Function to hash user's password
async function hashPassword(password) {
    const saltRounds = 10; // Number of salt rounds for bcrypt (higher is more secure)

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Error hashing password");
    }
}

// Function to compare user's password to hashed password
async function comparePassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        console.log("Password match:", match);
        return match;
    } catch (error) {
        console.error("Error comparing password:", error);
        throw new Error("Error comparing password");
    }
}

// Function to generate JWT with no expiration date
function generateJWT(user) {
    const secret = process.env.JWT_SECRET;
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username
    };

    try {
        const token = jwt.sign(payload, secret);
        return token;
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating JWT");
    }
}

// Function to verify JWT and return the auth user
function verifyJWT(token) {
    const secret = process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secret);
        // search for user in database
        const user = prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                username: true
            }
        });
    } catch (error) {
        console.error("Error verifying JWT:", error);
        throw new Error("Error verifying JWT");
    }
}

// middleware function to check if user is authenticated
async function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "No authorization header found" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // search for user in database
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });
        next();
    } catch (error) {
        console.error("Error verifying JWT:", error);
        res.status(401).json({ error: "Invalid token" });
    }
}

// middleware function to check if user is the admin, assumes auth middleware has already been called
function admin(req, res, next) {
    if (req.user.role !== "admin") {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }

    next();
}

module.exports = {
    hashPassword,
    comparePassword,
    generateJWT,
    verifyJWT,
    auth
};
