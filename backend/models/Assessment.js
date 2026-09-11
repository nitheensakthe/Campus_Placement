const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    jobDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDrive',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 30
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
