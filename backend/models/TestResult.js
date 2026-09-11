const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    wrongAnswers: {
      type: Number,
      required: true
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

testResultSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('TestResult', testResultSchema);
