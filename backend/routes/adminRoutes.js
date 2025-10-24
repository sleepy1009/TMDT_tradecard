const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Product = require('../models/Product');

router.get('/users/cancellation-requests', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const cancellationRequests = await User.find({ sellerStatus: 'cancellation_pending' })
      .select('-password')
      .sort({ updatedAt: 1 });
    res.json(cancellationRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching cancellation requests' });
  }
});

router.get('/products/pending', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const pendingProducts = await Product.find({ moderationStatus: 'pending' })
            .populate('seller', 'username shopName')
            .sort({ createdAt: 1 });
        res.json(pendingProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/products/:productId/moderate', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { status } = req.body; 
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            { moderationStatus: status },
            { new: true }
        );
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/users', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.get('/users/pending', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const pendingUsers = await User.find({ sellerStatus: 'pending' }).select('-password').sort({ updatedAt: 1 });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending users' });
  }
});

router.put('/users/:userId/manage', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { sellerStatus, isBanned, banReason, banDurationDays } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (sellerStatus && ['none', 'approved', 'rejected'].includes(sellerStatus)) {
      user.sellerStatus = sellerStatus;
    }

    if (typeof isBanned === 'boolean') {
      user.isBanned = isBanned;
      if (isBanned) {
        user.banDetails.reason = banReason || 'Không có lý do được cung cấp.';
        if (banDurationDays && banDurationDays > 0) {
          const banEndDate = new Date();
          banEndDate.setDate(banEndDate.getDate() + parseInt(banDurationDays, 10));
          user.banDetails.bannedUntil = banEndDate;
        } else {
          user.banDetails.bannedUntil = null; 
        }
      } else {
        user.banDetails = { reason: undefined, bannedUntil: undefined };
      }
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during user management' });
  }
});

module.exports = router;