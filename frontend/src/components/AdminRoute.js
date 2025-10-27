import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function AdminRoute({ children }) {
  const { user, token } = useAuth();

  if (!user && token) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (user && user.isAdmin) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export default AdminRoute;