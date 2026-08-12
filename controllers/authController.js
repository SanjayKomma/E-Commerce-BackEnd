const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const { SALT_ROUNDS, JWT_SECRET, ENV } = require('../utils/config.js');
const authController = {
    register: async(request, response) => {
        try{
            const {name, email, password} = request.body;
            const existingUser = await User.findOne({email});
            if(existingUser){
                return response.status(400).json({message: 'User already exists'});
            }
            const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS));
            const user = new User({name, email, password: hashedPassword});
            await user.save();
            return response.status(201).json({message: 'User created successfully', user:user});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error});
        }
    },
    Login: async(request, response) =>{
        try{
            const {email, password} = request.body;
            const user = await User.findOne({email});
            if(!user){
                return response.status(400).json({message: 'User not found'});
            }
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if(!isPasswordCorrect){
                return response.status(400).json({message: 'Incorrect password'});
            }
            const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1h'});
            response.cookie('token', token, {
                httpOnly: true,
                secure : ENV === 'production',
                sameSite : ENV === 'production' ? 'none' : 'lax',
                maxAge : 3600000
            });
            return response.status(200).json({message: 'Login successful'});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error});
        }
    },
    GetProfile: async(request, response) => {
        try{
            const token = request.cookies.token;
            if(!token){
                return response.status(401).json({message: 'User not authenticated'});
            }
            const verifyUser = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(verifyUser.userId).select('-password', '-__v');
            return response.status(200).json({message: 'User profile fetched successfully', user: user});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error});
        }
    },
    Logout: async(request, response) => {
        try{
            response.clearCookie('token',{
                httpOnly: true,
                secure : ENV === 'production',
                sameSite : ENV === 'production' ? 'none' : 'lax'
            });
            return response.status(200).json({message: 'Logout successful'});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error});
        }
    }
};
module.exports = authController;