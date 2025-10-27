import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, TextField, Paper, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SellerDashboard from './SellerDashboard';

function SellerRegistration() {
  const { user, token, fetchUserProfile } = useAuth();
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me/request-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shopName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      await fetchUserProfile(token); 
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.sellerStatus === 'approved' || user?.sellerStatus === 'cancellation_pending') {
    return <SellerDashboard />;
  }

  if (user?.sellerStatus === 'pending') {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <HourglassEmptyIcon color="info" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5">Yêu cầu của bạn đang chờ duyệt</Typography>
        <Typography color="text.secondary">Chúng tôi sẽ xem xét yêu cầu đăng ký bán hàng cho cửa hàng "{user.shopName}" và sẽ thông báo cho bạn sớm nhất.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>Đăng Ký Trở Thành Người Bán</Typography>
      <Typography paragraph color="text.secondary">
        Mở rộng cộng đồng và bắt đầu kinh doanh các sản phẩm thẻ bài của bạn.
        Vui lòng chọn một tên cho cửa hàng của bạn để bắt đầu.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Tên Cửa Hàng Của Bạn"
          variant="outlined"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          helperText="Tên này sẽ được hiển thị cho người mua."
        />
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || shopName.length < 3}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Gửi Yêu Cầu'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
    </Paper>
  );
}

export default SellerRegistration;