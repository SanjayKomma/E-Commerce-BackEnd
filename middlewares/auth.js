const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config.js');
const User = require('../models/user.js');

const isAuthenticated = async (request, response, next) => {
    try {
        let token = request.cookies?.token;

        if (!token && request.headers.authorization?.startsWith('Bearer')) {
            token = request.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return response.status(401).json({ message: 'User not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password -__v');

        if (!user) {
            return response.status(401).json({ message: 'User not found' });
        }

        request.userId = user._id;
        request.user = user;
        next();
    } catch (error) {
        return response.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
};

const allowRoles = (...roles) => {
    const allowed = roles.flat();
    return (request, response, next) => {
        if (!request.user) {
            return response.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(request.user.role)) {
            return response.status(403).json({
                message: `Forbidden: role '${request.user.role}' is not allowed to perform this action`
            });
        }

        next();
    };
};

module.exports = {
    isAuthenticated,
    allowRoles
};