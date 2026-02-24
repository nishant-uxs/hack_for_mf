const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');
const NotificationLog = require('../models/NotificationLog');
const { createAssignmentsForComplaint, sendNotificationsForComplaint } = require('../utils/assignmentService');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicsense';
  await mongoose.connect(mongoUri);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@civicsense.local';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin'
    });
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }

  const orgCount = await Organization.countDocuments();
  console.log('Organizations:', orgCount);

  const complaint = await Complaint.create({
    title: 'Test pothole near main road',
    description: 'There is a pothole causing accidents. Please repair urgently.',
    category: 'pothole',
    city: 'TestCity',
    pincode: '110001',
    location: {
      type: 'Point',
      coordinates: [77.209, 28.6139],
      address: 'Test Address'
    },
    images: [],
    reporter: admin._id,
    statusHistory: [{ status: 'Reported', timestamp: new Date(), updatedBy: admin._id }]
  });

  console.log('Created complaint:', String(complaint._id));

  await createAssignmentsForComplaint(complaint);
  await sendNotificationsForComplaint(complaint);

  const assignments = await Assignment.find({ complaint: complaint._id })
    .populate('organization', 'name contacts')
    .lean();

  const logs = await NotificationLog.find({
    assignment: { $in: assignments.map((a) => a._id) }
  }).lean();

  console.log('Assignments created:', assignments.length);
  console.log(assignments.map((a) => ({ org: a.organization?.name, status: a.status, attempts: a.attempts, lastError: a.lastError })));

  console.log('Notification logs:', logs.length);
  console.log(logs.map((l) => ({ to: l.to, success: l.success, error: l.error })));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
