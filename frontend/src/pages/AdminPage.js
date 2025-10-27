import React, { useState } from 'react';
import { Box } from '@mui/material';
import AdminSidebar from '../components/AdminSidebar';
import UserManagement from '../components/admin/UserManagement';
import ApprovalQueue from '../components/admin/ApprovalQueue';
import ProductApproval  from '../components/admin/ProductApproval';

function AdminPage() {
  const [section, setSection] = useState('users'); 

  const renderSection = () => {
    switch (section) {
      case 'users':
        return <UserManagement />;
      case 'approvals':
        return <ApprovalQueue />;
      case 'products':
        return <ProductApproval />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar selectedKey={section} onSelect={setSection} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          pl: '300px',
          mt: '64px' 
        }}
      >
        {renderSection()}
      </Box>
    </Box>
  );
}

export default AdminPage;