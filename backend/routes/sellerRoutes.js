const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
          status: 'completed', 
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' },
          productsSold: { $sum: { $size: '$products' } },
        },
      },
    ]);

    const analytics = {
      monthlyRevenue: monthlySales.length > 0 ? monthlySales[0].totalRevenue : 0,
      productsSold: monthlySales.length > 0 ? monthlySales[0].productsSold : 0,
    };

    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching analytics.' });
  }
});

module.exports = router;