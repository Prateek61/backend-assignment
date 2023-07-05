const express = require('express');
const app = express();
const userRouter = require('./routes/users');
const productRouter = require('./routes/products')
const reportRouter = require('./routes/reports')
const orderRouter = require('./routes/orders')
const authRouter = require('./routes/auth')

app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/reports', reportRouter);
app.use('/orders', orderRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(3000)
