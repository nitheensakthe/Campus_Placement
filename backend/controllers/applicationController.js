const Application = require('../models/Application');
const JobDrive = require('../models/JobDrive');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { checkEligibility } = require('./jobController');

// @desc    Apply for a Job Drive
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobDriveId } = req.body;

    if (!jobDriveId) {
      return sendError(res, 'jobDriveId is required', 400);
    }

    // 1. Authenticate & fetch student
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return sendError(res, 'Student profile not found. Complete your profile before applying.', 400);
    }

    // 2. Verify job exists
    const jobDrive = await JobDrive.findById(jobDriveId).populate('companyId');
    if (!jobDrive) {
      return sendError(res, 'Job drive does not exist', 404);
    }

    // 3. Verify application deadline
    if (new Date() > new Date(jobDrive.applicationDeadline)) {
      return sendError(res, 'Application deadline for this drive has passed', 400);
    }

    if (jobDrive.status !== 'Active') {
      return sendError(res, `This job drive is currently ${jobDrive.status.toLowerCase()}`, 400);
    }

    // 4. Verify eligibility
    const eligibility = checkEligibility(student, jobDrive);
    if (!eligibility.isEligible) {
      return sendError(res, `You are not eligible for this job: ${eligibility.reasons.join(', ')}`, 400);
    }

    // 5. Check duplicate application
    const existingApp = await Application.findOne({
      studentId: student._id,
      jobDriveId
    });
    if (existingApp) {
      return sendError(res, 'You have already applied for this job drive', 409);
    }

    // 6 & 7. Create application & set status to Applied
    const application = await Application.create({
      studentId: student._id,
      jobDriveId,
      status: 'Applied',
      appliedAt: new Date()
    });

    // 8. Create notification
    await Notification.create({
      userId: req.user._id,
      title: 'Application Submitted!',
      message: `Your application for ${jobDrive.jobTitle} at ${jobDrive.companyId.name} was successfully submitted.`,
      type: 'application'
    });

    return sendSuccess(res, 'Application submitted successfully', application, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications (filtered by student or recruiter or admin)
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    const { jobDriveId, status } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) return sendSuccess(res, 'No applications found', []);
      query.studentId = student._id;
    } else if (jobDriveId) {
      query.jobDriveId = jobDriveId;
    }

    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'jobDriveId',
        populate: { path: 'companyId' }
      })
      .sort({ appliedAt: -1 });

    return sendSuccess(res, 'Applications retrieved', applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get application details by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'jobDriveId',
        populate: { path: 'companyId' }
      });

    if (!application) {
      return sendError(res, 'Application not found', 404);
    }
    return sendSuccess(res, 'Application details retrieved', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Recruiter/Admin)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const application = await Application.findById(req.params.id)
      .populate({ path: 'studentId', populate: { path: 'userId' } })
      .populate({ path: 'jobDriveId', populate: { path: 'companyId' } });

    if (!application) {
      return sendError(res, 'Application not found', 404);
    }

    application.status = status;
    await application.save();

    // If status is Selected, update student placementStatus
    if (status === 'Selected') {
      const student = await Student.findById(application.studentId._id);
      if (student) {
        student.placementStatus = 'Placed';
        await student.save();
      }
    }

    // Send notification to student
    if (application.studentId && application.studentId.userId) {
      await Notification.create({
        userId: application.studentId.userId._id,
        title: `Application Status Updated: ${status}`,
        message: `Your application for ${application.jobDriveId.jobTitle} is now marked as "${status}".`,
        type: 'status_update'
      });
    }

    return sendSuccess(res, `Application status updated to ${status}`, application);
  } catch (error) {
    next(error);
  }
};
