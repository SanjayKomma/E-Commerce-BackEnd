const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../utils/config.js');
const User = require('../models/user.js');
const isAuthenticated = (request, response, next) => {
    const token = request.cookies?.token;
    if(!token){
        return response.status(401).json({message: 'User not authenticated'});
    }
    try{
        const verifyUser = jwt.verify(token, JWT_SECRET);
        const userId = verifyUser.userId;
        request.userId = userId;
        next();
    }
    catch(error){
        return response.status(401).json({error : error});
    }
}
const allowRoles = (roles) => {
    return async(request, response, next) => {
        const userId = request.userId;
        const user = await User.findById(userId);
        if(!user){
            return response.status(401).json({message: 'User not found'});
        }
        if(!roles.includes(user.role)){
            return response.status(401).json({message: 'forbidden user is not allowed'});
        }
        request.user = user;
        next();
    }
}
module.exports = {
    isAuthenticated,
    allowRoles
};