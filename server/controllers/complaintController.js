const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { createAssignmentsForComplaint, sendNotificationsForComplaint } = require('../utils/assignmentService');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, address, city, pincode } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const locationData = typeof location === 'string' ? JSON.parse(location) : location;

    if (!locationData || !Array.isArray(locationData.coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format'
      });
    }

    locationData.address = locationData.address || address || 'Unknown location';

    const imagePaths = req.files ? req.files.map(file => `/uploads/complaints/${file.filename}`) : [];

    const complaintData = {
      title,
      description,
      category,
      location: locationData,
      city: city || undefined,
      pincode: pincode || undefined
    };

    const complaint = new Complaint({
      ...complaintData,
      images: imagePaths,
      reporter: req.user.id,
      statusHistory: [{
        status: 'Reported',
        timestamp: new Date(),
        updatedBy: req.user.id
      }]
    });

    await complaint.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { complaintsReported: complaint._id }
    });

    await complaint.populate('reporter', 'name email');

    setImmediate(() => {
      createAssignmentsForComplaint(complaint)
        .then(() => sendNotificationsForComplaint(complaint))
        .catch(() => {});
    });

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      city,
      pincode,
      search,
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (city) query.city = city;
    if (pincode) query.pincode = pincode;
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
        { city: searchRegex },
        { pincode: searchRegex },
        { category: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const complaints = await Complaint.find(query)
      .populate('reporter', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    complaints.forEach(complaint => complaint.calculateImpactScore());

    const count = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      complaints,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('statusHistory.updatedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.calculateImpactScore();

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

exports.voteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const hasVoted = complaint.voters.includes(req.user.id);

    if (hasVoted) {
      complaint.voters = complaint.voters.filter(
        voter => voter.toString() !== req.user.id.toString()
      );
      complaint.votes -= 1;
    } else {
      complaint.voters.push(req.user.id);
      complaint.votes += 1;
    }

    complaint.calculateImpactScore();
    await complaint.save();

    await User.findByIdAndUpdate(req.user.id, {
      [hasVoted ? '$pull' : '$addToSet']: { votedComplaints: complaint._id }
    });

    res.status(200).json({
      success: true,
      message: hasVoted ? 'Vote removed' : 'Vote added',
      votes: complaint.votes,
      impactScore: complaint.impactScore
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error voting on complaint',
      error: error.message
    });
  }
};

exports.getComplaintsByLocation = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    const complaints = await Complaint.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('reporter', 'name email');

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby complaints',
      error: error.message
    });
  }
};
