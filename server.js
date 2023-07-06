const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const userRouter = require('./routes/users');
const productRouter = require('./routes/products')
const reportRouter = require('./routes/reports')
const orderRouter = require('./routes/orders')
const authRouter = require('./routes/auth')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node.js API with Prisma and Swagger',
            version: '0.1.0',
        
        },
    },
    apis: ['./routes/*.js'],
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)))

app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/reports', reportRouter);
app.use('/orders', orderRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    console.log(req.body)
    res.send('Hello World')
})

app.listen(3000)
