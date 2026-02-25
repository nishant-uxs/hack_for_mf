// SQLite Comment Model - Helper functions for database operations
const Comment = {
  // Create comment
  create: (db, commentData, callback) => {
    const { complaint, user, text } = commentData;
    
    db.run(
      'INSERT INTO comments (complaint_id, user_id, text) VALUES (?, ?, ?)',
      [complaint, user, text],
      callback
    );
  },

  // Find comments by complaint
  findByComplaint: (db, complaintId, callback) => {
    db.all('SELECT * FROM comments WHERE complaint_id = ? ORDER BY created_at ASC', [complaintId], callback);
  },

  // Find comment by ID
  findById: (db, id, callback) => {
    db.get('SELECT * FROM comments WHERE id = ?', [id], callback);
  },

  // Find all comments
  findAll: (db, callback) => {
    db.all('SELECT * FROM comments ORDER BY created_at DESC', callback);
  },

  // Delete comment
  delete: (db, id, callback) => {
    db.run('DELETE FROM comments WHERE id = ?', [id], callback);
  }
};

module.exports = Comment;
