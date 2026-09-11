const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('student'), applyForJob);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
