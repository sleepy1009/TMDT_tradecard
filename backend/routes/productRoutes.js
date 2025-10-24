const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/products'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = req.user.userId + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
                                  .populate('seller', 'username')
                                  .sort({ createdAt: -1 });
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu sản phẩm.', error });
  }
});

const sellerMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.sellerStatus === 'approved') {
      next();
    } else {
      res.status(403).json({ message: 'Quyền truy cập bị từ chối. Bạn phải là người bán đã được duyệt.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


router.get('/my-products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

router.post('/', [authMiddleware, sellerMiddleware, upload.array('images', 10)], async (req, res) => {
    try {
        const { name, description, category, condition, saleType, price, stock, auctionEndDate } = req.body; // <-- Get auctionEndDate

        if (!name || !description || !category || !condition || !saleType || !price || !stock) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
        }
        if (saleType === 'auction' && !auctionEndDate) {
            return res.status(400).json({ message: 'Ngày kết thúc đấu giá là bắt buộc.' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Vui lòng tải lên ít nhất một hình ảnh.' });
        }

        const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);

        const newProductData = {
            name, description, category, condition, saleType, price, stock,
            images: imagePaths,
            seller: req.user.userId,
            moderationStatus: 'pending'
        };
        
        if (saleType === 'auction') {
            newProductData.auctionEndDate = auctionEndDate;
            newProductData.currentBid = price; 
        }
        
        const newProduct = new Product(newProductData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Lỗi tạo sản phẩm.', error });
    }
});

router.put('/:id', [authMiddleware, sellerMiddleware], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa sản phẩm này.' });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, moderationStatus: 'pending' }, 
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi cập nhật sản phẩm.', error });
  }
});

router.delete('/:id', [authMiddleware, sellerMiddleware], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này.' });
    }

    await product.remove();
    res.json({ message: 'Sản phẩm đã được xóa.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
                                 .populate('seller', 'username averageRating'); 
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    res.status(200).json(product);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'ID sản phẩm không hợp lệ.' });
    }
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu sản phẩm.', error });
  }
});

router.get('/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params; 

    const products = await Product.find({ 
      category: categoryName, 
      status: 'available'     
    })
    .populate('seller', 'username') 
    .sort({ createdAt: -1 });      

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào trong danh mục này.' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu sản phẩm.', error });
  }
});

router.put('/:id/status', [authMiddleware, sellerMiddleware], async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden_by_seller'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    const product = await Product.findOne({ _id: req.params.id, seller: req.user.userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or you do not have permission.' });
    }

    product.status = status;
    if (status === 'active') {
        product.moderationStatus = 'pending';
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating product status.' });
  }
});

module.exports = router;