import React, { useState, useEffect  } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, Box, Typography, IconButton, Paper, CircularProgress, InputAdornment, Chip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

const validationSchema = Yup.object({
  name: Yup.string().min(5, 'Tên phải có ít nhất 5 ký tự').required('Tên sản phẩm là bắt buộc'),
  description: Yup.string().min(20, 'Mô tả phải có ít nhất 20 ký tự').required('Mô tả là bắt buộc'),
  price: Yup.number().min(1000, 'Giá phải ít nhất 1,000đ').required('Giá là bắt buộc'),
  stock: Yup.number().min(1, 'Số lượng phải ít nhất 1').required('Số lượng là bắt buộc'),
  category: Yup.string().required('Danh mục là bắt buộc'),
  condition: Yup.string().required('Tình trạng là bắt buộc'),
  saleType: Yup.string().required('Loại hình bán là bắt buộc'),
  auctionEndDate: Yup.date().when('saleType', {
    is: 'auction',
    then: (schema) => schema.min(new Date(), 'Ngày kết thúc phải ở trong tương lai').required('Ngày kết thúc là bắt buộc'),
    otherwise: (schema) => schema.nullable(),
  }),
});

function ProductForm({ open, onClose, onSave, editingProduct }) {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const formik = useFormik({
    initialValues: {
      name: '', description: '', price: '', stock: '1', category: '', condition: '', saleType: 'buy-now', auctionEndDate: null,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
        if (images.length === 0) {
            alert('Vui lòng tải lên ít nhất một hình ảnh.');
            setSubmitting(false);
            return;
        }
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (values[key] !== null) formData.append(key, values[key])
        });
        
        const sortedImages = [...images];
        const mainImage = sortedImages.splice(mainImageIndex, 1)[0];
        sortedImages.unshift(mainImage);
        
        sortedImages.forEach(file => formData.append('images', file));
        onSave(values, images, setSubmitting);
    },
  });

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (images.length + files.length > 10) {
      alert('Bạn chỉ có thể tải lên tối đa 10 hình ảnh.');
      return;
    }
    setImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  useEffect(() => {
    if (editingProduct) {
      formik.setValues({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        stock: editingProduct.stock,
        category: editingProduct.category,
        condition: editingProduct.condition,
        saleType: editingProduct.saleType,
        auctionEndDate: editingProduct.auctionEndDate ? new Date(editingProduct.auctionEndDate) : null,
      });
      const fullImageUrls = editingProduct.images.map(img => `${process.env.REACT_APP_API_URL}${img}`);
      setImagePreviews(fullImageUrls);
      setImages(editingProduct.images); 
    } else {
      formik.resetForm();
      setImages([]);
      setImagePreviews([]);
      setMainImageIndex(0);
    }
  }, [editingProduct, open]);

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    if (mainImageIndex >= indexToRemove) {
      setMainImageIndex(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Đăng bán sản phẩm mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 1 }}>

            <Grid item xs={12} md={7}>
              <TextField fullWidth name="name" label="Tên sản phẩm" {...formik.getFieldProps('name')} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} sx={{ mb: 2 }} />
              <TextField fullWidth multiline rows={6} name="description" label="Mô tả chi tiết" {...formik.getFieldProps('description')} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} />
            </Grid>

            <Grid item xs={12} md={5}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Hình thức bán</FormLabel>
                <RadioGroup row name="saleType" {...formik.getFieldProps('saleType')}>
                  <FormControlLabel value="buy-now" control={<Radio />} label="Mua ngay" />
                  <FormControlLabel value="auction" control={<Radio />} label="Đấu giá" />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth type="number" name="price"
                label={formik.values.saleType === 'auction' ? 'Giá khởi điểm' : 'Giá bán'}
                InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                {...formik.getFieldProps('price')}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                sx={{ my: 2 }}
              />

              {formik.values.saleType === 'auction' && (
                <DateTimePicker
                  label="Ngày kết thúc đấu giá"
                  value={formik.values.auctionEndDate}
                  onChange={(value) => formik.setFieldValue('auctionEndDate', value)}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} error={formik.touched.auctionEndDate && Boolean(formik.errors.auctionEndDate)} helperText={formik.touched.auctionEndDate && formik.errors.auctionEndDate} />}
                />
              )}
              
              <TextField fullWidth type="number" name="stock" label="Số lượng trong kho" {...formik.getFieldProps('stock')} error={formik.touched.stock && Boolean(formik.errors.stock)} helperText={formik.touched.stock && formik.errors.stock} sx={{ mb: 2 }}/>
              <FormControl fullWidth sx={{ mb: 2 }} error={formik.touched.category && Boolean(formik.errors.category)}><InputLabel>Danh mục</InputLabel><Select name="category" label="Danh mục" {...formik.getFieldProps('category')}><MenuItem value="pokemon">Pokémon</MenuItem><MenuItem value="yugioh">Yugi-Oh!</MenuItem><MenuItem value="boardgame">Board Game</MenuItem><MenuItem value="other">Khác</MenuItem></Select></FormControl>
              <FormControl fullWidth error={formik.touched.condition && Boolean(formik.errors.condition)}><InputLabel>Tình trạng</InputLabel><Select name="condition" label="Tình trạng" {...formik.getFieldProps('condition')}><MenuItem value="new">Mới (New)</MenuItem><MenuItem value="like-new">Như mới (Like New)</MenuItem><MenuItem value="used">Đã qua sử dụng</MenuItem><MenuItem value="damaged">Hư hỏng nhẹ</MenuItem></Select></FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Hình ảnh sản phẩm (tối đa 10)</Typography>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {imagePreviews.map((url, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box component="img" src={url} sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, border: mainImageIndex === index ? '3px solid #1976d2' : '1px solid #ddd' }} onClick={() => setMainImageIndex(index)} />
                    {mainImageIndex === index && <Chip label="Ảnh bìa" size="small" color="primary" sx={{position: 'absolute', top: 4, left: 4}} />}
                    <IconButton size="small" sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper' }} onClick={() => removeImage(index)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button component="label" variant="outlined" sx={{ width: 100, height: 100, display: 'flex', flexDirection: 'column' }}>
                  <PhotoCamera /> Tải ảnh
                  <input type="file" accept="image/*" hidden multiple onChange={handleImageUpload} />
                </Button>
              </Paper>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Gửi đi duyệt'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ProductForm;