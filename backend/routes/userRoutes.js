const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); 
const router = express.Router();
const multer = require('multer'); 
const path = require('path');     
const Product = require('../models/Product');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/avatars');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = req.user.userId + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

router.post('/me/avatar', [authMiddleware, upload.single('avatar')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh.' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { profilePicture: avatarUrl },
            { new: true }
        ).select('-password');

        res.status(200).json(user);
    } catch (error) {
        console.error("Avatar upload error:", error);
        res.status(500).json({ message: 'Lỗi server khi tải ảnh lên.' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          fullName,
          email,
          phoneNumber,
          address
        },
      },
      { new: true, runValidators: true } 
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    res.status(200).json({ message: 'Cập nhật thông tin thành công!', user: updatedUser });
  } catch (error) {
    if (error.code === 11000) {
       return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }
    res.status(500).json({ message: 'Lỗi server.', error });
  }
});

router.get('/me/addresses', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('addresses');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

router.post('/me/addresses', authMiddleware, async (req, res) => {
  const { province, district, ward, street } = req.body;
  if (!province || !district || !ward || !street) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin địa chỉ.' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newAddress = { province, district, ward, street };
    
    if (req.body.isDefault) {
       user.addresses.forEach(addr => addr.isDefault = false);
       newAddress.isDefault = true;
    }
    
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save(); 
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("Error saving address:", error); 
    res.status(500).json({ message: 'Server error while saving address.', error });
  }
});

router.put('/me/addresses/:addressId', authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.userId);
    
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    Object.assign(address, req.body);

    await user.save();
    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

router.delete('/me/addresses/:addressId', authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.addresses.pull({ _id: addressId });

    await user.save();
    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: 'Server error while deleting address.', error });
  }
});

router.put('/me/addresses/:addressId/default', authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.userId);

    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    const newDefault = user.addresses.id(addressId);
    if (!newDefault) return res.status(404).json({ message: 'Address not found.' });
    newDefault.isDefault = true;
    
    await user.save();
    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

router.post('/me/request-seller', authMiddleware, async (req, res) => {
  try {
    const { shopName } = req.body;
    if (!shopName || shopName.trim().length < 3) {
      return res.status(400).json({ message: 'Tên cửa hàng phải có ít nhất 3 ký tự.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

    if (!user.phoneNumber || !user.addresses || user.addresses.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cập nhật đầy đủ số điện thoại và địa chỉ trong thông tin cá nhân trước khi đăng ký bán hàng.' });
    }

    if (user.sellerStatus === 'approved' || user.sellerStatus === 'pending') {
      return res.status(400).json({ message: 'Bạn đã gửi yêu cầu hoặc đã là người bán.' });
    }

    const existingShop = await User.findOne({ shopName: shopName.trim() });
    if (existingShop) {
      return res.status(400).json({ message: 'Tên cửa hàng này đã được sử dụng.' });
    }
    
    user.shopName = shopName.trim();
    user.sellerStatus = 'pending'; 
    
    await user.save();

    res.status(200).json({ message: 'Yêu cầu bán hàng của bạn đã được gửi đi và đang chờ duyệt!', user });

  } catch (error) {
    console.error("Seller request error:", error);
    res.status(500).json({ message: 'Lỗi server khi gửi yêu cầu.' });
  }
});

router.post('/me/cancel-seller', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Lý do hủy phải có ít nhất 10 ký tự.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.'});

    // Don't allow multiple requests
    if (user.sellerStatus === 'cancellation_pending') {
        return res.status(400).json({ message: 'Bạn đã có một yêu cầu hủy đang chờ xử lý.' });
    }
    
    // Set status to pending cancellation for admin review
    user.sellerStatus = 'cancellation_pending';
    user.sellerCancellationReason = reason.trim();
    
    const updatedUser = await user.save();

    res.status(200).json({ message: 'Yêu cầu hủy bán hàng của bạn đã được gửi đi và đang chờ duyệt!', user: updatedUser });

  } catch (error) {
    console.error("Seller cancellation request error:", error);
    res.status(500).json({ message: 'Lỗi server khi gửi yêu cầu.' });
  }
});

module.exports = router;