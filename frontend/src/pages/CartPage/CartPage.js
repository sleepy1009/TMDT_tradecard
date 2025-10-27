import React, { useMemo } from 'react'; 
import { useCart } from '../../context/CartContext';
import {
  Box, Typography, Button, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Checkbox, Link as MuiLink, Tooltip, Divider, Avatar
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Add, Remove, Delete, Storefront } from '@mui/icons-material'; 
import './CartPage.css';

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    selectedItems,
    toggleItemSelected,
    toggleSelectAll
  } = useCart();
  const navigate = useNavigate();

  const groupedCartItems = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const sellerId = item.seller._id;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerInfo: item.seller,
          items: [],
        };
      }
      acc[sellerId].items.push(item);
      return acc;
    }, {});
  }, [cartItems]);

  const selectedProducts = cartItems.filter(item => selectedItems.has(item._id));
  const subtotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < cartItems.length;

  const handleProceedToCheckout = () => {
    navigate('/pay', { state: { itemsToCheckout: selectedProducts } });
  };

  const handleRemoveClick = (item) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng?`)) {
      removeFromCart(item._id);
    }
  };

  return (
    <div className="cart-page-container">
      <Typography variant="h4" component="h1" gutterBottom>
        Giỏ Hàng Của Bạn
      </Typography>

      {cartItems.length === 0 ? (
        <Box className="empty-cart-message">
          <Typography variant="h6">Giỏ hàng của bạn đang trống.</Typography>
          <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
            Tiếp tục mua sắm
          </Button>
        </Box>
      ) : (
        <div className="cart-layout">
          <Box className="cart-items-grouped">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
               <Tooltip title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}>
                    <Checkbox
                        color="primary"
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        sx={{ mr: 1 }}
                    />
                </Tooltip>
                <Typography variant="body2">Chọn tất cả ({cartItems.length} sản phẩm)</Typography>
            </Box>

            {Object.entries(groupedCartItems).map(([sellerId, group]) => (
              <Paper key={sellerId} sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }} elevation={1}>
                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  <Storefront fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {group.sellerInfo.username}
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {group.items.map((item) => {
                         const maxQuantity = item.stock;
                         return (
                          <TableRow key={item._id} selected={selectedItems.has(item._id)} hover>
                            <TableCell padding="checkbox" sx={{width: '60px'}}>
                              <Checkbox
                                color="primary"
                                checked={selectedItems.has(item._id)}
                                onChange={() => toggleItemSelected(item._id)}
                              />
                            </TableCell>
                            <TableCell sx={{width: '40%'}}> 
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <MuiLink component={RouterLink} to={`/product/${item._id}`}>
                                  <img src={item.images[0]} alt={item.name} className="cart-item-image" />
                                </MuiLink>
                                <MuiLink component={RouterLink} to={`/product/${item._id}`} color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, fontWeight: 500 }}>
                                  <Typography variant="body2">{item.name}</Typography>
                                </MuiLink>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{width: '25%'}}> 
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton onClick={() => updateQuantity(item._id, item.quantity - 1)} size="small"><Remove /></IconButton>
                                <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Typography>
                                <IconButton onClick={() => updateQuantity(item._id, item.quantity + 1)} size="small" disabled={item.quantity >= maxQuantity}><Add /></IconButton>
                              </Box>
                              <Typography variant="caption" color={item.quantity >= maxQuantity ? "error" : "text.secondary"}>(Tối đa: {maxQuantity})</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{width: '15%', fontWeight: 'bold'}}> 
                              {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell align="center" sx={{width: '10%'}}> 
                              <Tooltip title="Xóa khỏi giỏ">
                                <IconButton onClick={() => handleRemoveClick(item)} color="error" size="small"><Delete /></IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                         );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
          </Box>
          <Paper className="cart-summary">
            <Typography variant="h6" gutterBottom>Tóm Tắt Đơn Hàng</Typography>
            <Box className="summary-line">
              <Typography>Tạm tính ({selectedProducts.length} sản phẩm đã chọn):</Typography>
              <Typography fontWeight="bold">{subtotal.toLocaleString('vi-VN')}đ</Typography>
            </Box>
             <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              Phí vận chuyển sẽ được tính ở bước thanh toán.
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleProceedToCheckout}
              disabled={selectedProducts.length === 0}
              sx={{ mt: 2 }}
            >
              Tiến hành Thanh Toán ({selectedProducts.length})
            </Button>
          </Paper>
        </div>
      )}
    </div>
  );
}

export default CartPage;