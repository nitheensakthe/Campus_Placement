const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    completenessScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    comments: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
