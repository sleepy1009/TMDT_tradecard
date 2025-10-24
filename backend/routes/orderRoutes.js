const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const sellerMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user && user.sellerStatus === 'approved') {
            next();
        } else {
            res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho người bán.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
};


router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itemsToCheckout, shippingAddress, paymentMethod } = req.body;
        const buyerId = req.user.userId;

        if (!itemsToCheckout || itemsToCheckout.length === 0 || !shippingAddress) {
            return res.status(400).json({ message: 'Thiếu thông tin đơn hàng hoặc địa chỉ.' });
        }
        if (!['cod', 'bank_transfer'].includes(paymentMethod)) {
             return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
        }
        if (!shippingAddress.fullName || !shippingAddress.phoneNumber || !shippingAddress.province || !shippingAddress.district || !shippingAddress.ward || !shippingAddress.street) {
             return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng.' });
        }

        const SHIPPING_FEE_PER_SELLER = 30000;

        const ordersBySeller = {};

        for (const item of itemsToCheckout) {
            const product = await Product.findById(item._id);
            if (!product || product.stock < item.quantity) {
                 throw new Error(`Sản phẩm "${item.name}" không đủ hàng.`);
            }

            const sellerId = product.seller.toString();
            if (!ordersBySeller[sellerId]) {
                ordersBySeller[sellerId] = {
                    seller: sellerId,
                    products: [],
                    subtotal: 0,
                };
            }
            ordersBySeller[sellerId].products.push({
                productId: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            });
            ordersBySeller[sellerId].subtotal += item.price * item.quantity;
            totalAmountForAllOrders += item.price * item.quantity;
        }

        const createdOrders = [];
        for (const sellerId in ordersBySeller) {
            const orderData = ordersBySeller[sellerId];
            const calculatedShippingFee = SHIPPING_FEE_PER_SELLER;
            const orderTotal = orderData.subtotal + calculatedShippingFee;
            const newOrder = new Order({
                buyer: buyerId,
                seller: orderData.seller,
                products: orderData.products,
                totalAmount: orderTotal, 
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                shippingFee: calculatedShippingFee, 
                status: 'pending'
            });;
            
            for (const p of orderData.products) {
                await Product.findByIdAndUpdate(p.productId, { $inc: { stock: -p.quantity } });
            }

            const savedOrder = await newOrder.save();
            createdOrders.push(savedOrder);
        }

        res.status(201).json({ message: 'Đặt hàng thành công!', orders: createdOrders });

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ message: error.message || 'Lỗi server khi tạo đơn hàng.' });
    }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user.userId })
            .populate('seller', 'username shopName') 
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.get('/seller-orders', authMiddleware, sellerMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user.userId })
            .populate('buyer', 'username fullName') 
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.put('/:orderId/status', authMiddleware, sellerMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['processing', 'shipped', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái cập nhật không hợp lệ.' });
        }

        const order = await Order.findOne({ _id: req.params.orderId, seller: req.user.userId });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền.' });
        }

        if (status === 'cancelled' && order.status !== 'cancelled') {
             for (const p of order.products) {
                await Product.findByIdAndUpdate(p.productId, { $inc: { stock: p.quantity } });
            }
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        console.error("Order status update error:", error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái.' });
    }
});

module.exports = router;