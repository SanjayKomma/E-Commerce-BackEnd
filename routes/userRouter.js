const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const { updateProfile, addAddress, changePassword } = require('../controllers/userController');
const userRouter = express.Router();
userRouter.use(isAuthenticated);
userRouter.put('/profile', updateProfile);
userRouter.post('/address', addAddress);
userRouter.put('/password', changePassword);
module.exports = userRouter;