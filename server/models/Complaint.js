// SQLite Complaint Model - Helper functions for database operations
const Complaint = {
  // Create complaint
  create: (db, complaintData, callback) => {
    const { title, description, category, city, pincode, location, address, images, status, reporter } = complaintData;
    
    db.run(
      `INSERT INTO complaints (title, description, category, city, pincode, location, address, images, status, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, city, pincode, location, address, JSON.stringify(images), status, reporter],
      callback
    );
  },

  // Find all complaints
  findAll: (db, callback) => {
    db.all('SELECT * FROM complaints ORDER BY created_at DESC', callback);
  },

  // Find complaint by ID
  findById: (db, id, callback) => {
    db.get('SELECT * FROM complaints WHERE id = ?', [id], callback);
  },

  // Find complaints by user
  findByUser: (db, userId, callback) => {
    db.all('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC', [userId], callback);
  },

  // Update complaint status
  updateStatus: (db, id, status, callback) => {
    db.run('UPDATE complaints SET status = ? WHERE id = ?', [status, id], callback);
  },

  // Calculate impact score
  calculateImpactScore: (complaint) => {
    const daysPending = Math.floor((Date.now() - new Date(complaint.created_at)) / (1000 * 60 * 60 * 24));
    return (complaint.votes || 0) * (daysPending + 1);
  }
};

module.exports = Complaint;
