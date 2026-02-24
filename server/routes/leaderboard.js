const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// GET /api/leaderboard — top reporters with stats and badges
router.get('/', async (req, res) => {
  try {
    // Top reporters by complaint count
    const topReporters = await Complaint.aggregate([
      { $group: {
        _id: '$reporter',
        totalComplaints: { $sum: 1 },
        totalVotes: { $sum: '$votes' },
        resolvedCount: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        categories: { $addToSet: '$category' }
      }},
      { $sort: { totalComplaints: -1 } },
      { $limit: 20 },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: '$user' },
      { $project: {
        _id: 1,
        name: '$user.name',
        totalComplaints: 1,
        totalVotes: 1,
        resolvedCount: 1,
        categoriesCount: { $size: '$categories' },
        score: { $add: [
          { $multiply: ['$totalComplaints', 10] },
          { $multiply: ['$totalVotes', 2] },
          { $multiply: ['$resolvedCount', 5] }
        ]}
      }}
    ]);

    // Assign badges
    const leaderboard = topReporters.map((u, idx) => {
      const badges = [];
      if (u.totalComplaints >= 50) badges.push({ name: 'Civic Champion', icon: '🏆', color: 'bg-yellow-100 text-yellow-800' });
      else if (u.totalComplaints >= 20) badges.push({ name: 'Active Reporter', icon: '⭐', color: 'bg-blue-100 text-blue-800' });
      else if (u.totalComplaints >= 5) badges.push({ name: 'Rising Citizen', icon: '🌟', color: 'bg-green-100 text-green-800' });

      if (u.totalVotes >= 100) badges.push({ name: 'Community Voice', icon: '📢', color: 'bg-purple-100 text-purple-800' });
      if (u.resolvedCount >= 10) badges.push({ name: 'Problem Solver', icon: '✅', color: 'bg-emerald-100 text-emerald-800' });
      if (u.categoriesCount >= 5) badges.push({ name: 'Diverse Reporter', icon: '🎯', color: 'bg-orange-100 text-orange-800' });
      if (idx === 0) badges.push({ name: '#1 Reporter', icon: '👑', color: 'bg-amber-100 text-amber-800' });

      return { ...u, badges, rank: idx + 1 };
    });

    // Overall stats
    const totalComplaints = await Complaint.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalResolved = await Complaint.countDocuments({ status: 'Resolved' });

    res.json({
      success: true,
      leaderboard,
      stats: { totalComplaints, totalUsers, totalResolved }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
