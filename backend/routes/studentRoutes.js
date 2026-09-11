const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  getAllStudents
} = require('../controllers/studentController');

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

router.get('/profile', getProfile);
router.get('/profile/:id', authorize('admin', 'recruiter'), getProfile);
router.put('/profile', authorize('student'), updateProfile);

router.post('/resume', authorize('student'), upload.single('resume'), uploadResume);
router.delete('/resume', authorize('student'), deleteResume);

router.get('/', authorize('admin', 'recruiter'), getAllStudents);

module.exports = router;
