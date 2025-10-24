const User = require('../models/User'); 

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(403).json({ message: 'Authentication error.' });
    }

    const user = await User.findById(req.user.userId);

    if (user && user.isAdmin) {
      next(); 
    } else {
      res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền quản trị viên.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin check.' });
  }
};

module.exports = adminMiddleware;