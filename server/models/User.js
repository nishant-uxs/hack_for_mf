const bcrypt = require('bcryptjs');

// SQLite User Model - Helper functions for database operations
const User = {
  // Find user by ID
  findById: (db, id, callback) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  },

  // Find user by email
  findByEmail: (db, email, callback) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  },

  // Create user
  create: (db, userData, callback) => {
    const { name, email, password, phone, role = 'user' } = userData;
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role],
      callback
    );
  },

  // Compare password
  comparePassword: (candidatePassword, hashedPassword) => {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
};

module.exports = User;
