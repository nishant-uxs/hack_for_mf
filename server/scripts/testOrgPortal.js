const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

async function ensureOrgUser() {
  const org = await Organization.findOne({ name: 'Public Works Department (PWD)' });
  if (!org) throw new Error('PWD organization not found');

  const email = 'pwd.user@civicsense.local';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: 'PWD User',
      email,
      password: 'pwd12345',
      role: 'org_user',
      organization: org._id
    });
  }

  return { org, user, email, password: 'pwd12345' };
}

async function httpJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json'
    }
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicsense';
  await mongoose.connect(mongoUri);

  const { email, password } = await ensureOrgUser();
  await mongoose.disconnect();

  const base = 'http://localhost:5000';

  const login = await httpJson(`${base}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (!login.data || !login.data.token) {
    console.log('Login failed:', login);
    process.exit(1);
  }

  const token = login.data.token;

  const list = await httpJson(`${base}/api/org/assignments?limit=5`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('Assignments list status:', list.status);
  console.log('Assignments count:', list.data?.assignments?.length);

  const first = list.data?.assignments?.[0];
  if (!first) {
    console.log('No assignments found to test updates.');
    return;
  }

  const ack = await httpJson(`${base}/api/org/assignments/${first._id}/acknowledge`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({})
  });
  console.log('Acknowledge status:', ack.status, 'newStatus:', ack.data?.assignment?.status);

  const accept = await httpJson(`${base}/api/org/assignments/${first._id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({})
  });
  console.log('Accept status:', accept.status, 'newStatus:', accept.data?.assignment?.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
