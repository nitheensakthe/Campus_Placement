const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: [val => val.length >= 2, 'At least 2 options are required']
    },
    correctAnswer: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      default: 1
    },
    type: {
      type: String,
      default: 'MCQ'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
