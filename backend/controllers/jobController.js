const JobDrive = require('../models/JobDrive');
const Company = require('../models/Company');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper to check student eligibility against job drive rules
const checkEligibility = (student, jobDrive) => {
  const reasons = [];
  let isEligible = true;

  if (!student) {
    return { isEligible: false, reasons: ['Student profile incomplete or missing'] };
  }

  // 1. CGPA check
  if (jobDrive.minimumCGPA && student.cgpa < jobDrive.minimumCGPA) {
    isEligible = false;
    reasons.push(`CGPA (${student.cgpa}) is lower than required minimum (${jobDrive.minimumCGPA})`);
  }

  // 2. Department check
  if (jobDrive.eligibleDepartments && jobDrive.eligibleDepartments.length > 0) {
    const isDeptEligible = jobDrive.eligibleDepartments.some(
      d => d.toLowerCase().trim() === student.department.toLowerCase().trim()
    );
    if (!isDeptEligible) {
      isEligible = false;
      reasons.push(`Department '${student.department}' is not in eligible list (${jobDrive.eligibleDepartments.join(', ')})`);
    }
  }

  // 3. Graduation year check
  if (jobDrive.eligibleGraduationYears && jobDrive.eligibleGraduationYears.length > 0) {
    if (!jobDrive.eligibleGraduationYears.includes(Number(student.graduationYear))) {
      isEligible = false;
      reasons.push(`Graduation year '${student.graduationYear}' is not eligible (${jobDrive.eligibleGraduationYears.join(', ')})`);
    }
  }

  // 4. Skills match check
  const studentSkills = (student.skills || []).map(s => s.toLowerCase().trim());
  const requiredSkills = (jobDrive.requiredSkills || []).map(s => s.toLowerCase().trim());
  const matchedSkills = requiredSkills.filter(s => studentSkills.includes(s));
  const missingSkills = requiredSkills.filter(s => !studentSkills.includes(s));

  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  return {
    isEligible,
    reasons: isEligible ? ['All eligibility criteria satisfied'] : reasons,
    matchedSkills,
    missingSkills,
    matchPercentage
  };
};

// @desc    Get all job drives with optional search & eligibility computation
// @route   GET /api/jobs
// @access  Public / Private
exports.getJobDrives = async (req, res, next) => {
  try {
    const { search, department, minSalary, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { jobTitle: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const jobDrives = await JobDrive.find(query).populate('companyId').sort({ createdAt: -1 });

    let studentProfile = null;
    if (req.user && req.user.role === 'student') {
      studentProfile = await Student.findOne({ userId: req.user._id });
    }

    const enrichedDrives = jobDrives.map(drive => {
      const driveObj = drive.toObject();
      if (studentProfile) {
        driveObj.eligibility = checkEligibility(studentProfile, drive);
      }
      return driveObj;
    });

    return sendSuccess(res, 'Job drives retrieved', enrichedDrives);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job drive with detailed eligibility breakdown
// @route   GET /api/jobs/:id
// @access  Public / Private
exports.getJobDriveById = async (req, res, next) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id).populate('companyId');
    if (!jobDrive) {
      return sendError(res, 'Job drive not found', 404);
    }

    const driveObj = jobDrive.toObject();
    if (req.user && req.user.role === 'student') {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      driveObj.eligibility = checkEligibility(studentProfile, jobDrive);
    }

    return sendSuccess(res, 'Job drive details retrieved', driveObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Create job drive
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
exports.createJobDrive = async (req, res, next) => {
  try {
    const {
      companyId,
      jobTitle,
      description,
      salary,
      location,
      requiredSkills,
      minimumCGPA,
      eligibleDepartments,
      eligibleGraduationYears,
      applicationDeadline,
      driveDate
    } = req.body;

    let targetCompanyId = companyId;
    if (req.user.role === 'recruiter') {
      let company = await Company.findOne({ recruiterId: req.user._id });
      if (!company) {
        company = await Company.create({
          name: `${req.user.name}'s Enterprise`,
          description: 'Hiring partner',
          recruiterId: req.user._id
        });
      }
      targetCompanyId = company._id;
    }

    const jobDrive = await JobDrive.create({
      companyId: targetCompanyId,
      jobTitle,
      description,
      salary,
      location,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',') : []),
      minimumCGPA: minimumCGPA || 0,
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : (eligibleDepartments ? eligibleDepartments.split(',') : []),
      eligibleGraduationYears: Array.isArray(eligibleGraduationYears) ? eligibleGraduationYears : (eligibleGraduationYears ? eligibleGraduationYears.split(',').map(Number) : []),
      applicationDeadline: applicationDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      driveDate: driveDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Active'
    });

    // Notify all students of new job drive
    const students = await User.find({ role: 'student' });
    const notifications = students.map(st => ({
      userId: st._id,
      title: 'New Placement Job Drive!',
      message: `A new drive "${jobTitle}" has been posted by ${req.user.name}. Check your eligibility and apply now!`,
      type: 'drive'
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return sendSuccess(res, 'Job drive created successfully', jobDrive, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update job drive
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.updateJobDrive = async (req, res, next) => {
  try {
    const jobDrive = await JobDrive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!jobDrive) {
      return sendError(res, 'Job drive not found', 404);
    }
    return sendSuccess(res, 'Job drive updated successfully', jobDrive);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job drive
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.deleteJobDrive = async (req, res, next) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return sendError(res, 'Job drive not found', 404);
    }
    await jobDrive.deleteOne();
    return sendSuccess(res, 'Job drive deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports.checkEligibility = checkEligibility;
