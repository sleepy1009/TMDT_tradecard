import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  Chip, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Alert, 
  Fade,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { Add, Edit, Delete, LocationOn, CheckCircle, Margin } from '@mui/icons-material';

function AddressBook() {
  const { token, user, fetchUserProfile } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000); 
      return () => clearTimeout(timer); 
    }
  }, [error]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token || !API_URL) {
        setError("Lỗi cấu hình: API URL hoặc token không tồn tại.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/api/users/me/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not fetch addresses.');
        const data = await res.json();
        setAddresses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [token, API_URL]);

  const handleOpen = (address = null) => {
    setCurrentAddress(address);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async (addressData) => {
    const method = addressData._id ? 'PUT' : 'POST';
    const url = addressData._id 
      ? `${API_URL}/api/users/me/addresses/${addressData._id}` 
      : `${API_URL}/api/users/me/addresses`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addressData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save address.');
            
      setAddresses(result);
      fetchUserProfile(token); 
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        const res = await fetch(`${API_URL}/api/users/me/addresses/${addressId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to delete address.');

        setAddresses(result);
        fetchUserProfile(token); 
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/me/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to set default address.');

      setAddresses(result);
      fetchUserProfile(token); 
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><CircularProgress /></Box>;
  
  return (
    <Box className="card" sx={{ maxWidth: 1200, mx: "auto", mt: 4, p: 4, position: 'relative', borderRadius: 3, boxShadow: 2}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontFamily="roboto slab" variant="h4" fontWeight={700} color="black">Địa chỉ của bạn</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
          sx={{ 
            borderRadius: 10,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          Thêm Địa Chỉ Mới
        </Button>
      </Box>

      <Fade in={!!error}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Fade>

      {addresses.length > 0 ? (
        <Grid container spacing={3} alignItems="stretch">
          {addresses.map(addr => (
            <Grid item xs={12} md={6} key={addr._id} > 
              <Card 
                sx={{ 
                  minWidth: 650,
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: addr.isDefault ? '3px solid #00834aff' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: 5,
                  ml: 5.5,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn color="primary" />
                    <Typography variant="h6" fontWeight={600} ml={1}>
                      {addr.street}
                    </Typography>
                    {addr.isDefault && (
                      <Chip 
                        label="Mặc định" 
                        color="success"
                        size="small" 
                        icon={<CheckCircle />}
                        sx={{ ml: 1 , fontWeight: 600, color: "#fff"}}
                      />
                    )}
                    
                  </Box>
                  
                  <Typography 
                    color="text.secondary" 
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {`${addr.ward}, ${addr.district}, ${addr.province}`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  {!addr.isDefault && (
                    <Button 
                      size="small" 
                      onClick={() => handleSetDefault(addr._id)}
                      color="primary"
                      sx={{borderRadius: 5}}
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                  
                  <IconButton onClick={() => handleOpen(addr)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(addr._id)} color="error">
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocationOn sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bạn chưa có địa chỉ nào được lưu
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => handleOpen()} 
              sx={{ mt: 2 }}
            >
              Thêm địa chỉ đầu tiên
            </Button>
          </Box>
        )
      )}

      <AddressFormDialog open={open} onClose={handleClose} address={currentAddress} onSave={handleSave} />
    </Box>
  );
}

function AddressFormDialog({ open, onClose, address, onSave }) {
  const [formData, setFormData] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setFormData(address || { province: '', district: '', ward: '', street: '' });
      fetch('https://provinces.open-api.vn/api/p/')
        .then(res => res.json())
        .then(setProvinces)
        .finally(() => setLoading(false));
    }
  }, [address, open]);

  useEffect(() => {
    if (formData.province) {
      const provinceCode = provinces.find(p => p.name === formData.province)?.code;
      if (provinceCode) {
        fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
          .then(res => res.json())
          .then(data => setDistricts(data.districts));
      }
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
      setWards([]);
    }
  }, [formData.province, provinces]);

  useEffect(() => {
    if (formData.district) {
      const districtCode = districts.find(d => d.name === formData.district)?.code;
      if (districtCode) {
        fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
          .then(res => res.json())
          .then(data => setWards(data.wards));
      }
      setFormData(prev => ({ ...prev, ward: '' }));
    }
  }, [formData.district, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog PaperProps={{sx:{borderRadius: 5}}} open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight:600 ,fontFamily: "roboto slab" }}>
        {address ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select 
                  name="province" 
                  value={formData.province || ''} 
                  label="Tỉnh/Thành phố" 
                  onChange={handleChange}
                  required
                >
                  {provinces.map(p => (
                    <MenuItem key={p.code} value={p.name}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!formData.province}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select 
                  name="district" 
                  value={formData.district || ''} 
                  label="Quận/Huyện" 
                  onChange={handleChange}
                  required
                >
                  {districts.map(d => (
                    <MenuItem key={d.code} value={d.name}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!formData.district}>
                <InputLabel>Phường/Xã</InputLabel>
                <Select 
                  name="ward" 
                  value={formData.ward || ''} 
                  label="Phường/Xã" 
                  onChange={handleChange}
                  required
                >
                  {wards.map(w => (
                    <MenuItem key={w.code} value={w.name}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField 
                name="street" 
                label="Số nhà, tên đường" 
                value={formData.street || ''} 
                onChange={handleChange} 
                required
                multiline
                rows={2}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{pr: 2, pb:2}} >
        <Button onClick={onClose} color="secondary" sx={{ borderRadius: '12px'}}>Hủy</Button>
        <Button 
          onClick={() => onSave(formData)} 
          variant="contained" 
          disabled={loading}
          sx={{ borderRadius: '12px'}}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddressBook;