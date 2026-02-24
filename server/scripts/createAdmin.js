const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'agarwalnishant82@gmail.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Nishant Agarwal',
      email: 'agarwalnishant82@gmail.com',
      password: 'admin123', // Change this password!
      role: 'admin'
    });

    console.log('✅ Admin created successfully');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123 (CHANGE THIS!)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
