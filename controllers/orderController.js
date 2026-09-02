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
            const orders = await Order.find({user:userId}).populate('items.product').sort({createdAt:-1});
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
            const orderId = request.params.id;
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
            const orderId = request.params.id;
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
    },
    getSellerOrders: async (request, response) => {
        try {
        const sellerId = request.userId;

        // 1. Find all products created by this seller
        const sellerProducts = await Product.find({ createdBy: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map((p) => p._id);

        // 2. Find orders containing any of these products
        const orders = await Order.find({ 'items.product': { $in: sellerProductIds } })
            .populate('user', 'name email')
            .populate('items.product', 'name price image createdBy')
            .sort({ createdAt: -1 });

        // 3. Filter order items so sellers only see their own items
        const sanitizedOrders = orders.map((order) => {
            const myItems = order.items.filter((item) =>
            sellerProductIds.some((pId) => pId.toString() === item.product?._id.toString())
            );

            return {
            _id: order._id,
            createdAt: order.createdAt,
            user: order.user,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            isPaid: order.isPaid,
            items: myItems,
            sellerTotal: myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
            };
        });

        return response.status(200).json({
            message: 'Seller orders retrieved successfully',
            orders: sanitizedOrders
        });
        } catch (error) {
        return response.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    updateItemShipmentStatus: async (request, response) => {
        try {
        const { orderId, productId } = request.params;
        const { itemStatus, trackingNumber } = request.body;
        const sellerId = request.userId;

        // Verify seller owns this product
        const product = await Product.findOne({ _id: productId, createdBy: sellerId });
        if (!product && request.user?.role !== 'admin') {
            return response.status(403).json({ message: 'Unauthorized to update this item shipment' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return response.status(404).json({ message: 'Order not found' });
        }

        const item = order.items.find(
            (it) => it.product.toString() === productId.toString()
        );

        if (!item) {
            return response.status(404).json({ message: 'Item not found in order' });
        }

        if (itemStatus) item.itemStatus = itemStatus;
        if (trackingNumber !== undefined) item.trackingNumber = trackingNumber;

        await order.save();

        return response.status(200).json({
            message: 'Fulfillment status updated successfully',
            order
        });
        } catch (error) {
        return response.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};
module.exports = orderController;