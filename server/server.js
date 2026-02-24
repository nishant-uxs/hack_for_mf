const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const commentRoutes = require('./routes/comments');
const leaderboardRoutes = require('./routes/leaderboard');
const { seedOrganizationsIfEmpty } = require('./utils/seedOrganizations');
const orgRoutes = require('./routes/org');

const app = express();

app.use(helmet());
const allowedOrigins = String(process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/org', orgRoutes);

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // For any request that doesn't match an API route, serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CivicSense API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicsense';
    
    // Add retry logic for Render deployment
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    };
    
    await mongoose.connect(mongoUri, options);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed');
    console.error(err.message);
    
    // In production, don't exit immediately, allow for retries
    if (process.env.NODE_ENV === 'production') {
      console.log('⏱️ Retrying database connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      console.error('Make sure MongoDB is running locally and MONGODB_URI is set correctly.');
      process.exit(1);
    }
  }
}

async function startServer() {
  console.log('\n========================================');
  console.log('  🏛️  CivicSense Server Starting...');
  console.log('========================================\n');

  // Step 1: Connect to MongoDB
  await connectDB();

  await seedOrganizationsIfEmpty();

  // Step 2: Start Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`  🚀 Server running on port ${PORT}`);
    console.log('========================================\n');
  });
}

startServer();
