import React, { useState, useEffect } from 'react';
import { Box, Container, Avatar, Typography, IconButton, Button, CircularProgress, Stack, Grid, TextField, Alert, Fade } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { IoCameraOutline } from "react-icons/io5";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar';
import AddressBook from '../components/AddressBook'; 
import ImageCropper from '../components/ImageCropper';
import SellerRegistration from '../components/SellerRegistration';
import MyOrdersPage from './MyOrdersPage';
import '../styles/main.css';

function Account() {
  const { user, updateUser, token, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState('personal');

  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stagedAvatarBlob, setStagedAvatarBlob] = useState(null); 
  const [stagedAvatarUrl, setStagedAvatarUrl] = useState('');

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const fullAvatarUrl = user?.profilePicture ? `${process.env.REACT_APP_API_URL}${user.profilePicture}` : "/default-avatar.png";
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
    username: '',
    createdAt: '',
  });

  

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setUserData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profilePicture: user.profilePicture || '',
        username: user.username || '',
        createdAt: user.createdAt || '',
      });
    }
  }, [user]);

  const handleSidebarSelect = (key) => {
    if (key === 'home') navigate('/');
    else setSection(key);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setStagedAvatarBlob(null); 
    setStagedAvatarUrl('');
    if (user) setUserData(user);
  };

  const handleSave = async () => {
    setError('');
    setMessage('');
    setIsUploading(true);

    if (stagedAvatarBlob) {
      const formData = new FormData();
      formData.append('avatar', stagedAvatarBlob, 'avatar.jpg');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me/avatar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Lỗi tải ảnh lên.');
      } catch (err) {
        setError(err.message);
        setIsUploading(false);
        return; 
      }
    }
    
    try {
      await updateUser(userData); 
      await fetchUserProfile(token); 
      
      setMessage('Cập nhật thành công!');
      setEditMode(false);
      setStagedAvatarBlob(null);
      setStagedAvatarUrl('');
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật thông tin.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCropComplete = (blob, previewUrl) => {
    setStagedAvatarBlob(blob);       
    setStagedAvatarUrl(previewUrl);  
    setCropModalOpen(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result));
      reader.readAsDataURL(file);
      setCropModalOpen(true);
    }
    event.target.value = null; 
  };

  const handleAvatarSave = async (croppedImageBlob) => {
    setIsUploading(true);
    setError('');
    setCropModalOpen(false);

    const formData = new FormData();
    formData.append('avatar', croppedImageBlob, 'avatar.jpg');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Lỗi tải ảnh lên.');
      
      await fetchUserProfile(token); 
      setMessage('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };


  const renderSection = () => {
    switch (section) {
      case 'personal':
        return (
          <Box className="card" sx={{ maxWidth: 1200, mx: "auto", mt: 4, p: 4, position: 'relative', borderRadius: 3, boxShadow: 2}}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
              <Box sx={{ position: 'relative', mb: 1 }}>
                <Avatar src={fullAvatarUrl} sx={{ width: 110, height: 110 }} />
                {editMode && (
                  <IconButton sx={{ position: 'absolute', bottom: 6, right: 6, bgcolor: 'var(--surface-color)', boxShadow: 1 }} component="label">
                    {isUploading ? <CircularProgress size={24} /> : <IoCameraOutline />}
                    <input type="file" accept="image/*" hidden onChange={handleFileSelect} disabled={isUploading}/>
                  </IconButton>
                )}
              </Box>
              <Typography fontFamily={"roboto slab"} variant="h5" fontWeight={600}>{userData.fullName || userData.username}</Typography>
              <Typography sx={{ color: "var(--text-secondary)"}}>
                <HomeIcon fontSize="medium" sx={{ mr: 1}} />
                Thành viên kể từ {userData.createdAt ? new Date(userData.createdAt).getFullYear() : ""}
              </Typography>
            </Box>

            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Grid item><Typography fontFamily={"roboto slab"} variant="h6" fontWeight={700}>Thông tin cá nhân</Typography></Grid>
              <Grid item>
                <IconButton size="large" onClick={editMode ? handleCancelEdit : () => setEditMode(true)} sx={{ color: "var(--primary-color)" }}>
                  {editMode ? <CloseIcon /> : <EditIcon />}
                </IconButton>
              </Grid>
            </Grid>
            
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon sx={{ color: "var(--secondary-color)", mr: 2 }} />
                <TextField label="Tên đăng nhập" value={userData.username} disabled variant="standard" fullWidth />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon sx={{ color: "var(--primary-color)", mr: 2 }} />
                <TextField label="Email" value={userData.email} onChange={handleChange} name="email" variant="standard" fullWidth disabled={!editMode} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon sx={{ color: "var(--primary-color)", mr: 2 }} />
                <TextField label="Họ và tên" value={userData.fullName} onChange={handleChange} name="fullName" variant="standard" fullWidth disabled={!editMode} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneIcon sx={{ color: "var(--primary-color)", mr: 2 }} />
                <TextField label="Số điện thoại" value={userData.phoneNumber} onChange={handleChange} name="phoneNumber" variant="standard" fullWidth disabled={!editMode} />
              </Box>
            </Stack>
            
            {editMode && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <Button variant="contained" color="primary" startIcon={isUploading ? <CircularProgress size={18} /> : <SaveIcon />} onClick={handleSave} disabled={isUploading}>
                  Lưu thay đổi
                </Button>
              </Box>
            )}
          </Box>
        );
      case 'address':
        return <AddressBook />; 
      case 'seller':
        return <SellerRegistration />;
      case 'orders': 
        return <MyOrdersPage />;
      case 'transaction':
        return <Typography>Lịch sử giao dịch sẽ được hiển thị ở đây.</Typography>;
      case 'password':
        return <Typography>Chức năng đổi mật khẩu sẽ được hiển thị ở đây.</Typography>;
      default:
        navigate("/");
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AccountSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedKey={section}
        onSelect={(key) => setSection(key)}
        avatarUrl={fullAvatarUrl}
        displayName={userData.fullName || userData.username}
      />
      <Box sx={{ flex: 1, pl: sidebarOpen ? 28 : 9, pr: 0, pt: 4, transition: "padding-left 0.3s" }}>
        <Container maxWidth="md">
          <Fade in={!!message}><Alert severity="success" sx={{mb: 2}}>{message}</Alert></Fade>
          <Fade in={!!error}><Alert severity="error" sx={{mb: 2}}>{error}</Alert></Fade>
          {renderSection()}
        </Container>
      </Box>
      
      <ImageCropper
        src={imageToCrop}
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onSave={handleCropComplete}
      />
    </Box>
  );
}

export default Account;