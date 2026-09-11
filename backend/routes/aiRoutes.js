const express = require('express');
const router = express.Router();
const {
  analyzeResume,
  matchResumeToJob,
  getJobRecommendations,
  generateInterviewQuestions,
  evaluateInterviewAnswer
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/resume-analyzer', analyzeResume);
router.post('/job-matching', matchResumeToJob);
router.get('/recommended-jobs', getJobRecommendations);
router.post('/interview/questions', generateInterviewQuestions);
router.post('/interview/evaluate', evaluateInterviewAnswer);

module.exports = router;
