const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    itemStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    trackingNumber: {
        type: String,
        default: ''
    }
});
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        ZipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing'
    },
    paymentMethod: {
        type: String,
        default: 'Razorpay'
    },
    paymentResult: {
        id: String,
        orderId: String,
        signature: String,
        status: { type: String, default: 'Completed' }
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);