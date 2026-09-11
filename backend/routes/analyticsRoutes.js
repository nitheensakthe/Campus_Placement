const express = require('express');
const router = express.Router();
const { getPlacementAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', authorize('admin', 'recruiter'), getPlacementAnalytics);

module.exports = router;
