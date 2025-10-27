import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormLabel 
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; 
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; 
import './CheckoutPage.css';

const SHIPPING_FEE_PER_SELLER = 30000;

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth(); 
  const { cartItems, selectedItems, clearCartState } = useCart();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
        fullName: '', phoneNumber: '', province: '', district: '', ward: '', street: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); 

  const itemsToCheckout = useMemo(() => cartItems.filter(item => selectedItems.has(item._id)), [cartItems, selectedItems]);

  const ordersBySeller = useMemo(() => {
     return itemsToCheckout.reduce((acc, item) => {
        const sellerId = item.seller?._id;
        if (!sellerId) {
             console.error("Item is missing seller information:", item);
             return acc; 
        }
        if (!acc[sellerId]) {
            acc[sellerId] = {
                sellerInfo: item.seller, 
                items: [],
                subtotal: 0,
            };
        }
        acc[sellerId].items.push(item);
        acc[sellerId].subtotal += item.price * item.quantity;
        return acc;
    }, {});
  }, [itemsToCheckout]);

  const subtotal = useMemo(() => itemsToCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0), [itemsToCheckout]);
  const totalShippingFee = useMemo(() => Object.keys(ordersBySeller).length * SHIPPING_FEE_PER_SELLER, [ordersBySeller]);
  const finalTotalAmount = subtotal + totalShippingFee;


  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (itemsToCheckout.length === 0 && !isPlacingOrder && !orderSuccess) {
      navigate('/cart');
    }
  }, [itemsToCheckout, navigate, isPlacingOrder, orderSuccess]); 

  useEffect(() => {
    if (user) {
      const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];
      const baseInfo = { fullName: user.fullName || '', phoneNumber: user.phoneNumber || '' };
      if (defaultAddress) {
        setShippingInfo({
             fullName: baseInfo.fullName,
             phoneNumber: baseInfo.phoneNumber,
             province: defaultAddress.province || '',
             district: defaultAddress.district || '',
             ward: defaultAddress.ward || '',
             street: defaultAddress.street || '',
        });
      } else {
        setShippingInfo(prev => ({ ...prev, ...baseInfo }));
      }
    }
  }, [user]);

  useEffect(() => {
    setIsAddressLoading(true);
    fetch('https://provinces.open-api.vn/api/p/').then(res => res.json()).then(data => {
      setProvinces(data);
      setIsAddressLoading(false);
    }).catch(() => setIsAddressLoading(false));
  }, []);

  useEffect(() => {
    if (!shippingInfo.province) return;
    const provinceCode = provinces.find(p => p.name === shippingInfo.province)?.code;
    if (provinceCode) {
      setIsAddressLoading(true);
      fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`).then(res => res.json()).then(data => {
        setDistricts(data.districts || []);
        if (!data.districts?.some(d => d.name === shippingInfo.district)) {
          setShippingInfo(prev => ({ ...prev, district: '', ward: '' })); 
          setWards([]); 
        }
        setIsAddressLoading(false);
      }).catch(() => setIsAddressLoading(false));
    } else {
        setDistricts([]);
        setWards([]);
        setShippingInfo(prev => ({ ...prev, district: '', ward: '' }));
    }
  }, [shippingInfo.province, provinces]); 


  useEffect(() => {
    if (!shippingInfo.district) return;
    const districtCode = districts.find(d => d.name === shippingInfo.district)?.code;
    if (districtCode) {
      setIsAddressLoading(true);
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`).then(res => res.json()).then(data => {
        setWards(data.wards || []);
        if (!data.wards?.some(w => w.name === shippingInfo.ward)) {
          setShippingInfo(prev => ({ ...prev, ward: '' })); 
        }
        setIsAddressLoading(false);
      }).catch(() => setIsAddressLoading(false));
    } else {
         setWards([]);
         setShippingInfo(prev => ({ ...prev, ward: '' }));
    }
  }, [shippingInfo.district, districts]); 


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceAllOrders = async () => {
    setIsPlacingOrder(true);
    setOrderError('');
    setOrderSuccess(false);

    if (!user || !token) {
        setOrderError('Lỗi xác thực. Vui lòng đăng nhập lại.');
        setIsPlacingOrder(false);
        return;
    }
    if (!shippingInfo.fullName || !shippingInfo.phoneNumber || !shippingInfo.province || !shippingInfo.district || !shippingInfo.ward || !shippingInfo.street) {
        setOrderError('Vui lòng điền đầy đủ thông tin giao hàng.');
        setIsPlacingOrder(false);
        return;
    }
    if (!paymentMethod) {
        setOrderError('Vui lòng chọn phương thức thanh toán.');
        setIsPlacingOrder(false);
        return;
    }

    try {
        if (itemsToCheckout.length === 0) throw new Error('Giỏ hàng trống.');

        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                itemsToCheckout: itemsToCheckout,
                shippingAddress: shippingInfo,
                paymentMethod: paymentMethod
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Đặt hàng thất bại.');

        setOrderSuccess(true);
        clearCartState(); 
        setTimeout(() => navigate('/my-orders'), 2000); 

    } catch (err) {
        setOrderError(err.message);
    } finally {
        setIsPlacingOrder(false);
    }
  };

   if (itemsToCheckout.length === 0 && !orderSuccess) {
     return (
       <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
         <CircularProgress />
       </Box>
     );
   }

  return (
    <div className="checkout-container">
      <h1>Xác nhận và Thanh toán</h1>
       <Snackbar open={orderSuccess} autoHideDuration={6000} onClose={() => setOrderSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
           <Alert onClose={() => setOrderSuccess(false)} severity="success" sx={{ width: '100%' }}>
               Đặt hàng thành công! Đang chuyển hướng đến trang đơn hàng...
           </Alert>
       </Snackbar>
       <Snackbar open={!!orderError} autoHideDuration={6000} onClose={() => setOrderError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
           <Alert onClose={() => setOrderError('')} severity="error" sx={{ width: '100%' }}>
               {orderError}
           </Alert>
       </Snackbar>

      <div className="checkout-layout-grouped">
        <div className="orders-list">
          {Object.entries(ordersBySeller).map(([sellerId, order]) => (
            <Paper key={sellerId} className="seller-order-card">
              <Box className="seller-header">
                <Avatar sx={{ mr: 1.5 }} src={order.sellerInfo?.profilePicture ? `${process.env.REACT_APP_API_URL}${order.sellerInfo.profilePicture}` : ''} />
                <Typography fontWeight="bold">{order.sellerInfo?.username || 'N/A'}</Typography>
              </Box>
              <Divider />
              {order.items.map(item => (
                <Box key={item._id || item.productId} className="order-item"> 
                  <img src={item.images[0]} alt={item.name} />
                  <div className="item-details">
                    <Typography>{item.name}</Typography>
                    <Typography color="text.secondary">Số lượng: {item.quantity}</Typography>
                  </div>
                  <Typography fontWeight="bold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box className="order-subtotal" sx={{ pt: 1 }}>
                <Typography>Phí vận chuyển (tạm tính):</Typography>
                <Typography>{SHIPPING_FEE_PER_SELLER.toLocaleString('vi-VN')}đ</Typography>
              </Box>
               <Box className="order-subtotal" sx={{ pt: 1 }}>
                <Typography>Tổng của người bán:</Typography>
                <Typography variant="h6">{(order.subtotal + SHIPPING_FEE_PER_SELLER).toLocaleString('vi-VN')}đ</Typography>
              </Box>
            </Paper>
          ))}
        </div>

        <div className="checkout-summary-sticky">
          <Paper className="total-summary-card">
            <Typography variant="h6">Thông tin giao hàng</Typography>
            <form className="shipping-form-structured">
              <TextField label="Họ và tên" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} fullWidth required />
              <TextField label="Số điện thoại" name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleInputChange} fullWidth required />
              <FormControl fullWidth disabled={isAddressLoading}>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select name="province" value={shippingInfo.province} label="Tỉnh/Thành phố" onChange={handleInputChange}>
                  {provinces.map(p => <MenuItem key={p.code} value={p.name}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!shippingInfo.province || isAddressLoading}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select name="district" value={shippingInfo.district} label="Quận/Huyện" onChange={handleInputChange}>
                  {districts.map(d => <MenuItem key={d.code} value={d.name}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!shippingInfo.district || isAddressLoading}>
                <InputLabel>Phường/Xã</InputLabel>
                <Select name="ward" value={shippingInfo.ward} label="Phường/Xã" onChange={handleInputChange}>
                  {wards.map(w => <MenuItem key={w.code} value={w.name}>{w.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Số nhà, tên đường" name="street" value={shippingInfo.street} onChange={handleInputChange} fullWidth required />
            </form>

            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>Phương thức thanh toán</FormLabel>
              <RadioGroup
                aria-label="payment-method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="cod" control={<Radio />} label={
                    <Box sx={{display: 'flex', alignItems: 'center'}}><LocalShippingIcon sx={{mr: 1}}/> Thanh toán khi nhận hàng (COD)</Box>
                } />
                <FormControlLabel value="bank_transfer" control={<Radio />} label={
                    <Box sx={{display: 'flex', alignItems: 'center'}}><AccountBalanceIcon sx={{mr: 1}}/> Chuyển khoản ngân hàng</Box>
                } />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Box className="summary-line">
              <Typography>Tạm tính ({itemsToCheckout.length} sản phẩm):</Typography>
              <Typography>{subtotal.toLocaleString('vi-VN')}đ</Typography>
            </Box>
             <Box className="summary-line">
              <Typography>Phí vận chuyển (tạm tính):</Typography>
              <Typography>{totalShippingFee.toLocaleString('vi-VN')}đ</Typography>
            </Box>
             <Box className="summary-line" sx={{ mt: 1 }}>
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {finalTotalAmount.toLocaleString('vi-VN')}đ
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handlePlaceAllOrders}
              disabled={isPlacingOrder || itemsToCheckout.length === 0}
              sx={{ mt: 2 }}
            >
              {isPlacingOrder ? <CircularProgress size={24} color="inherit" /> : `Đặt hàng (${itemsToCheckout.length})`}
            </Button>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;