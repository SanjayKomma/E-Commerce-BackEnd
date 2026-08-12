const Cart = require('../models/cart.js');
const Product = require('../models/product.js');
const cartController = {
    getCart: async (request, response) => {
        try{
            const userId = request.userId;
            const cart = await Cart.findOne({user: userId}).populate('items.product', '-__v');
            if(!cart){
                return response.status(404).json({message: 'Cart not found'});
            }
            return response.status(200).json({message: 'Cart fetched successfully', cart});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    addToCart: async (request, response) =>{
        try{
            const {productId, quantity} = request.body;
            const product = await Product.findById(productId);
            if(!product){
                return response.status(404).json({message: 'Product not found'});
            }
            const userId = request.userId;
            let cart = await Cart.findOne({user: userId});
            if(!cart){
                cart = new Cart({user: userId, items: []});
            }
            const item = cart.items.find(item => item.product.toString() === productId);
            if(item){
                item.quantity +=quantity;
            }
            else{
                cart.items.push({product: productId, quantity: quantity});
            }
            await cart.save();
            await cart.populate('items.product', '-__v');
            return response.status(200).json({message: 'Product added to cart successfully', cart});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    updateCartItem: async (request, response) => {
        try{
            const {productId} = request.params;
            const {quantity} = request.body;
            const product = await Product.findById(productId);
            if(!product){
                return response.status(404).json({message: 'Product not available in cart'});
            }
            const userId = request.userId;
            let cart = await Cart.findOne({user:userId});
            if(!cart){
                return response.status(404).json({message: 'no items available in cart'});
            }
            const item = cart.items.find(item => item.product.toString() === productId);
            if(!item){
                return response.status(404).json({message: 'Product not available in cart'});
            }
            item.quantity = quantity;
            await cart.save();
            await cart.populate('items.product', '-__v');
            return response.status(200).json({message: 'Cart updated successfully', cart});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    removeFromCart: async (request, response) => {
        try{
            const {productId} = request.params;
            const userId = request.userId;
            const cart = await Cart.findOne({user: userId});
            if(!cart){
                return response.status(404).json({message: 'Cart not found'});
            }
            const item = cart.items.find(item => item.product.toString() === productId);
            if(!item){
                return response.status(404).json({message: 'Product not found in cart'});
            }
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
            await cart.populate('items.product', '-__v');
            return response.status(200).json({message: 'Product removed from cart successfully', cart});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    }
}
module.exports = cartController;