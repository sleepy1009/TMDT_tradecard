import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function OverviewTab() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({ monthlyRevenue: 0, productsSold: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch analytics');
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <Box>
        <Typography variant="h6" gutterBottom>Tổng Quan Tháng Này</Typography>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> :
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{p: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                        <MonetizationOnIcon color="success" sx={{fontSize: 40}} />
                        <Box>
                            <Typography color="text.secondary">Doanh thu (tháng này)</Typography>
                            <Typography variant="h5" fontWeight="bold">{analytics.monthlyRevenue.toLocaleString('vi-VN')}đ</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{p: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                        <ShoppingCartIcon color="info" sx={{fontSize: 40}} />
                        <Box>
                            <Typography color="text.secondary">Sản phẩm đã bán</Typography>
                            <Typography variant="h5" fontWeight="bold">{analytics.productsSold}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        }
    </Box>
  );
}

export default OverviewTab;