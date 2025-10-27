import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert, Avatar } from '@mui/material';
import { format } from 'date-fns';

function ProductApproval() {
  const { token } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/products/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch pending products.');
      setPendingProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

  const handleModeration = async (productId, newStatus) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/products/${productId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Moderation failed.');
      fetchPendingProducts();
    } catch (err) {
      setError(err.message || 'An error occurred.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Duyệt Sản Phẩm</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {pendingProducts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Không có sản phẩm nào đang chờ duyệt.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {pendingProducts.map(product => (
            <Grid item xs={12} key={product._id}>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={product.images[0] ? `${process.env.REACT_APP_API_URL}${product.images[0]}` : '/default-product-image.png'}
                  alt={product.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                />
                <Box flexGrow={1}>
                  <Typography fontWeight="bold">{product.name}</Typography>
                  <Typography variant="body2">Người bán: <strong>{product.seller.username}</strong> ({product.seller.shopName})</Typography>
                  <Typography variant="caption" color="text.secondary">Gửi lúc: {format(new Date(product.createdAt), 'HH:mm dd/MM/yyyy')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" color="success" onClick={() => handleModeration(product._id, 'approved')}>Duyệt</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleModeration(product._id, 'rejected')}>Từ chối</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}



export default ProductApproval;