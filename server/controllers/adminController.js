const Complaint = require('../models/Complaint');

exports.verifyComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = 'Verified';
    complaint.verifiedBy = req.user.id;
    complaint.verifiedAt = new Date();
    complaint.statusHistory.push({
      status: 'Verified',
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint verified successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying complaint',
      error: error.message
    });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Reported', 'Verified', 'InProgress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const resolutionImagePaths = req.files 
      ? req.files.map(file => `/uploads/complaints/${file.filename}`) 
      : [];

    const resolutionData = {
      complaintId: complaint._id.toString(),
      resolutionImages: resolutionImagePaths,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    };

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    complaint.resolutionImages = resolutionImagePaths;
    complaint.statusHistory.push({
      status: 'Resolved',
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint resolved successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving complaint',
      error: error.message
    });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted (marked for anomaly detection)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};
