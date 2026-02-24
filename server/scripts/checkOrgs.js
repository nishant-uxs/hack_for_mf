const mongoose = require('mongoose');
const Organization = require('../models/Organization');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicsense';
  await mongoose.connect(mongoUri);

  const count = await Organization.countDocuments();
  console.log('Organization count:', count);

  const sample = await Organization.find().sort({ createdAt: -1 }).limit(10).lean();
  console.log(
    sample.map((o) => ({
      id: String(o._id),
      name: o.name,
      type: o.type,
      categories: o.categories,
      emails: (o.contacts && o.contacts.emails) || []
    }))
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
