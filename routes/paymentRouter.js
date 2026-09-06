const express = require('express');
const paymentController = require('../controllers/paymentController');
const { createOrder , verifyPayment} = paymentController;
const { isAuthenticated } = require('../middlewares/auth');
const paymentRouter = express.Router();
paymentRouter.post('/create-order', isAuthenticated, createOrder);
paymentRouter.post('/verify', isAuthenticated, verifyPayment);
module.exports = paymentRouter;