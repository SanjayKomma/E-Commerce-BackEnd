const dotenv = require('dotenv');
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = process.env.SALT_ROUNDS;
module.exports = {
    MONGODB_URI,
    PORT,
    HOST,
    JWT_SECRET,
    SALT_ROUNDS
};