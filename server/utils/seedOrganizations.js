const Organization = require('../models/Organization');

function seedOrganizationsIfEmpty(db) {
  try {
    const defaults = [
      {
        name: 'Municipal Sanitation Department',
        type: 'department',
        categories: JSON.stringify(['garbage', 'drainage']),
        contacts: JSON.stringify({ emails: [] }),
        is_active: 1
      },
      {
        name: 'Public Works Department (PWD)',
        type: 'department',
        categories: JSON.stringify(['pothole', 'road_damage']),
        contacts: JSON.stringify({ emails: [] }),
        is_active: 1
      },
      {
        name: 'Water Supply Department',
        type: 'department',
        categories: JSON.stringify(['water_leakage']),
        contacts: JSON.stringify({ emails: [] }),
        is_active: 1
      },
      {
        name: 'Electricity / Streetlight Department',
        type: 'department',
        categories: JSON.stringify(['streetlight']),
        contacts: JSON.stringify({ emails: [] }),
        is_active: 1
      },
      {
        name: 'Local Civic NGO Network',
        type: 'ngo',
        categories: JSON.stringify(['other']),
        contacts: JSON.stringify({ emails: [] }),
        is_active: 1
      }
    ];

    db.get('SELECT COUNT(*) as count FROM organizations', (err, row) => {
      if (err) {
        console.error('❌ Error checking organizations:', err);
        return;
      }

      if (row.count > 0) {
        console.log('✅ Organizations already exist');
        return;
      }

      const stmt = db.prepare('INSERT INTO organizations (name, type, categories, contacts, is_active) VALUES (?, ?, ?, ?, ?)');
      defaults.forEach(org => {
        stmt.run([org.name, org.type, org.categories, org.contacts, org.is_active]);
      });
      stmt.finalize();
      console.log('✅ Organizations seeded successfully');
    });
  } catch (error) {
    console.error('❌ Error seeding organizations:', error.message);
  }
}

module.exports = {
  seedOrganizationsIfEmpty
};
