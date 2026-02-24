const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

// GET /api/comments/:complaintId — get all comments for a complaint
router.get('/:complaintId', async (req, res) => {
  try {
    const comments = await Comment.find({ complaint: req.params.complaintId })
      .populate('user', 'name role')
      .sort({ createdAt: 1 });
    res.json({ success: true, comments, count: comments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comments/:complaintId — add a comment (auth required)
router.post('/:complaintId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    const comment = await Comment.create({
      complaint: req.params.complaintId,
      user: req.user.id,
      text: text.trim()
    });
    const populated = await Comment.findById(comment._id).populate('user', 'name role');
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
