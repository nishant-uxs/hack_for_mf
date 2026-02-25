const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('images', 5), createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaint);

module.exports = router;
