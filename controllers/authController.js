const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const { SALT_ROUNDS } = require('../utils/config.js');
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
            return response.status(201).json({message: 'User created successfully'});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error});
        }
    }
};
module.exports = authController;