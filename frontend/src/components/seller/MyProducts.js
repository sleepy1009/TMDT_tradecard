import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TableContainer } from '@mui/material';
import ProductForm from './ProductForm';


function MyProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products/my-products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSaveProduct = async (formData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product.');
      
      fetchProducts(); 
      setFormOpen(false); 
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending': return <Chip label="Chờ duyệt" color="warning" size="small" />;
      case 'approved': return <Chip label="Đang bán" color="success" size="small" />;
      case 'rejected': return <Chip label="Bị từ chối" color="error" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Danh sách sản phẩm</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>Đăng sản phẩm mới</Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p._id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{getStatusChip(p.moderationStatus)}</TableCell>
                    <TableCell>
                      <IconButton><EditIcon /></IconButton>
                      <IconButton color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <ProductForm 
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveProduct}
      />
    </Box>
  );
}

export default MyProducts;