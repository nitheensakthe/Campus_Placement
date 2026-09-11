const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student/Admin/Recruiter)
exports.getProfile = async (req, res, next) => {
  try {
    let student;
    if (req.user.role === 'student') {
      student = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email role');
    } else {
      const studentId = req.params.id;
      student = await Student.findById(studentId).populate('userId', 'name email role');
    }

    if (!student) {
      return sendError(res, 'Student profile not found', 404);
    }

    return sendSuccess(res, 'Student profile retrieved', student);
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
exports.updateProfile = async (req, res, next) => {
  try {
    const { department, cgpa, graduationYear, phone, skills, certifications, projects, experience, registerNumber } = req.body;

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = new Student({ userId: req.user._id });
    }

    if (department !== undefined) student.department = department;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (graduationYear !== undefined) student.graduationYear = graduationYear;
    if (phone !== undefined) student.phone = phone;
    if (registerNumber !== undefined) student.registerNumber = registerNumber;
    if (skills !== undefined) student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (certifications !== undefined) student.certifications = certifications;
    if (projects !== undefined) student.projects = projects;
    if (experience !== undefined) student.experience = experience;

    await student.save();
    return sendSuccess(res, 'Profile updated successfully', student);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / Replace resume PDF
// @route   POST /api/students/resume
// @access  Private (Student)
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please upload a PDF file', 400);
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    let extractedText = '';
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || '';
    } catch (pdfErr) {
      console.warn('PDF parsing warning:', pdfErr.message);
    }

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return sendError(res, 'Student profile not found', 404);
    }

    student.resumeUrl = resumeUrl;

    // Quick auto-extract skills from parsed text if student skills empty
    if (extractedText && (!student.skills || student.skills.length === 0)) {
      const commonSkills = ['JavaScript', 'TypeScript', 'Node.js', 'Express', 'React', 'Angular', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'Git', 'HTML', 'CSS', 'Docker', 'AWS'];
      const foundSkills = commonSkills.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(extractedText));
      if (foundSkills.length > 0) {
        student.skills = foundSkills;
      }
    }

    await student.save();

    return sendSuccess(res, 'Resume uploaded successfully', {
      resumeUrl,
      extractedTextLength: extractedText.length,
      skillsDetected: student.skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/students/resume
// @access  Private (Student)
exports.deleteResume = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.resumeUrl) {
      return sendError(res, 'No resume found to delete', 404);
    }

    const filename = path.basename(student.resumeUrl);
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    student.resumeUrl = '';
    await student.save();

    return sendSuccess(res, 'Resume deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (Admin/Recruiter)
// @route   GET /api/students
// @access  Private (Admin/Recruiter)
exports.getAllStudents = async (req, res, next) => {
  try {
    const { department, minCGPA, skill } = req.query;
    let query = {};

    if (department) query.department = department;
    if (minCGPA) query.cgpa = { $gte: Number(minCGPA) };
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };

    const students = await Student.find(query).populate('userId', 'name email role');
    return sendSuccess(res, 'Students retrieved successfully', students);
  } catch (error) {
    next(error);
  }
};
