const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  listMyAssignments,
  acknowledgeAssignment,
  acceptAssignment,
  setInProgress,
  setResolved
} = require('../controllers/orgPortalController');

router.use(protect);
router.use(authorize('org_user'));

router.get('/assignments', listMyAssignments);
router.patch('/assignments/:id/acknowledge', acknowledgeAssignment);
router.patch('/assignments/:id/accept', acceptAssignment);
router.patch('/assignments/:id/in-progress', setInProgress);
router.patch('/assignments/:id/resolve', setResolved);

module.exports = router;
