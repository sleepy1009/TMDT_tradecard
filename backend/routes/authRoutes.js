const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc Username đã tồn tại.' });
    }

    const newUser = new User({ username, email, password, fullName });
    await newUser.save();

    res.status(201).json({ message: 'Tạo tài khoản thành công!' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server, vui lòng thử lại.', error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      token, 
      userId: user._id, 
      username: user.username,
      message: 'Đăng nhập thành công!'
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server, vui lòng thử lại.', error });
  }
});

module.exports = router;