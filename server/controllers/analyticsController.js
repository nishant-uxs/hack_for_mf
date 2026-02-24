const Complaint = require('../models/Complaint');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
  try {
    const { area } = req.query;
    const areaFilter = area
      ? { 'location.address': { $regex: area, $options: 'i' } }
      : {};

    const totalComplaints = await Complaint.countDocuments(areaFilter);
    const totalUsers = await User.countDocuments();

    const pipeline = area ? [{ $match: areaFilter }] : [];

    const statusCounts = await Complaint.aggregate([
      ...pipeline,
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryCounts = await Complaint.aggregate([
      ...pipeline,
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const topComplaints = await Complaint.find(areaFilter)
      .sort({ impactScore: -1 })
      .limit(10)
      .populate('reporter', 'name email');

    const recentComplaints = await Complaint.find(areaFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('reporter', 'name email');

    const hotspotAreas = await Complaint.aggregate([
      ...pipeline,
      {
        $group: {
          _id: '$location.address',
          count: { $sum: 1 },
          coordinates: { $first: '$location.coordinates' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const monthlyTrends = await Complaint.aggregate([
      ...pipeline,
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const resolvedCount = await Complaint.countDocuments({ ...areaFilter, status: 'Resolved' });
    const pendingCount = totalComplaints - resolvedCount;

    const avgResolutionTime = await Complaint.aggregate([
      {
        $match: { ...areaFilter, status: 'Resolved', resolvedAt: { $exists: true } }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      area: area || null,
      analytics: {
        overview: {
          totalComplaints,
          totalUsers,
          resolvedCount,
          pendingCount,
          resolutionRate: totalComplaints > 0 
            ? ((resolvedCount / totalComplaints) * 100).toFixed(2) 
            : 0,
          avgResolutionDays: avgResolutionTime.length > 0 
            ? avgResolutionTime[0].avgDays.toFixed(1) 
            : 0
        },
        statusDistribution: statusCounts,
        categoryDistribution: categoryCounts,
        topComplaints,
        recentComplaints,
        hotspotAreas,
        monthlyTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};
