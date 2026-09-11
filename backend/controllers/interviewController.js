const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Schedule an Interview
// @route   POST /api/interviews
// @access  Private (Recruiter/Admin)
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, studentId, companyId, round, date, time, mode, meetingLink } = req.body;

    const application = await Application.findById(applicationId).populate('studentId');
    if (!application) {
      return sendError(res, 'Application not found', 404);
    }

    const interview = await Interview.create({
      applicationId,
      studentId: studentId || application.studentId._id,
      recruiterId: req.user._id,
      companyId,
      round: round || 'Technical Round 1',
      date,
      time,
      mode: mode || 'Online',
      meetingLink: meetingLink || 'https://meet.google.com/xyz-abc-123',
      status: 'Scheduled'
    });

    // Update application status to Interview
    application.status = 'Interview';
    await application.save();

    // Create Notification for Student
    const student = await Student.findById(interview.studentId).populate('userId');
    if (student && student.userId) {
      await Notification.create({
        userId: student.userId._id,
        title: 'Interview Scheduled!',
        message: `Your interview (${round}) has been scheduled for ${date} at ${time}. Link: ${meetingLink}`,
        type: 'interview'
      });
    }

    return sendSuccess(res, 'Interview scheduled successfully', interview, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) return sendSuccess(res, 'No interviews scheduled', []);
      query.studentId = student._id;
    } else if (req.user.role === 'recruiter') {
      query.recruiterId = req.user._id;
    }

    const interviews = await Interview.find(query)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('companyId')
      .populate('applicationId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Interviews retrieved', interviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Interview Status / Meeting details
// @route   PUT /api/interviews/:id
// @access  Private (Recruiter/Admin)
exports.updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!interview) {
      return sendError(res, 'Interview not found', 404);
    }
    return sendSuccess(res, 'Interview updated', interview);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Recruiter Candidate Feedback
// @route   POST /api/interviews/feedback
// @access  Private (Recruiter/Admin)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { studentId, applicationId, technicalScore, communicationScore, completenessScore, comments } = req.body;

    const overallScore = Math.round((Number(technicalScore) + Number(communicationScore) + Number(completenessScore)) / 3);

    const feedback = await Feedback.create({
      studentId,
      applicationId,
      interviewerId: req.user._id,
      technicalScore,
      communicationScore,
      completenessScore,
      overallScore,
      comments
    });

    return sendSuccess(res, 'Feedback submitted successfully', feedback, 201);
  } catch (error) {
    next(error);
  }
};
