const Organization = require('../models/Organization');
const Assignment = require('../models/Assignment');
const NotificationLog = require('../models/NotificationLog');
const { sendEmail } = require('./notificationService');
const { renderNotification } = require('./messageTemplates');
const { sendSms, sendWhatsapp } = require('./twilioService');

function dedupeOrganizationsByName(orgs) {
  const byName = new Map();
  for (const org of orgs || []) {
    const key = String(org.name || '').trim().toLowerCase();
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, org);
  }
  return Array.from(byName.values());
}

function normalizeText(v) {
  return String(v || '').trim().toLowerCase();
}

function orgMatchesArea(org, complaint) {
  const complaintCity = normalizeText(complaint.city);
  const complaintPincode = normalizeText(complaint.pincode);

  if (!complaintCity && !complaintPincode) return false;

  const orgCities = (org.coverage?.cities || []).map(normalizeText).filter(Boolean);
  const orgPincodes = (org.coverage?.pincodes || []).map(normalizeText).filter(Boolean);

  const cityMatch = complaintCity && orgCities.includes(complaintCity);
  const pincodeMatch = complaintPincode && orgPincodes.includes(complaintPincode);

  return Boolean(cityMatch || pincodeMatch);
}

function orgHasNoCoverage(org) {
  const cities = org.coverage?.cities || [];
  const pincodes = org.coverage?.pincodes || [];
  return (cities.length === 0) && (pincodes.length === 0);
}

function buildComplaintEmailText(complaint) {
  const title = complaint.title || '';
  const category = complaint.category || 'other';
  const description = complaint.description || '';
  const addr = complaint.location?.address || 'Unknown location';
  const coords = Array.isArray(complaint.location?.coordinates) ? complaint.location.coordinates : [];
  const lng = coords[0];
  const lat = coords[1];
  const images = Array.isArray(complaint.images) ? complaint.images : [];

  const lines = [
    'New civic issue reported in CivicSense.',
    '',
    `Title: ${title}`,
    `Category: ${category}`,
    `Location: ${addr}`,
    `Coordinates: ${typeof lat === 'number' && typeof lng === 'number' ? `${lat}, ${lng}` : 'N/A'}`,
    '',
    'Description:',
    description,
    '',
    images.length > 0 ? 'Images:' : null,
    ...images.map((p) => p),
    '',
    'Please review and take action. If this is not your department/NGO, please ignore.'
  ].filter(Boolean);

  return lines.join('\n');
}

async function createAssignmentsForComplaint(complaint) {
  const orgs = await Organization.find({
    isActive: true,
    categories: complaint.category
  }).select('_id contacts name coverage');

  const uniqueOrgs = dedupeOrganizationsByName(orgs);

  if (!uniqueOrgs || uniqueOrgs.length === 0) return [];

  const areaMatched = uniqueOrgs.filter((o) => orgMatchesArea(o, complaint));
  const noCoverage = uniqueOrgs.filter((o) => orgHasNoCoverage(o));
  const selectedOrgs = areaMatched.length > 0 ? areaMatched : noCoverage.length > 0 ? noCoverage : uniqueOrgs;

  const existing = await Assignment.find({
    complaint: complaint._id,
    organization: { $in: selectedOrgs.map((o) => o._id) }
  }).select('organization');

  const existingSet = new Set(existing.map((a) => String(a.organization)));

  const toCreate = selectedOrgs
    .filter((o) => !existingSet.has(String(o._id)))
    .map((o) => ({
      complaint: complaint._id,
      organization: o._id,
      channel: 'email',
      status: 'queued'
    }));

  if (toCreate.length === 0) return [];
  return Assignment.insertMany(toCreate);
}

async function sendNotificationsForComplaint(complaint) {
  const orgs = await Organization.find({
    isActive: true,
    categories: complaint.category
  }).select('_id contacts name coverage');

  const uniqueOrgs = dedupeOrganizationsByName(orgs);

  if (!uniqueOrgs || uniqueOrgs.length === 0) return;

  const areaMatched = uniqueOrgs.filter((o) => orgMatchesArea(o, complaint));
  const noCoverage = uniqueOrgs.filter((o) => orgHasNoCoverage(o));
  const selectedOrgs = areaMatched.length > 0 ? areaMatched : noCoverage.length > 0 ? noCoverage : uniqueOrgs;

  for (const org of selectedOrgs) {
    const emailTo = (org.contacts?.emails || []).filter(Boolean)[0];
    const smsTo = (org.contacts?.phones || []).filter(Boolean)[0];
    const whatsappTo = (org.contacts?.whatsappNumbers || []).filter(Boolean)[0];

    const channels = [];
    if (emailTo) channels.push({ channel: 'email', to: emailTo });
    if (smsTo) channels.push({ channel: 'sms', to: smsTo });
    if (whatsappTo) channels.push({ channel: 'whatsapp', to: whatsappTo });

    for (const ch of channels) {
      const assignment = await Assignment.findOneAndUpdate(
        { complaint: complaint._id, organization: org._id, channel: ch.channel },
        { $setOnInsert: { channel: ch.channel, status: 'queued', language: 'en', tone: 'formal' } },
        { upsert: true, new: true }
      );

      const { subject, body, templateId } = renderNotification({
        complaint,
        channel: ch.channel,
        language: assignment.language || 'en',
        tone: assignment.tone || 'formal'
      });

      const logBase = {
        assignment: assignment._id,
        channel: ch.channel,
        provider: 'none',
        to: ch.to,
        subject,
        body,
        template: {
          id: templateId,
          language: assignment.language || 'en',
          tone: assignment.tone || 'formal'
        }
      };

      try {
        await Assignment.updateOne(
          { _id: assignment._id },
          { $inc: { attempts: 1 } }
        );

        let result;
        if (ch.channel === 'email') {
          result = await sendEmail({ to: ch.to, subject, text: body });
        } else if (ch.channel === 'sms') {
          result = await sendSms({ to: ch.to, body });
        } else {
          result = await sendWhatsapp({ to: ch.to, body });
        }

        if (result.skipped) {
          await Assignment.updateOne(
            { _id: assignment._id },
            { $set: { status: 'skipped', lastError: result.reason || '' } }
          );

          await NotificationLog.create({
            ...logBase,
            success: false,
            error: result.reason || 'skipped'
          });

          continue;
        }

        await Assignment.updateOne(
          { _id: assignment._id },
          { $set: { status: 'sent', sentAt: new Date(), lastError: '' } }
        );

        await NotificationLog.create({
          ...logBase,
          provider: ch.channel === 'email' ? 'smtp' : 'twilio',
          success: true,
          providerMessageId: result.messageId || ''
        });
      } catch (err) {
        await Assignment.updateOne(
          { _id: assignment._id },
          { $set: { status: 'failed', lastError: err.message || String(err) } }
        );

        await NotificationLog.create({
          ...logBase,
          provider: ch.channel === 'email' ? 'smtp' : 'twilio',
          success: false,
          error: err.message || String(err)
        });
      }
    }
  }
}

module.exports = {
  createAssignmentsForComplaint,
  sendNotificationsForComplaint
};
