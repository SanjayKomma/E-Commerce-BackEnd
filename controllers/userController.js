const User = require('../models/user');
const { SALT_ROUNDS } = require('../utils/config');
const bcrypt = require('bcryptjs');
const userController ={
    updateProfile: async (request, response) => {
        try{
            const userId = request.userId;
            const {name, email, phone, address} = request.body;
            const user = await User.findById(userId);
            if(!user){
                return response.status(404).json({message:'User not found'});
            }
            if(name){
                user.name = name;
            }
            if(email){
                user.email = email;
            }
            if(phone){
                user.phone = phone;
            }
            if(address){
                user.address = address;
            }
            await user.save();
            return response.status(200).json({message: 'Profile updated successfully', user});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    addAddress: async (request, response) => {
        try{
            const userId = request.userId;
            const {street, city, ZipCode, country, isDefault} = request.body;
            const user = await User.findById(userId);
            if(!user){
                return response.status(404).json({message:'User not found'});
            }
            if(isDefault){
                user.address.forEach(address => address.isDefault = false);
            }
            user.address.push({
                street,
                city,
                ZipCode,
                country,
                isDefault
            });
            await user.save();
            return response.status(200).json({message:'Address added successfully', user});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    changePassword: async (request, response) => {
        try{
            const userId = request.userId;
            const {oldPassword, newPassword} = request.body;
            const user = await User.findById(userId);
            if(!user){
                return response.status(404).json({message:'User not found'});
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if(!isMatch){
                return response.status(400).json({message:'Old password is incorrect'});
            }
            user.password = await bcrypt.hash(newPassword, parseInt(SALT_ROUNDS));
            await user.save();
            return response.status(200).json({message:'Password changed successfully', user});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    }
}
module.exports = userController;