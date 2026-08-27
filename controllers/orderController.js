const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const orderController = {
    createOrder: async (request, response) => {
        try{
            const userId = request.userId;
            const { shippingAddress } = request.body;
            if(!shippingAddress){
                return response.status(400).json({message:'Shipping address is required'});
            }
            const cart = await Cart.findOne({user:userId}).populate('items.product', '-__v');
            if(!cart || cart.items.length === 0){
                return response.status(400).json({message:'Cart is empty'});
            }
            let totalAmount = 0;
            const orderItems = [];
            for(const item of cart.items){
                if(!item.product){
                    return response.status(400).json({message:'one or more items no longer exist'});
                }
                if(item.product.stock < item.quantity){
                    return response.status(400).json({message:`Insufficient stock for ${item.product.name} only ${item.product.stock} left`});
                }
                totalAmount += item.quantity * item.product.price;
                orderItems.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    price : totalAmount
                });
            }
            const order = new Order({
                user: userId,
                items: orderItems,
                totalAmount: totalAmount,
                shippingAddress: 
                shippingAddress
            });
            await order.save();
            for(const item of cart.items){
                await Product.findByIdAndUpdate(item.product._id, {$inc:{stock:-item.quantity}});
            }
            cart.items = [];
            await cart.save();
            response.status(201).json({message:'Order placed successfully', order});
        }
        catch(error){
            response.status(500).json({message:error.message});
        }
    },
    getMyOrders: async (request, response) => {
        try{
            const userId = request.userId;
            const orders = await Order.findOne({user:userId}).populate('items.product', '-__v').sort({createdAt:-1});
            if(!orders){
                return response.status(404).json({message:'No orders found'});
            }
            response.status(200).json({message:'Orders retrieved successfully', orders});
        }
        catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    getOrderById: async (request, response) => {
        try{
            const userId = request.userId;
            const orderId = request.params.orderId;
            const order = await Order.findOne({_id:orderId, user:userId}).populate('items.product', '-__v');
            if(!order){
                return response.status(404).json({message: 'Order not found'});
            }
            response.status(200).json({message:'Order retrieved successfully', order});
        }
        catch(error){
            response.status(500).json({message: error.message});
        }
    },
    cancelOrder: async (request, response) => {
        try{
            const userId = request.userId;
            const { orderId } = request.params;
            const order = await Order.findOne({_id:orderId, user:userId});
            if(!order){
                return response.status(404).json({message:'Order not found'});
            }
            if(order.status === 'cancelled'){
                return response.status(400).json({message:'Order already cancelled'});
            }
            if(order.status === 'shipped' || order.status === 'delivered'){
                return response.status(400).json({message:`cannot cancel order when it is already ${order.status}`});
            }
            for (const item of order.items){
                await Product.findByIdAndUpdate(item.product, {$inc:{stock:item.quantity}});
            }
            order.status = 'cancelled';
            await order.save();
            response.status(200).json({message: 'Order cancelled successfully'});
        }
        catch(error){
            response.status(500).json({message:error.message});
        }
    }
};
module.exports = orderController;