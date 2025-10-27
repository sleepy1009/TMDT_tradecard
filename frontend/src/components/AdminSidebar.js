import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
const navItems = [
  { key: 'users', label: 'Quản lý Người Dùng', icon: <PeopleIcon /> },
  { key: 'approvals', label: 'Duyệt Yêu Cầu', icon: <GavelIcon /> },
  { key: 'products', label: 'Duyệt sản phẩm', icon: <ShoppingBagIcon  /> },
];

export default function AdminSidebar({ selectedKey, onSelect }) {
  return (
    <Box
      sx={{
        width: 280,
        position: 'fixed',
        left: 0,
        top: '64px', 
        height: 'calc(100vh - 64px)',
        bgcolor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Admin Control Panel
      </Typography>
      <Divider />
      <List component="nav">
        {navItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={selectedKey === item.key}
            onClick={() => onSelect(item.key)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}