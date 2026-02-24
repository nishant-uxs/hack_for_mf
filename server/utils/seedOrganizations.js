const Organization = require('../models/Organization');

async function seedOrganizationsIfEmpty() {
  const defaults = [
    {
      name: 'Municipal Sanitation Department',
      type: 'department',
      categories: ['garbage', 'drainage'],
      contacts: { emails: [] },
      isActive: true
    },
    {
      name: 'Public Works Department (PWD)',
      type: 'department',
      categories: ['pothole', 'road_damage'],
      contacts: { emails: [] },
      isActive: true
    },
    {
      name: 'Water Supply Department',
      type: 'department',
      categories: ['water_leakage'],
      contacts: { emails: [] },
      isActive: true
    },
    {
      name: 'Electricity / Streetlight Department',
      type: 'department',
      categories: ['streetlight'],
      contacts: { emails: [] },
      isActive: true
    },
    {
      name: 'Local Civic NGO Network',
      type: 'ngo',
      categories: ['other'],
      contacts: { emails: [] },
      isActive: true
    }
  ];

  const existing = await Organization.find({
    name: { $in: defaults.map((d) => d.name) }
  }).select('name');

  const existingNames = new Set(existing.map((o) => o.name));
  const toInsert = defaults.filter((d) => !existingNames.has(d.name));
  if (toInsert.length === 0) return;

  await Organization.insertMany(toInsert);
}

module.exports = {
  seedOrganizationsIfEmpty
};
