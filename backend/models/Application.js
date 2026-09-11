const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    jobDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDrive',
      required: true
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, jobDriveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
