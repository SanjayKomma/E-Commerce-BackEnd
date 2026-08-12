const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRouter');
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
module.exports = app;