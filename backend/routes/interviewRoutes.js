const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  updateInterview,
  submitFeedback
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('recruiter', 'admin'), scheduleInterview);
router.get('/', getInterviews);
router.put('/:id', authorize('recruiter', 'admin'), updateInterview);
router.post('/feedback', authorize('recruiter', 'admin'), submitFeedback);

module.exports = router;
