import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Chip,
  Rating,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import './CategoryPage.css';


const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const fullImageUrl = !imageError && product.images?.[0] 
    ? `${process.env.REACT_APP_API_URL}${product.images[0]}` 
    : null; 
  
  const productType = product.saleType === "auction" ? 'Đấu giá' : 'Mua ngay';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  
  return (
    <Box className="product-card-wrapper" component={motion.div} variants={itemVariants}>
      <Link to={`/product/${product._id}`} className="product-card-link">
        <Paper className="product-card">
          <div className="product-image-container">
            {!imageError && fullImageUrl ? (
              <img 
                src={fullImageUrl} 
                alt={product.name} 
                className={`product-image ${imageLoaded ? 'loaded' : 'loading'}`}
                loading="lazy"
                onError={() => setImageError(true)}
                onLoad={() => {
                  setImageLoaded(true);
                  setImageError(false);
                }}
              />
            ) : (
              <div className="image-placeholder">
                <Typography variant="h4" className="placeholder-text">
                  {product.name?.charAt(0)?.toUpperCase() || '?'}
                </Typography>
              </div>
            )}
          </div>
          
          <div className="product-info">
            <Typography 
              variant="body2" 
              className="product-name"
              title={product.name}
            >
              {product.name}
            </Typography>
            
            <Chip 
              label={productType}
              size="small"
              className={`product-type ${product.saleType === "auction" ? 'auction-chip' : 'buy-chip'}`}
            />
            
            <Typography variant="body2" className="product-owner">
              bởi {product.seller?.username || 'Người bán'}
            </Typography>
            
            <div className="product-rating">
              <Rating 
                value={product.seller?.averageRating || 4.5} 
                readOnly 
                precision={0.5}
                size="small"
              />
            </div>
            
            {product.saleType === "auction" && (
              <Typography variant="body1" className="product-price">
                Giá hiện tại: {product.currentBid?.toLocaleString('vi-VN') || product.price?.toLocaleString('vi-VN')}đ
              </Typography>
            )}
            
            {product.saleType === "buy-now" && (
              <Typography variant="body1" className="product-price">
                {product.price?.toLocaleString('vi-VN')}đ
              </Typography>
            )}
          </div>
        </Paper>
      </Link>
    </Box>
  );
}

function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching products for category:', categoryName);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/category/${categoryName}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Không thể tải dữ liệu.');
        }
        
        console.log('Fetched products:', data);
        
        if (data && data.length > 0) {
          console.log('First product images:', data[0].images);
          console.log('First product:', data[0]);
        }
        
        setProducts(data);
      } catch (err) {
        setError(err.message);
        setProducts([]); 
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryName]);

  const formattedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <Box className="category-page-container">
      <Typography variant="h4" component="h1" className="category-page-title">
        Danh mục: <span>{formattedCategoryName}</span>
      </Typography>

      {loading && (
        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{mt: 2}} className="error-alert">
          {error}
        </Alert>
      )}
      
      {!loading && !error && products.length > 0 && (
        <Box 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="products-grid-container"
        >
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Box>
      )}

      {!loading && !error && products.length === 0 && (
        <Box className="empty-state">
          <Typography variant="h6" align="center" className="empty-text">
            Không có sản phẩm nào trong danh mục này
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default CategoryPage;