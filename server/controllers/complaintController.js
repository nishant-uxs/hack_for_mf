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
    const locationString = JSON.stringify(locationData);

    const imagePaths = req.files ? req.files.map(file => `/uploads/complaints/${file.filename}`) : [];

    const complaintData = {
      title,
      description,
      category,
      city,
      pincode,
      location: locationString,
      address: address || 'Unknown location',
      images: imagePaths,
      status: 'pending',
      reporter: req.user.id
    };

    const db = req.app.get('db');
    
    Complaint.create(db, complaintData, function(err) {
      if (err) {
        console.error('❌ Complaint creation error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating complaint'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Complaint created successfully',
        complaint: {
          id: this.lastID,
          title,
          description,
          category,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      });
    });
  } catch (error) {
    console.error('❌ Complaint creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Complaint creation failed'
    });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const db = req.app.get('db');
    
    Complaint.findAll(db, (err, complaints) => {
      if (err) {
        console.error('❌ Error fetching complaints:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching complaints'
        });
      }

      // Parse JSON fields and calculate impact scores
      const processedComplaints = complaints.map(complaint => {
        try {
          const images = JSON.parse(complaint.images || '[]');
          const location = JSON.parse(complaint.location || '{}');
          const impactScore = Complaint.calculateImpactScore(complaint);
          
          return {
            ...complaint,
            images,
            location,
            impactScore
          };
        } catch (parseErr) {
          console.error('Error parsing complaint data:', parseErr);
          return complaint;
        }
      });

      res.status(200).json({
        success: true,
        count: processedComplaints.length,
        complaints: processedComplaints
      });
    });
  } catch (error) {
    console.error('❌ Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch complaints'
    });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.get('db');
    
    Complaint.findById(db, id, (err, complaint) => {
      if (err || !complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      // Parse JSON fields
      try {
        complaint.images = JSON.parse(complaint.images || '[]');
        complaint.location = JSON.parse(complaint.location || '{}');
      } catch (parseErr) {
        console.error('Error parsing complaint data:', parseErr);
      }

      res.status(200).json({
        success: true,
        complaint
      });
    });
  } catch (error) {
    console.error('❌ Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch complaint'
    });
  }
};

module.exports = {
  createComplaint: exports.createComplaint,
  getComplaints: exports.getComplaints,
  getComplaint: exports.getComplaint
};
