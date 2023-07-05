const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const userRouter = require('./routes/users');
const productRouter = require('./routes/products')
const reportRouter = require('./routes/reports')
const orderRouter = require('./routes/orders')
const authRouter = require('./routes/auth')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
