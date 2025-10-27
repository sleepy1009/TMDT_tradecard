import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Chip, 
  Avatar, 
  Rating, 
  Divider, 
  TextField, 
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Skeleton,
  Snackbar,
  Badge,
  Fade
} from '@mui/material';
import { 
  Category, 
  CheckCircle, 
  Inventory, 
  Add, 
  Remove,
  ExpandMore,
  LocalFireDepartment,
  NewReleases
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import './ProductPage.css';
import catDefault from '../images/cat.png';

function ProductPage() {
  const { productId } = useParams(); 
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  const quantityInCart = cartItems.find(item => item._id === product?._id)?.quantity || 0;
  const availableStock = product ? product.stock - quantityInCart : 0;
  const maxQuantityToAdd = Math.max(0, availableStock);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Không thể tải sản phẩm.');
        }
        const data = await response.json();
        setProduct(data);
        
        // Fetch suggested products based on category
        if (data.category) {
          const suggestedResponse = await fetch(`/api/products/category/${data.category}?limit=6`);
          if (suggestedResponse.ok) {
            const suggestedData = await suggestedResponse.json();
            const filteredSuggested = suggestedData.filter(p => p._id !== data._id);
            setSuggestedProducts(filteredSuggested);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => {
        if (amount < 0) return Math.max(1, prev + amount);
        return Math.min(maxQuantityToAdd, prev + amount);
    });
  };

  const handleAddToCartClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      navigate('/login', { state: { from: location } });
    } else {
      addToCart({ ...product, quantity });
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleBidClick = () => {
     if (!user) {
      alert('Vui lòng đăng nhập để đặt giá.');
      navigate('/login', { state: { from: location } });
    } else {
      alert('Chức năng đặt giá sẽ được triển khai sau.');
    }
  };

  useEffect(() => {
    if (product) {
      setQuantity(prev => Math.min(prev, Math.max(1, product.stock)));
    }
  }, [product]);

  const isOwner = user && product && user.seller && user._id === product.seller._id;

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, margin: '2rem auto', padding: '1rem' }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!product) {
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>Không tìm thấy sản phẩm.</Typography>;
  }

  // Optionally show "Hot deal" or "New" badge:
  const isNew = !!product.isNew; // Or calculate based on creation date if you want
  const isHotDeal = !!product.isHotDeal; // Or based on discount/quantity sold

  return (
    <div className="product-page-container">
      <Paper elevation={3} className="product-hero-paper" sx={{ p: { xs: 1, md: 3 }, borderRadius: 4, mb: 3, background: "#fdfdfd" }}>
        <div className="product-detail-layout">

          {/* --- IMAGE GALLERY --- */}
          <div className="product-image-gallery">
            {/* HOT/NEW BADGE */}
            {(isHotDeal || isNew) && (
              <Fade in={true}>
                <div className="product-badge" style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                  {isHotDeal && <Chip icon={<LocalFireDepartment color="error"/>} label="Hot deal" color="error" sx={{ fontWeight: 600, fontSize: 13 }} />}
                  {isNew && <Chip icon={<NewReleases color="warning" />} label="Mới" color="warning" sx={{ fontWeight: 600, fontSize: 13 }} />}
                </div>
              </Fade>
            )}
            <div className="main-image-container enhanced-main-image">
              <img 
                src={product.images[selectedImage]} 
                alt={`${product.name} - ${selectedImage + 1}`}
                loading="eager"
                className="main-product-image"
                style={{ cursor: 'zoom-in' }}
                onClick={() => window.open(product.images[selectedImage], '_blank')}
              />
            </div>
            <div className="thumbnail-container">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail-item ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* --- INFO SECTION --- */}
          <div className="product-info-section">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>Trang chủ</Link> 
              {' / '}
              <Link to={`/category/${product.category}`} style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>{product.category}</Link> 
              {' / '}
              <strong>{product.name}</strong>
            </Typography>

            <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 1.5, color: '#262626', letterSpacing: -1, fontFamily:"roboto slab" }}>
              {product.name}
            </Typography>

            {/* Seller */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, background: '#f9f9f9', borderRadius: 2, boxShadow: 0 }}>
              <Tooltip title={
                <Box sx={{ p: 1 }}>
                  <Typography fontWeight={600}>{product.seller.username}</Typography>
                  <Rating value={product.seller.averageRating || 0} readOnly size="small" />
                </Box>
              }>
                <Avatar sx={{ width: 48, height: 48, mr: 2, border: '2px solid #1976d2' }} src={product.seller.profilePicture || catDefault }  />
              </Tooltip>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Người bán: <Link to={`/user/${product.seller.username}`} style={{ fontWeight: 700, color: '#1976d2', textDecoration: 'none' }}>{product.seller.username}</Link>
                  {product.seller.isTopSeller && <Chip label="Top Seller" color="success" size="small" sx={{ ml: 1, fontWeight: 600 }} />}
                </Typography>
                <Rating name="read-only" value={product.seller.averageRating || 0} readOnly size="small" />
              </Box>
            </Box>

            {/* Key details */}
            <div className="product-key-details">
              <Chip icon={<Category />} label={`${product.category}`} size="small" />
              <Chip icon={<CheckCircle />} label={`${product.condition}`} size="small" color="success" variant="outlined" />
              <Chip icon={<Inventory />} label={product.stock > 0 ? `Còn ${product.stock} sp` : 'Hết hàng'} size="small" color={product.stock > 0 ? 'primary' : 'error'} />
              {product.discount && (
                <Chip label={`Giảm giá ${product.discount}%`} color="warning" size="small" sx={{ fontWeight: 600 }} />
              )}
            </div>
            <Divider sx={{ my: 2 }} />

            {/* --- ACTION BOX --- */}
            <Box className={`action-box ${product.saleType}`}>
              {product.saleType === 'auction' ? (
                <>
                  <Typography variant="body2">Giá khởi điểm</Typography>
                  <Typography variant="h4" fontWeight={700} color="error.main">{product.price.toLocaleString('vi-VN')}đ</Typography>
                  <TextField label="Nhập giá của bạn" variant="outlined" fullWidth sx={{my: 1}}/>
                  {!isOwner && (
                    <Button variant="contained" color="error" size="large" fullWidth onClick={handleBidClick}> 
                      Đặt Giá
                    </Button>
                  )}
                  {isOwner && (
                    <Paper sx={{p: 2, textAlign: 'center', backgroundColor: '#f5f5f5'}}>
                      <Typography>Đây là sản phẩm của bạn.</Typography>
                    </Paper>
                  )}
                </>
              ) : (
                <>
                  {product.discount && (
                    <Box sx={{ mb: 1 }}>
                      <Chip label={`-${product.discount}%`} color="error" size="small" sx={{ fontWeight: 700, fontSize: 15 }} />
                      <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through', ml: 1 }}>
                        {(product.originalPrice || (product.price / (1 - product.discount / 100))).toLocaleString('vi-VN')}đ
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 2, fontFamily:"roboto slab" }}>
                    {product.price.toLocaleString('vi-VN')}đ
                  </Typography>
                  <Box sx={{display: 'flex', alignItems: 'center', my: 2}}>
                      <Typography sx={{mr: 2}}>Số lượng:</Typography>
                      <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                        <Remove />
                      </IconButton>
                      <Typography sx={{mx: 2, fontWeight: 'bold'}}>{quantity}</Typography>
                      <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= maxQuantityToAdd || product.stock === 0}>
                        <Add />
                      </IconButton>
                      <Typography sx={{ ml: 2, color: 'text.secondary' }}>
                        ({maxQuantityToAdd} sản phẩm có sẵn)
                      </Typography>
                  </Box>
                  {!isOwner && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      onClick={handleAddToCartClick}
                      disabled={maxQuantityToAdd === 0 || quantity === 0 || product.stock === 0}
                      sx={{ fontWeight: 700, fontSize: 18, py: 1.5, borderRadius: 4, boxShadow: '0 4px 20px #1976d255', mt: 2 }}
                    >
                      {product.stock === 0 ? 'Hết hàng' : 'Thêm vào Giỏ Hàng'}
                    </Button>
                  )}
                  {isOwner && (
                    <Paper sx={{p: 2, textAlign: 'center', backgroundColor: '#f5f5f5'}}>
                      <Typography>Đây là sản phẩm của bạn.</Typography>
                    </Paper>
                  )}
                </>
              )}
            </Box>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
              message={`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
            <Divider sx={{ my: 2 }} />
          </div>
        </div>
      </Paper>

      {/* Accordion Sections */}
      <Box sx={{ mt: 2, maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>Mô tả sản phẩm</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {product.description}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>Thông tin chi tiết</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Danh mục</Typography>
                <Typography variant="body1">{product.category}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Tình trạng</Typography>
                <Typography variant="body1">{product.condition}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Giá</Typography>
                <Typography variant="body1">{product.price.toLocaleString('vi-VN')}đ</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Còn lại</Typography>
                <Typography variant="body1">{product.stock}</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Suggested Products */}
      {suggestedProducts.length > 0 && (
        <Box sx={{ mt: 6, maxWidth: 1200, margin: '5 auto', padding: '0 1rem' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 5 }}>
            Sản phẩm gợi ý 
          </Typography>
          <Box className="suggested-products-grid" sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {suggestedProducts.map((suggestedProduct) => (
              <Box 
                key={suggestedProduct._id} 
                className="suggested-product-card" 
                sx={{ 
                  mr:1,
                  flex: '0 0 200px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.04)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.18)'
                  }
                }}
              >
                <Link 
                  to={`/product/${suggestedProduct._id}`} 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {/* Discount badge */}
                    {suggestedProduct.discount && (
                      <Chip
                        label={`-${suggestedProduct.discount}%`}
                        color="error"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          zIndex: 2, 
                          fontWeight: 700 
                        }}
                      />
                    )}
                    <Box 
                      sx={{ 
                        width: '100%',
                        height: 150,
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f9fa'
                      }}
                    >
                      <img 
                        src={suggestedProduct.images[0]} 
                        alt={suggestedProduct.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                        loading="lazy"
                      />
                    </Box>
                    
                    <CardContent sx={{ 
                      p: '0.75rem !important', 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      <Typography 
                        variant="body2" 
                        className="suggested-product-name"
                        sx={{ 
                          fontWeight: 700,
                          mb: 0.25,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.95rem',
                          height: '2.6em'
                        }}
                      >
                        {suggestedProduct.name}
                      </Typography>
                      
                      <Chip 
                        label={suggestedProduct.saleType === "auction" ? 'Đấu giá' : 'Mua ngay'}
                        size="small"
                        className={`suggested-product-type ${suggestedProduct.saleType === "auction" ? 'auction-chip' : 'buy-chip'}`}
                        sx={{ 
                          mb: 0.25,
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      />
                      
                      <Typography variant="body2" className="suggested-product-owner" sx={{ 
                        color: '#6c757d !important',
                        fontSize: '0.77rem !important',
                        mb: 0.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        bởi {suggestedProduct.seller?.username || 'Người bán'}
                      </Typography>
                      
                      <div className="suggested-product-rating" sx={{ mb: 0.25 }}>
                        <Rating 
                          value={suggestedProduct.seller?.averageRating || 4.5} 
                          readOnly 
                          precision={0.5}
                          size="small"
                        />
                      </div>
                      
                      <Typography 
                        variant="body1" 
                        className="suggested-product-price"
                        sx={{ 
                          fontWeight: 700,
                          color: 'var(--danger-color, #d70018) !important',
                          mt: 'auto',
                          fontSize: '1.1rem !important'
                        }}
                      >
                        {suggestedProduct.saleType === "auction" 
                          ? `Giá hiện tại: ${suggestedProduct.currentBid?.toLocaleString('vi-VN') || suggestedProduct.price?.toLocaleString('vi-VN')}đ`
                          : `${suggestedProduct.price?.toLocaleString('vi-VN')}đ`
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </div>
  );
}

export default ProductPage;