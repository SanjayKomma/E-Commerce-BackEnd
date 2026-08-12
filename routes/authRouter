const { isAuthenticated } = require('../middlewares/auth');

const { register, Login, Logout, GetProfile} = require('../controllers/authController');

const express = require('express');
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', Login);
authRouter.post('/logout',isAuthenticated, Logout);
authRouter.get('/profile',isAuthenticated, GetProfile);
module.exports = authRouter;