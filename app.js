const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');
const userRouter = require('./routes/userRouter');
const wishlistRoutes = require('./routes/wishlistRoutes');
const app = express();
const allowedOrigins = [
  'http://localhost:5173', // Local Vite dev
  process.env.CLIENT_URL,  // Deployed frontend URL
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, 
    allowedHeaders:['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/wishlist', wishlistRoutes);
module.exports = app;