const dotenv = require('dotenv');
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
// const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
const ENV = process.env.NODE_ENV || process.env.ENV || 'development';
module.exports = {
    MONGODB_URI,
    PORT,
    JWT_SECRET,
    SALT_ROUNDS,
    ENV
};