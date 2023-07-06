const express = require('express');
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', (req, res) => {
    res.send('Hello Reports')
})

module.exports = router;