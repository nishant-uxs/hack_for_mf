const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');
const NotificationLog = require('../models/NotificationLog');
const { createAssignmentsForComplaint, sendNotificationsForComplaint } = require('../utils/assignmentService');

async function upsertOrg({ name, categories, email, cityCoverage = [], pincodeCoverage = [] }) {
  let org = await Organization.findOne({ name });
  if (!org) {
    org = await Organization.create({
      name,
      type: 'ngo',
      categories,
      contacts: { emails: [email] },
      coverage: { cities: cityCoverage, pincodes: pincodeCoverage },
      isActive: true
    });
  } else {
    org.categories = categories;
    org.contacts = org.contacts || {};
    org.contacts.emails = [email];
    org.coverage = org.coverage || {};
    org.coverage.cities = cityCoverage;
    org.coverage.pincodes = pincodeCoverage;
    org.isActive = true;
    await org.save();
  }
  return org;
}

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@civicsense.local';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin'
    });
  }
  if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }
  return admin;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicsense';
  await mongoose.connect(mongoUri);

  await upsertOrg({
    name: 'Test NGO City',
    categories: ['other'],
    email: 'test.ngo.city@example.com',
    cityCoverage: ['TestCity'],
    pincodeCoverage: ['110001']
  });

  await upsertOrg({
    name: 'Test NGO General',
    categories: ['other'],
    email: 'test.ngo.general@example.com',
    cityCoverage: [],
    pincodeCoverage: []
  });

  const admin = await ensureAdmin();

  const complaint = await Complaint.create({
    title: 'Test other issue in TestCity',
    description: 'Test issue for area routing.',
    category: 'other',
    city: 'TestCity',
    pincode: '110001',
    location: { type: 'Point', coordinates: [77.2, 28.61], address: 'Test Address' },
    images: [],
    reporter: admin._id,
    statusHistory: [{ status: 'Reported', timestamp: new Date(), updatedBy: admin._id }]
  });

  await createAssignmentsForComplaint(complaint);
  await sendNotificationsForComplaint(complaint);

  const assignments = await Assignment.find({ complaint: complaint._id })
    .populate('organization', 'name coverage')
    .lean();

  const logs = await NotificationLog.find({ assignment: { $in: assignments.map((a) => a._id) } })
    .select('channel to error template provider')
    .lean();

  console.log('Complaint:', String(complaint._id));
  console.log('Assignments org names:', assignments.map((a) => a.organization?.name));
  console.log('Expected to include Test NGO City and exclude Test NGO General when area match exists.');
  console.log('Logs:', logs.map((l) => ({ channel: l.channel, to: l.to, provider: l.provider, template: l.template?.id, error: l.error })));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
