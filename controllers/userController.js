const User = require('../models/user');
const { SALT_ROUNDS } = require('../utils/config');
const bcrypt = require('bcryptjs');
const userController ={
    getAllUsers: async (request, response) => {
        try{
            const users = await User.find({}).select('-password -__v');
            if(!users){
                return response.status(404).json({message: 'No users found'});
            }
            return response.status(200).json({message: 'All users fetched successfully', users: users});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    updateUserRole: async (request, response) => {
        try{
            const {id} = request.params;
            const {role} = request.body;
            const validRoles = ['admin', 'buyer', 'seller'];
            if(!validRoles.includes(role)){
                return response.status(400).json({message: 'Invalid role'});
            }
            const user = await User.findByIdAndUpdate(id, {role}, {new: true, runValidators: true}).select('-password -__v');
            if(!user){
                return response.status(404).json({message: 'User not found'});
            }
            return response.status(200).json({message: 'User role updated successfully', user});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    deleteUser: async (request, response) => {
        try{
            const {id} = request.params;
            if(id.toString() === request.userId.toString()){
                return response.status(400).json({message: 'You cannot delete yourself'});
            }
            const user = await User.findByIdAndDelete(id);
            if(!user){
                return response.status(404).json({message: 'User not found'});
            }
            return response.status(200).json({message: 'User deleted successfully'});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    updateProfile: async (request, response) => {
        try {
            const userId = request.userId;
            const { 
                name, 
                email, 
                phone, 
                address,
                storeName,
                tagline,
                bio,
                shippingPolicy 
            } = request.body;

            const user = await User.findById(userId);
            if (!user) {
                return response.status(404).json({ message: 'User not found' });
            }

            // Basic info
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone !== undefined) user.phone = phone;
            if (address) user.address = address;

            // Storefront info
            if (storeName !== undefined) user.storeName = storeName;
            if (tagline !== undefined) user.tagline = tagline;
            if (bio !== undefined) user.bio = bio;
            if (shippingPolicy !== undefined) user.shippingPolicy = shippingPolicy;

            await user.save();
            return response.status(200).json({ message: 'Profile updated successfully', user });
        } catch (error) {
            return response.status(500).json({ message: error.message });
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
    },
    deleteAddress: async (request, response) => {
        const userId = request.userId;
        const addressId = request.params.addressId;
        try{
            const user = await User.findById(userId);
            if(!user){
                return response.status(404).json({message:'User not found'});
            }
            const address = user.address.find(address => address._id.toString() === addressId);
            if(!address){
                return response.status(404).json({message:'Address not found'});
            }
            user.address = user.address.filter(address => address._id.toString() !== addressId);
            await user.save();
            return response.status(200).json({message:'Address deleted successfully', user});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    }
}
module.exports = userController;