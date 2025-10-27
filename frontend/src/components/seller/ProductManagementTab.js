import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { TableContainer } from '@mui/material';
import ProductForm from './ProductForm'; 
import { useNavigate } from 'react-router-dom';

function ProductManagementTab() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    switch (filter) {
      case 'pending':
        return products.filter(p => p.moderationStatus === 'pending' || p.moderationStatus === 'rejected');
      case 'hidden':
        return products.filter(p => p.status === 'hidden_by_seller');
      case 'sold':
        return products.filter(p => p.status === 'sold');
      case 'active':
      default:
        return products.filter(p => p.status === 'active' && p.moderationStatus === 'approved');
    }
  }, [products, filter]);

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      fetchProducts(); 
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa vĩnh viễn sản phẩm này? Hành động này không thể hoàn tác.')) {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete product.');
            fetchProducts(); 
        } catch (err) {
            setError(err.message || 'Failed to delete product.');
        }
    }
  };
  
  const handleOpenForm = (product = null) => {
    setEditingProduct(product); 
    setIsFormOpen(true);
  };
  
  const handleSaveProduct = async (formValues, formImages, setSubmitting) => {
    setError('');
    const isEditing = !!editingProduct;

    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/api/products/${editingProduct._id}`
      : `${process.env.REACT_APP_API_URL}/api/products`;
    const method = isEditing ? 'PUT' : 'POST';

    const formDataToSend = new FormData();

    Object.keys(formValues).forEach(key => {
      if (key === 'auctionEndDate' && formValues[key] instanceof Date) {
        formDataToSend.append(key, formValues[key].toISOString());
      } else if (formValues[key] !== null) {
        formDataToSend.append(key, formValues[key]);
      }
    });

    const existingImageUrls = [];
    const newImageFiles = [];

    formImages.forEach(imgOrUrl => { 
      if (typeof imgOrUrl === 'string') {
        try {
          const urlObject = new URL(imgOrUrl);
          existingImageUrls.push(urlObject.pathname); 
        } catch (_) {
          existingImageUrls.push(imgOrUrl); 
        }
      } else {
        newImageFiles.push(imgOrUrl);
      }
    });

    if (existingImageUrls.length === 0 && newImageFiles.length === 0) {
        setError('Sản phẩm phải có ít nhất một hình ảnh.');
        if (setSubmitting) setSubmitting(false);
        return; 
    }

    if (isEditing) {
        existingImageUrls.forEach(urlPath => formDataToSend.append('existingImages', urlPath));
        newImageFiles.forEach(file => formDataToSend.append('images', file));
    } else {
        formImages.forEach(file => formDataToSend.append('images', file)); 
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (isEditing ? 'Failed to update product.' : 'Failed to create product.'));
      }

      fetchProducts();
      setIsFormOpen(false);
      setEditingProduct(null);

    } catch (err) {
      setError(err.message);
    } finally {
      if (setSubmitting) setSubmitting(false);
    }
  };

  const getModerationStatusChip = (status) => {
    switch (status) {
      case 'approved': return <Chip label="Đã duyệt" color="success" size="small" />;
      case 'pending': return <Chip label="Chờ duyệt" color="warning" size="small" />;
      case 'rejected': return <Chip label="Bị từ chối" color="error" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Quản lý Sản phẩm</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsFormOpen(true)}>
          Đăng sản phẩm mới
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

      <Paper>
        <Tabs value={filter} onChange={(e, newValue) => setFilter(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label={`Đang Bán (${products.filter(p => p.status === 'active' && p.moderationStatus === 'approved').length})`} value="active" />
          <Tab label={`Chờ Duyệt / Bị Từ Chối (${products.filter(p => p.moderationStatus === 'pending' || p.moderationStatus === 'rejected').length})`} value="pending" />
          <Tab label={`Bị Ẩn (${products.filter(p => p.status === 'hidden_by_seller').length})`} value="hidden" />
          <Tab label={`Đã Bán (${products.filter(p => p.status === 'sold').length})`} value="sold" />
        </Tabs>
        <TableContainer>
          {loading ? <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box> :
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Trạng thái duyệt</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Tồn kho</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                  <TableRow key={p._id} hover sx={{cursor: 'pointer'}}>
                    <TableCell onClick={() => navigate(`/product/${p._id}`)}>{p.name}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{getModerationStatusChip(p.moderationStatus)}</TableCell>

                    <TableCell align="right">
                      {p.status === 'active' && (
                        <Tooltip title="Ẩn sản phẩm">
                          <IconButton onClick={() => handleStatusUpdate(p._id, 'hidden_by_seller')}><VisibilityOffIcon /></IconButton>
                        </Tooltip>
                      )}
                      {p.status === 'hidden_by_seller' && (
                        <Tooltip title="Hiện lại (sẽ cần duyệt lại)">
                           <IconButton color="success" onClick={() => handleStatusUpdate(p._id, 'active')}><VisibilityIcon /></IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={(e) => { e.stopPropagation(); handleOpenForm(p); }}>
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa vĩnh viễn">
                        <IconButton color="error" onClick={() => handleDelete(p._id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} align="center">Không có sản phẩm nào trong mục này.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          }
        </TableContainer>
      </Paper>

      <ProductForm 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </Box>
  );
}

export default ProductManagementTab;