const mongoose = require('mongoose');

const jobDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    salary: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    minimumCGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    eligibleDepartments: {
      type: [String],
      default: []
    },
    eligibleGraduationYears: {
      type: [Number],
      default: []
    },
    applicationDeadline: {
      type: Date,
      required: true
    },
    driveDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Completed'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

jobDriveSchema.index({ status: 1, applicationDeadline: 1 });

module.exports = mongoose.model('JobDrive', jobDriveSchema);
