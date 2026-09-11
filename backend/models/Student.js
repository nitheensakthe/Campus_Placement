const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    registerNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    graduationYear: {
      type: Number,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    certifications: [
      {
        title: String,
        issuer: String,
        year: Number
      }
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String
      }
    ],
    experience: [
      {
        role: String,
        company: String,
        duration: String,
        description: String
      }
    ],
    resumeUrl: {
      type: String,
      default: ''
    },
    placementStatus: {
      type: String,
      enum: ['Unplaced', 'Placed'],
      default: 'Unplaced'
    }
  },
  { timestamps: true }
);

studentSchema.index({ department: 1, cgpa: -1 });

module.exports = mongoose.model('Student', studentSchema);
