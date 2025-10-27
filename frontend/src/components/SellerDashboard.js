import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';

import OverviewTab from './seller/OverviewTab';
import ProductManagementTab from './seller/ProductManagementTab';
import SellerSettings from './seller/SellerSettings'; 

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import OrderManagementTab from './seller/OrderManagementTab';


function SellerDashboard() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Kênh Người Bán
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="seller dashboard tabs">
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Tổng Quan" />
          <Tab icon={<InventoryIcon />} iconPosition="start" label="Quản Lý Sản Phẩm" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Đơn Hàng" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Cài Đặt" />
        </Tabs>
      </Box>

      <Box>
        {currentTab === 0 && <OverviewTab />}
        {currentTab === 1 && <ProductManagementTab />}
        {currentTab === 2 && <OrderManagementTab />}
        {currentTab === 3 && <SellerSettings />}
      </Box>
    </Paper>
  );
}

export default SellerDashboard;