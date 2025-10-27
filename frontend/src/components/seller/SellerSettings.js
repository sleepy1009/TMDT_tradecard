import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Button, TextField, Paper, CircularProgress, Alert } from '@mui/material';

function SellerSettings() {
  const { token, fetchUserProfile } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy quyền bán hàng không? Hành động này sẽ ẩn tất cả sản phẩm của bạn.')) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me/cancel-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      await fetchUserProfile(token); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Cài đặt Người bán</Typography>
      <Box sx={{ mt: 3, p: 2, border: '1px solid #ffc107', borderRadius: 2, backgroundColor: '#fff3cd' }}>
        <Typography variant="subtitle1" fontWeight="bold">Hủy quyền Bán hàng</Typography>
        <Typography variant="body2" sx={{ my: 1 }}>
          Nếu bạn không muốn tiếp tục bán hàng, bạn có thể gửi yêu cầu tại đây.
          Tất cả sản phẩm của bạn sẽ bị ẩn khỏi trang web.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Lý do hủy (bắt buộc)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ my: 1 }}
        />
        <Button
          variant="contained"
          color="error"
          onClick={handleCancel}
          disabled={loading || reason.length < 10}
        >
          {loading ? <CircularProgress size={24} /> : 'Gửi yêu cầu hủy'}
        </Button>
        {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
      </Box>
    </Paper>
  );
}

export default SellerSettings;

