const Assignment = require('../models/Assignment');
const NotificationLog = require('../models/NotificationLog');

exports.listAssignments = async (req, res) => {
  try {
    const { complaintId, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (complaintId) query.complaint = complaintId;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('complaint', 'title category status createdAt')
      .populate('organization', 'name type categories contacts isActive')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const count = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      assignments,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

exports.listNotificationLogs = async (req, res) => {
  try {
    const { assignmentId, success, page = 1, limit = 50 } = req.query;
    const query = {};
    if (assignmentId) query.assignment = assignmentId;
    if (success === 'true') query.success = true;
    if (success === 'false') query.success = false;

    const logs = await NotificationLog.find(query)
      .populate({
        path: 'assignment',
        populate: [{ path: 'complaint', select: 'title category status' }, { path: 'organization', select: 'name type' }]
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const count = await NotificationLog.countDocuments(query);

    res.status(200).json({
      success: true,
      logs,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification logs',
      error: error.message
    });
  }
};
