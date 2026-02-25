const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

// Make database available to routes
app.set('db', db);

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

// SQLite Database Setup
const db = new sqlite3.Database('./civicsense.db');

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    organization_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Organizations table
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    categories TEXT,
    contacts TEXT,
    is_active BOOLEAN DEFAULT 1
  )`);

  // Complaints table
  db.run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT,
    pincode TEXT,
    location TEXT,
    address TEXT,
    images TEXT,
    status TEXT DEFAULT 'pending',
    user_id INTEGER,
    votes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Assignments table
  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    organization_id INTEGER NOT NULL,
    channel TEXT DEFAULT 'email',
    status TEXT DEFAULT 'queued',
    language TEXT DEFAULT 'en',
    tone TEXT DEFAULT 'formal',
    attempts INTEGER DEFAULT 0,
    last_error TEXT DEFAULT '',
    sent_at DATETIME,
    acknowledged_at DATETIME,
    accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id)
  )`);

  console.log('✅ SQLite database initialized');
}

async function connectDB() {
  try {
    initializeDatabase();
    console.log('✅ SQLite database connected');
  } catch (err) {
    console.error('❌ Database connection failed');
    console.error(err.message);
    process.exit(1);
  }
}

async function startServer() {
  console.log('\n========================================');
  console.log('  🏛️  CivicSense Server Starting...');
  console.log('========================================\n');

  // Step 1: Connect to SQLite Database
  await connectDB();

  // Seed default organizations
  seedOrganizations();

  // Step 2: Start Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`  🚀 Server running on port ${PORT}`);
    console.log('========================================\n');
  });
}

// Seed organizations
function seedOrganizations() {
  const organizations = [
    { name: 'Municipal Sanitation Department', type: 'department', categories: 'garbage,drainage', contacts: '{}', is_active: 1 },
    { name: 'Public Works Department (PWD)', type: 'department', categories: 'pothole,road_damage', contacts: '{}', is_active: 1 },
    { name: 'Water Supply Department', type: 'department', categories: 'water_leakage', contacts: '{}', is_active: 1 },
    { name: 'Electricity / Streetlight Department', type: 'department', categories: 'streetlight', contacts: '{}', is_active: 1 },
    { name: 'Local Civic NGO Network', type: 'ngo', categories: 'other', contacts: '{}', is_active: 1 }
  ];

  db.get('SELECT COUNT(*) as count FROM organizations', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO organizations (name, type, categories, contacts, is_active) VALUES (?, ?, ?, ?, ?)');
      organizations.forEach(org => {
        stmt.run([org.name, org.type, org.categories, org.contacts, org.is_active]);
      });
      stmt.finalize();
      console.log('✅ Organizations seeded successfully');
    }
  });
}

startServer();
