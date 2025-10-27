import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Chip, Divider, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

const getStatusChipProps = (status) => {
  switch (status) {
    case 'pending': return { label: 'Chờ xác nhận', color: 'warning' };
    case 'processing': return { label: 'Đang xử lý', color: 'info' };
    case 'shipped': return { label: 'Đang giao', color: 'primary' };
    case 'completed': return { label: 'Đã giao', color: 'success' };
    case 'cancelled': return { label: 'Đã hủy', color: 'error' };
    default: return { label: status, color: 'default' };
  }
};

function MyOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders.');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Box sx={{ maxWidth: 1000, margin: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Đơn Hàng Của Tôi
      </Typography>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && orders.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Bạn chưa có đơn hàng nào.</Typography>
        </Paper>
      )}

      {!loading && orders.length > 0 && (
        <Grid container spacing={3}>
          {orders.map(order => (
            <Grid item xs={12} key={order._id}>
              <Paper sx={{ p: 2, borderRadius: 2 }} elevation={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Đơn hàng #{order._id.substring(order._id.length - 6)} - Ngày đặt: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                  <Chip {...getStatusChipProps(order.status)} size="small" />
                </Box>
                <Typography variant="subtitle2">Người bán: {order.seller.username}</Typography>
                <Divider sx={{ my: 1 }} />
                {order.products.map(product => (
                  <Box key={product.productId} sx={{ display: 'flex', gap: 2, py: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 60, height: 60, flexShrink: 0, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      {/* Placeholder for image do later */}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <MuiLink component={RouterLink} to={`/product/${product.productId}`} color="inherit" sx={{ fontWeight: 500 }}>
                        {product.name}
                      </MuiLink>
                      <Typography variant="body2" color="text.secondary">Số lượng: {product.quantity}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 500 }}>
                      {(product.price * product.quantity).toLocaleString('vi-VN')}đ
                    </Typography>
                  </Box>
                ))}
                 <Divider sx={{ my: 1 }} />
                 <Box sx={{textAlign: 'right'}}>
                    <Typography variant="body1">Tổng cộng: <strong style={{fontSize: '1.1em'}}>{order.totalAmount.toLocaleString('vi-VN')}đ</strong></Typography>
                 </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MyOrdersPage;