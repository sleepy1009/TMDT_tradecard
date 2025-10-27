import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Badge,
  Select,
  FormControl,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { FaSearch, FaShoppingCart, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import cardIcon from '../images/icon_card.png';
import catDefault from '../images/cat.png';

const Search = styled('form')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: 25,
  backgroundColor: alpha(theme.palette.common.white, 0.95),
  boxShadow: theme.shadows[1],
  border: '2px solid #DCDCDC',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  flexGrow: 1,
  marginLeft: theme.spacing(1),
  fontSize: '1rem',
}));

function Header() {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const matches = useMediaQuery('(max-width:900px)');

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  

  return (
    <AppBar position="fixed" elevation={0} sx={{ background: '#F8F8F8', color: '#333', boxShadow: 1 }}>
      <Toolbar sx={{
          minHeight: 108,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', 
          px: matches ? 1 : 4,
          gap: matches ? 1 : 2 
        }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: '#37353E' }}>
            <img src={cardIcon} alt="Card Icon" style={{ width: 44, height: 44, objectFit: 'contain', marginRight: 8 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Roboto Slab, serif', fontSize: matches ? '1.2rem' : '1.7rem' }}>
              W/card
            </Typography>
          </Link>
        </Box>

        <Box sx={{  minWidth: matches ? 320 : 600, justifySelf: 'center' }}>
          <Search>
            <FormControl variant="standard" sx={{ minWidth: 120 }}>
              <Select
                defaultValue="all"
                sx={{
                  background: '#f0f0f0',
                  borderRadius: 20,
                  fontSize: '0.95rem',
                  '& .MuiSelect-select': { padding: '8px 16px' },
                }}
                disableUnderline
              >
                <MenuItem value="all">Tất cả danh mục</MenuItem>
                <MenuItem value="pokemon">Thẻ bài Pokémon</MenuItem>
                <MenuItem value="yugioh">Thẻ bài Yugi-Oh!</MenuItem>
                <MenuItem value="boardgame">Board Game</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </Select>
            </FormControl>
            <StyledInputBase placeholder="Tìm kiếm thẻ bài, board game..." />
            <IconButton type="submit" sx={{ ml: 1, background: '#d9d9d9ff', color: 'black', borderRadius: 20 }}>
              <FaSearch />
            </IconButton>
          </Search>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
          {user ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0,
                  borderRadius: 2,
                  background: alpha('#e9ecef', 0.7),
                  '&:hover': { background: alpha('#e9ecef', 1) },
                  maxWidth: '100%', 
                }}
              >
                <Avatar src={user.profilePicture ? `${process.env.REACT_APP_API_URL}${user.profilePicture}` : catDefault} sx={{ width: 40, height: 40, border: '3px solid #ddd', flexShrink: 0 }} />
                <Typography
                  sx={{
                    ml: 3,
                    fontWeight: 'bold',
                    fontSize: 20,
                    color: '#495057',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap', 
                    maxWidth: 300, 
                    fontFamily: "roboto slab",
                  }}
                >
                  Xin chào, {user.username.length > 10 ? user.username.substring(0, 10) + '...' : user.username}
                </Typography>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 4,
                    boxShadow: 3,
                  }
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: '-100px' }}
              >
                <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                  <FaUserCircle style={{ marginRight: 8, fontSize: "normal" }} />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 18,
                      fontFamily: "Roboto slab",
                      fontWeight: "bold"
                    }}
                  >
                    Thông tin cá nhân
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <FaSignOutAlt style={{ marginRight: 8, fontSize: "normal" }} />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 18,
                      fontFamily: "Roboto slab",
                      fontWeight: "bold"
                    }}
                  >
                    Đăng xuất
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" sx={{ color: '#333', fontWeight: 500, textTransform: 'none', borderRadius: 10 }}>
                Đăng nhập
              </Button>
              <Button component={Link} to="/register" variant="contained" sx={{ background: '#37353E', color: 'white', borderRadius: 10, fontWeight: 500, textTransform: 'none' }}>
                Đăng ký
              </Button>
            </>
          )}
          <IconButton component={Link} to="/cart" size="large" sx={{ color: '#333' }}>
            <Badge badgeContent={totalItems} color="secondary" overlap="circular" invisible={totalItems === 0}>
              <FaShoppingCart style={{ fontSize: '1.5rem' }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;