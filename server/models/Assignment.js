// SQLite Assignment Model - Helper functions for database operations
const Assignment = {
  // Create assignment
  create: (db, assignmentData, callback) => {
    const { complaint, organization, channel, status, language, tone, attempts, lastError } = assignmentData;
    
    db.run(
      `INSERT INTO assignments (complaint_id, organization_id, channel, status, language, tone, attempts, last_error) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [complaint, organization, channel || 'email', status || 'queued', language || 'en', tone || 'formal', attempts || 0, lastError || ''],
      callback
    );
  },

  // Find assignments by complaint
  findByComplaint: (db, complaintId, callback) => {
    db.all('SELECT * FROM assignments WHERE complaint_id = ? ORDER BY created_at DESC', [complaintId], callback);
  },

  // Find assignments by organization
  findByOrganization: (db, organizationId, callback) => {
    db.all('SELECT * FROM assignments WHERE organization_id = ? ORDER BY created_at DESC', [organizationId], callback);
  },

  // Update assignment status
  updateStatus: (db, id, status, callback) => {
    db.run('UPDATE assignments SET status = ? WHERE id = ?', [status, id], callback);
  },

  // Find all assignments
  findAll: (db, callback) => {
    db.all('SELECT * FROM assignments ORDER BY created_at DESC', callback);
  }
};

module.exports = Assignment;
