const express = require('express');
const router = express.Router();
const {
  getJobDrives,
  getJobDriveById,
  createJobDrive,
  updateJobDrive,
  deleteJobDrive
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Optional auth to attach student profile for eligibility calculation
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getJobDrives);
router.get('/:id', optionalProtect, getJobDriveById);

router.post('/', protect, authorize('recruiter', 'admin'), createJobDrive);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJobDrive);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJobDrive);

module.exports = router;
