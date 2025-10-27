import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Chip, Divider, Button, Select, MenuItem, FormControl } from '@mui/material';
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

function OrderManagementTab() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); 

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/seller-orders`, {
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      fetchOrders(); 
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  const filteredOrders = orders.filter(order => {
      if (filter === 'all') return true;
      return order.status === filter;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Quản Lý Đơn Hàng</Typography>
        <FormControl size="small">
             <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <MenuItem value="pending">Chờ xác nhận</MenuItem>
                <MenuItem value="processing">Đang xử lý</MenuItem>
                <MenuItem value="shipped">Đang giao</MenuItem>
                <MenuItem value="completed">Đã giao</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
                <MenuItem value="all">Tất cả</MenuItem>
            </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && filteredOrders.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Không có đơn hàng nào trong mục này.</Typography>
        </Paper>
      )}

      {!loading && filteredOrders.length > 0 && (
        <Grid container spacing={2}>
          {filteredOrders.map(order => (
            <Grid item xs={12} key={order._id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Đơn hàng #{order._id.substring(order._id.length - 6)} - {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                  </Typography>
                  <Chip {...getStatusChipProps(order.status)} size="small" />
                </Box>
                <Typography variant="subtitle2">Người mua: {order.buyer.username}</Typography>
                <Typography variant="body2">Địa chỉ: {`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`}</Typography>
                <Divider sx={{ my: 1 }} />
                {order.products.map(product => (
                  <Box key={product.productId} sx={{ display: 'flex', gap: 2, py: 0.5 }}>
                    <Typography sx={{ width: '60%' }}>{product.name} (x{product.quantity})</Typography>
                    <Typography sx={{ width: '40%', textAlign: 'right' }}>{(product.price * product.quantity).toLocaleString('vi-VN')}đ</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                   <Typography variant="body1">Tổng cộng: <strong>{order.totalAmount.toLocaleString('vi-VN')}đ</strong></Typography>
                   <Box sx={{ display: 'flex', gap: 1 }}>
                        {order.status === 'pending' && (
                            <>
                                <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate(order._id, 'processing')}>Xác nhận</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleStatusUpdate(order._id, 'cancelled')}>Hủy đơn</Button>
                            </>
                        )}
                         {order.status === 'processing' && (
                                <Button size="small" variant="contained" color="primary" onClick={() => handleStatusUpdate(order._id, 'shipped')}>Đã gửi hàng</Button>
                         )}
                         {order.status === 'shipped' && (
                             <Typography variant="caption" color="text.secondary">Chờ người mua xác nhận đã nhận...</Typography>
                         )}
                   </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default OrderManagementTab;