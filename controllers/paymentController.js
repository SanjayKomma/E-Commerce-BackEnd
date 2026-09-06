const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require("../utils/config"); // update path if your config file has a different name/location

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// 1. Create Razorpay Gateway Order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize payment gateway",
      error: error.message,
    });
  }
};

// 2. Verify Signature and Save to Mongo
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      totalAmount,
    } = req.body;

    // Verify HMAC SHA-256 signature using RAZORPAY_KEY_SECRET from config
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    // Match orderItemSchema
    const formattedItems = (items || []).map((item) => ({
      product: item.product?._id || item.product || item._id,
      quantity: Number(item.quantity) || 1,
      price: Number(item.product?.price ?? item.price ?? 0),
      itemStatus: "Processing",
      trackingNumber: "",
    }));

    // Match shippingAddress schema casing and structure
    const order = new Order({
      user: req.userId,
      items: formattedItems,
      shippingAddress: {
        street: shippingAddress.street || "Not Provided",
        city: shippingAddress.city || "Not Provided",
        ZipCode: shippingAddress.ZipCode || shippingAddress.zipCode || shippingAddress.postalCode || "000000",
        country: shippingAddress.country || "India",
      },
      totalAmount: Number(totalAmount),
      status: "processing",
      paymentMethod: "Razorpay",
      paymentResult: {
        id: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: "Completed",
      },
      isPaid: true,
      paidAt: new Date(),
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: "Payment verified and order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
};