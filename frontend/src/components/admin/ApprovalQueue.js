import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert, Avatar, Divider, Tooltip } from '@mui/material';
import { format } from 'date-fns';

function ApprovalQueue() {
  const { token } = useAuth();
  const [pendingSellers, setPendingSellers] = useState([]);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sellersRes, cancellationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/cancellation-requests`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const sellersData = await sellersRes.json();
      if (!sellersRes.ok) throw new Error(sellersData.message || 'Failed to fetch seller requests.');
      setPendingSellers(sellersData);
      
      const cancellationsData = await cancellationsRes.json();
      if (!cancellationsRes.ok) throw new Error(cancellationsData.message || 'Failed to fetch cancellation requests.');
      setCancellationRequests(cancellationsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApproval = async (userId, newStatus) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ sellerStatus: newStatus })
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      fetchData(); 
    } catch (err) {
       setError(err.message || 'Có lỗi xảy ra.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Typography variant="h5" gutterBottom>Yêu Cầu Đăng Ký Bán Hàng</Typography>
      {pendingSellers.length === 0 ? (
        <Paper sx={{p: 3, textAlign: 'center', mb: 4}}><Typography>Không có yêu cầu đăng ký mới.</Typography></Paper>
      ) : (
        <Grid container spacing={2} sx={{mb: 4}}>
          {pendingSellers.map(user => (
            <Grid item xs={12} md={6} key={user._id}>
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                 <Avatar src={user.profilePicture ? `${process.env.REACT_APP_API_URL}${user.profilePicture}` : ''} />
                                 <Box>
                                   <Typography fontWeight="bold">{user.username}</Typography>
                                   <Typography variant="body2">Tên shop: <strong>{user.shopName}</strong></Typography>
                                   <Typography variant="caption" color="text.secondary">Yêu cầu lúc: {format(new Date(user.updatedAt), 'HH:mm dd/MM/yyyy')}</Typography>
                                 </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" color="success" onClick={() => handleApproval(user._id, 'approved')}>Duyệt</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleApproval(user._id, 'rejected')}>Từ chối</Button>
                              </Box>
            </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{my: 4}} />
      <Typography variant="h5" gutterBottom>Yêu Cầu Hủy Quyền Bán Hàng</Typography>
      {cancellationRequests.length === 0 ? (
        <Paper sx={{p: 3, textAlign: 'center'}}><Typography>Không có yêu cầu hủy nào.</Typography></Paper>
      ) : (
        <Grid container spacing={2}>
          {cancellationRequests.map(user => (
            <Grid item xs={12} md={6} key={user._id}>
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tooltip title={`Lý do: ${user.sellerCancellationReason}`} placement="top"></Tooltip>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                 <Avatar src={user.profilePicture ? `${process.env.REACT_APP_API_URL}${user.profilePicture}` : ''} />
                                 <Box>
                                   <Typography fontWeight="bold">{user.username}</Typography>
                                   <Typography variant="body2">Tên shop: <strong>{user.shopName}</strong></Typography>
                                   <Typography variant="caption" color="text.secondary">Yêu cầu lúc: {format(new Date(user.updatedAt), 'HH:mm dd/MM/yyyy')}</Typography>
                                 </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" color="success" onClick={() => handleApproval(user._id, 'approved')}>Duyệt</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleApproval(user._id, 'rejected')}>Từ chối</Button>
                              </Box>
            </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ApprovalQueue;