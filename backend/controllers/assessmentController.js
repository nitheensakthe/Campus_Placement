const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Create Assessment (Recruiter/Admin)
// @route   POST /api/assessments
// @access  Private (Recruiter/Admin)
exports.createAssessment = async (req, res, next) => {
  try {
    const { jobDriveId, title, description, duration, questions } = req.body;

    const assessment = await Assessment.create({
      jobDriveId,
      title,
      description,
      duration: duration || 30
    });

    let createdQuestions = [];
    if (questions && questions.length > 0) {
      const qDocs = questions.map(q => ({
        assessmentId: assessment._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
        type: 'MCQ'
      }));
      createdQuestions = await Question.insertMany(qDocs);
    }

    return sendSuccess(res, 'Assessment created successfully', {
      assessment,
      questionsCount: createdQuestions.length
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res, next) => {
  try {
    const { jobDriveId } = req.query;
    let query = {};
    if (jobDriveId) query.jobDriveId = jobDriveId;

    const assessments = await Assessment.find(query).populate('jobDriveId');
    return sendSuccess(res, 'Assessments retrieved', assessments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Assessment by ID (Hides correct answers for students)
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('jobDriveId');
    if (!assessment) {
      return sendError(res, 'Assessment not found', 404);
    }

    let questions;
    if (req.user.role === 'student') {
      // Do NOT expose correctAnswer to frontend before submission!
      questions = await Question.find({ assessmentId: assessment._id }).select('-correctAnswer');

      // Verify student has an active application for this job drive
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        const app = await Application.findOne({ studentId: student._id, jobDriveId: assessment.jobDriveId._id });
        if (!app) {
          return sendError(res, 'You must apply for this job drive before taking the assessment', 403);
        }
      }
    } else {
      questions = await Question.find({ assessmentId: assessment._id });
    }

    // Check if student has already submitted this test
    let previousResult = null;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        previousResult = await TestResult.findOne({ assessmentId: assessment._id, studentId: student._id });
      }
    }

    return sendSuccess(res, 'Assessment details retrieved', {
      assessment,
      questions,
      previousResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Test Answers & Auto-Grade
// @route   POST /api/assessments/:id/submit
// @access  Private (Student)
exports.submitAssessment = async (req, res, next) => {
  try {
    const assessmentId = req.params.id;
    const { answers, timeTaken } = req.body; // answers: { questionId: selectedOptionString }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return sendError(res, 'Student profile not found', 404);
    }

    const existingResult = await TestResult.findOne({ assessmentId, studentId: student._id });
    if (existingResult) {
      return sendError(res, 'You have already submitted this test', 409);
    }

    const questions = await Question.find({ assessmentId });
    if (!questions || questions.length === 0) {
      return sendError(res, 'No questions found for this assessment', 400);
    }

    let totalMarks = 0;
    let scoredMarks = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    questions.forEach(q => {
      totalMarks += q.marks;
      const studentAnswer = answers ? answers[q._id.toString()] : null;
      if (studentAnswer && studentAnswer.trim() === q.correctAnswer.trim()) {
        scoredMarks += q.marks;
        correctAnswers += 1;
      } else {
        wrongAnswers += 1;
      }
    });

    const percentage = Math.round((scoredMarks / (totalMarks || 1)) * 100);

    const testResult = await TestResult.create({
      assessmentId,
      studentId: student._id,
      score: scoredMarks,
      percentage,
      correctAnswers,
      wrongAnswers,
      timeTaken: timeTaken || 0,
      submittedAt: new Date()
    });

    return sendSuccess(res, 'Assessment graded successfully', testResult, 201);
  } catch (error) {
    next(error);
  }
};
