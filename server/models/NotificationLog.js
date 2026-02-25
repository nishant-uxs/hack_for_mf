// SQLite NotificationLog Model - Helper functions for database operations
const NotificationLog = {
  // Create notification log
  create: (db, logData, callback) => {
    const { assignment, channel, provider, to, subject, body, template, success, providerMessageId, error } = logData;
    
    db.run(
      `INSERT INTO notification_logs (assignment_id, channel, provider, to, subject, body, template_id, template_language, template_tone, success, provider_message_id, error) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assignment, channel || 'email', provider || 'none', to, subject || '', body || '', template?.id || '', template?.language || 'en', template?.tone || 'formal', success || false, providerMessageId || '', error || ''],
      callback
    );
  },

  // Find logs by assignment
  findByAssignment: (db, assignmentId, callback) => {
    db.all('SELECT * FROM notification_logs WHERE assignment_id = ? ORDER BY created_at DESC', [assignmentId], callback);
  },

  // Find all logs
  findAll: (db, callback) => {
    db.all('SELECT * FROM notification_logs ORDER BY created_at DESC', callback);
  },

  // Find successful logs
  findSuccessful: (db, callback) => {
    db.all('SELECT * FROM notification_logs WHERE success = 1 ORDER BY created_at DESC', callback);
  },

  // Find failed logs
  findFailed: (db, callback) => {
    db.all('SELECT * FROM notification_logs WHERE success = 0 ORDER BY created_at DESC', callback);
  }
};

module.exports = NotificationLog;
