const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
const PORT = 5000;
const User = require('./models/User'); 
const bcrypt = require('bcrypt');



app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('MongoDB connected...');
    const seedAdmin = async () => {
      try {
        const adminExists = await User.findOne({ email: 'admin@admin.com' });
        if (!adminExists) {
          console.log('Admin user not found, creating one...');
          const admin = new User({
            username: 'admin',
            email: 'admin@admin.com',
            password: 'adminpassword', 
            fullName: 'Quản Trị Viên',
            isAdmin: true,
            sellerStatus: 'approved' 
          });
          await admin.save();
          console.log('Admin user created successfully.');
        } else {
          console.log('Admin user already exists.');
        }
      } catch (error) {
        console.error('Error seeding admin user:', error);
      }
    };
    seedAdmin(); 
  })
  .catch(err => console.error(err));
 

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const sellerRoutes = require('./routes/sellerRoutes');
app.use('/api/seller', sellerRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});