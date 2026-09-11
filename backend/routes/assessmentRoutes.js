const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  submitAssessment
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('recruiter', 'admin'), createAssessment);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/:id/submit', authorize('student'), submitAssessment);

module.exports = router;
