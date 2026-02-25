// SQLite Organization Model - Helper functions for database operations
const Organization = {
  // Find all organizations
  findAll: (db, callback) => {
    db.all('SELECT * FROM organizations WHERE is_active = 1 ORDER BY name', callback);
  },

  // Find organization by ID
  findById: (db, id, callback) => {
    db.get('SELECT * FROM organizations WHERE id = ?', [id], callback);
  },

  // Find organizations by category
  findByCategory: (db, category, callback) => {
    db.all('SELECT * FROM organizations WHERE is_active = 1 AND categories LIKE ? ORDER BY name', [`%${category}%`], callback);
  },

  // Create organization
  create: (db, orgData, callback) => {
    const { name, type, categories, contacts, isActive = true } = orgData;
    
    db.run(
      'INSERT INTO organizations (name, type, categories, contacts, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, type, JSON.stringify(categories), JSON.stringify(contacts), isActive ? 1 : 0],
      callback
    );
  }
};

module.exports = Organization;
