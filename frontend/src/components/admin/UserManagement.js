import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@mui/material';
import { format } from 'date-fns';

function BanUserDialog({ open, onClose, onConfirm, user }) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(7); 

  const handleConfirm = () => {
    onConfirm(user._id, {
      isBanned: true,
      banReason: reason,
      banDurationDays: duration === 0 ? null : duration
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Khóa tài khoản: {user?.username}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Lý do khóa" type="text" fullWidth variant="standard" value={reason} onChange={(e) => setReason(e.target.value)} />
        <FormControl fullWidth sx={{mt: 2}}>
          <InputLabel>Thời hạn khóa</InputLabel>
          <Select value={duration} label="Thời hạn khóa" onChange={(e) => setDuration(e.target.value)}>
            <MenuItem value={7}>7 ngày</MenuItem>
            <MenuItem value={30}>30 ngày</MenuItem>
            <MenuItem value={0}>Vĩnh viễn</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleConfirm} color="error">Xác nhận Khóa</Button>
      </DialogActions>
    </Dialog>
  );
}

function UserManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users.');
      setUsers(data);
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleManageUser = async (userId, updateData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra.');
    }
  };

  const openBanDialog = (user) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };
  
  return (
    <Paper sx={{ p: 2, overflow: 'hidden' }}>
      <Typography variant="h5" gutterBottom>Quản lý Người Dùng</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> :
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Tài khoản</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tham gia</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{user.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={user.sellerStatus === 'approved' ? 'Người Bán' : 'Người Mua'} size="small" color={user.sellerStatus === 'approved' ? 'info' : 'default'} />
                </TableCell>
                <TableCell>
                  {user.isBanned ? (
                    <Tooltip title={`Lý do: ${user.banDetails?.reason || 'N/A'} - Mở khóa: ${user.banDetails?.bannedUntil ? format(new Date(user.banDetails.bannedUntil), 'dd/MM/yyyy') : 'Vĩnh viễn'}`}>
                      <Chip label="Đã khóa" color="error" size="small" />
                    </Tooltip>
                  ) : <Chip label="Hoạt động" color="success" size="small" />}
                </TableCell>
                <TableCell>{format(new Date(user.createdAt), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user.isBanned ? (
                      <Button size="small" color="success" variant="outlined" onClick={() => handleManageUser(user._id, { isBanned: false })}>Mở khóa</Button>
                    ) : (
                      <Button size="small" color="error" variant="outlined" onClick={() => openBanDialog(user)}>Khóa</Button>
                    )}
                    {user.sellerStatus === 'approved' && (
                       <Button size="small" color="warning" variant="outlined" onClick={() => handleManageUser(user._red, { sellerStatus: 'none' })}>Hủy quyền bán</Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      }
      {selectedUser && <BanUserDialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)} onConfirm={handleManageUser} user={selectedUser} />}
    </Paper>
  );
}

export default UserManagement;