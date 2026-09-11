const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');

const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const JobDrive = require('./models/JobDrive');
const Application = require('./models/Application');
const Assessment = require('./models/Assessment');
const Question = require('./models/Question');
const TestResult = require('./models/TestResult');
const Interview = require('./models/Interview');
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Database connection ready for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Company.deleteMany({}),
      JobDrive.deleteMany({}),
      Application.deleteMany({}),
      Assessment.deleteMany({}),
      Question.deleteMany({}),
      TestResult.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      Feedback.deleteMany({})
    ]);

    console.log('Cleared existing collections.');

    // 1. Create Admin Account
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'admin'
    });

    // 2. Create Recruiter Accounts & Companies
    const recruiter1 = await User.create({
      name: 'Sarah Connor',
      email: 'recruiter@techcorp.com',
      password: 'password123',
      role: 'recruiter'
    });

    const recruiter2 = await User.create({
      name: 'David Miller',
      email: 'hr@innovate.io',
      password: 'password123',
      role: 'recruiter'
    });

    const company1 = await Company.create({
      name: 'TechCorp Solutions',
      description: 'Global Cloud Enterprise & Software Leader',
      website: 'https://techcorp.com',
      industry: 'Software & Cloud',
      location: 'Silicon Valley / Bangalore',
      recruiterId: recruiter1._id
    });

    const company2 = await Company.create({
      name: 'Innovate AI Labs',
      description: 'Cutting-edge AI research & product agency',
      website: 'https://innovate.io',
      industry: 'Artificial Intelligence',
      location: 'Remote / Hyderabad',
      recruiterId: recruiter2._id
    });

    // 3. Create Student Accounts & Profiles
    const studentUser1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@student.edu',
      password: 'password123',
      role: 'student'
    });

    const studentUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@student.edu',
      password: 'password123',
      role: 'student'
    });

    const studentUser3 = await User.create({
      name: 'Michael Chen',
      email: 'michael@student.edu',
      password: 'password123',
      role: 'student'
    });

    const student1 = await Student.create({
      userId: studentUser1._id,
      registerNumber: 'CS2026-001',
      department: 'Computer Science',
      cgpa: 8.8,
      graduationYear: 2026,
      phone: '+1-555-0192',
      skills: ['JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Angular', 'Git', 'REST API'],
      certifications: [{ title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: 2025 }],
      projects: [{ title: 'E-Learning Platform', description: 'Full stack online learning system built with MEAN stack', technologies: ['Angular', 'Node.js', 'MongoDB'], link: 'https://github.com/alex/elearning' }],
      experience: [{ role: 'Software Intern', company: 'DevStudio', duration: '6 Months', description: 'Built backend REST services' }],
      placementStatus: 'Unplaced'
    });

    const student2 = await Student.create({
      userId: studentUser2._id,
      registerNumber: 'IT2026-042',
      department: 'Information Technology',
      cgpa: 9.1,
      graduationYear: 2026,
      phone: '+1-555-0341',
      skills: ['Python', 'Java', 'Spring Boot', 'SQL', 'MongoDB', 'Docker', 'Git'],
      certifications: [{ title: 'Java SE 17 Developer', issuer: 'Oracle', year: 2025 }],
      projects: [{ title: 'AI Resume Scanner', description: 'NLP resume matching tool', technologies: ['Python', 'FastAPI'], link: 'https://github.com/priya/resume-scanner' }],
      placementStatus: 'Placed'
    });

    const student3 = await Student.create({
      userId: studentUser3._id,
      registerNumber: 'EC2026-089',
      department: 'Electronics & Comm',
      cgpa: 7.2,
      graduationYear: 2026,
      phone: '+1-555-0812',
      skills: ['C++', 'Python', 'Embedded C', 'HTML', 'CSS', 'JavaScript'],
      placementStatus: 'Unplaced'
    });

    // 4. Create Job Drives
    const drive1 = await JobDrive.create({
      companyId: company1._id,
      jobTitle: 'Full Stack Software Engineer',
      description: 'Looking for high-caliber graduate engineers proficient in Angular, Node.js, and Cloud APIs.',
      salary: '12 LPA',
      location: 'Bangalore / Hybrid',
      requiredSkills: ['JavaScript', 'Node.js', 'Angular', 'MongoDB', 'REST API', 'Git'],
      minimumCGPA: 7.5,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      eligibleGraduationYears: [2026],
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Active'
    });

    const drive2 = await JobDrive.create({
      companyId: company2._id,
      jobTitle: 'AI / Backend Engineer',
      description: 'Design and deploy scalable AI microservices using Python, Node, and vector data engines.',
      salary: '15 LPA',
      location: 'Remote',
      requiredSkills: ['Python', 'Java', 'Spring Boot', 'SQL', 'MongoDB', 'Docker'],
      minimumCGPA: 8.0,
      eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      eligibleGraduationYears: [2026],
      applicationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'Active'
    });

    // 5. Create Applications
    const app1 = await Application.create({
      studentId: student1._id,
      jobDriveId: drive1._id,
      status: 'Assessment',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const app2 = await Application.create({
      studentId: student2._id,
      jobDriveId: drive2._id,
      status: 'Selected',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // 6. Create Assessment & MCQ Questions
    const assessment1 = await Assessment.create({
      jobDriveId: drive1._id,
      title: 'Full Stack Online Technical Assessment',
      description: 'Covers JavaScript ES6+, Node.js asynchronous architecture, REST API security, and MongoDB indexing.',
      duration: 20
    });

    await Question.insertMany([
      {
        assessmentId: assessment1._id,
        question: 'Which of the following is true about Node.js Event Loop?',
        options: [
          'Node.js is multithreaded by default for all JS execution',
          'JavaScript runs on a single thread and uses non-blocking I/O callbacks',
          'Event loop executes all setTimeout callbacks before NextTick queue',
          'Node.js uses blocking synchronous network calls by default'
        ],
        correctAnswer: 'JavaScript runs on a single thread and uses non-blocking I/O callbacks',
        marks: 2,
        type: 'MCQ'
      },
      {
        assessmentId: assessment1._id,
        question: 'What HTTP status code represents unauthenticated request access in REST APIs?',
        options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
        correctAnswer: '401 Unauthorized',
        marks: 1,
        type: 'MCQ'
      },
      {
        assessmentId: assessment1._id,
        question: 'Which operator is used for embedding document queries in MongoDB aggregation pipelines?',
        options: ['$match', '$lookup', '$unwind', '$project'],
        correctAnswer: '$lookup',
        marks: 2,
        type: 'MCQ'
      }
    ]);

    // 7. Create Test Results
    await TestResult.create({
      assessmentId: assessment1._id,
      studentId: student1._id,
      score: 5,
      percentage: 100,
      correctAnswers: 3,
      wrongAnswers: 0,
      timeTaken: 480,
      submittedAt: new Date()
    });

    // 8. Create Interview Schedule
    await Interview.create({
      applicationId: app1._id,
      studentId: student1._id,
      recruiterId: recruiter1._id,
      companyId: company1._id,
      round: 'Technical Round 1',
      date: '2026-09-20',
      time: '11:00 AM',
      mode: 'Online',
      meetingLink: 'https://meet.google.com/techcorp-interview-2026',
      status: 'Scheduled'
    });

    // 9. Notifications
    await Notification.insertMany([
      {
        userId: studentUser1._id,
        title: 'Welcome to Campus Placement Portal!',
        message: 'Your profile has been created. Upload your PDF resume to start applying.',
        type: 'info',
        read: false
      },
      {
        userId: studentUser1._id,
        title: 'Interview Scheduled',
        message: 'TechCorp Technical Round 1 scheduled for Sep 20, 11:00 AM.',
        type: 'interview',
        read: false
      }
    ]);

    console.log('Database seeding completed successfully!');
    console.log('\n--- DEMO ACCOUNTS ---');
    console.log('Admin: admin@campus.edu / password123');
    console.log('Recruiter 1: recruiter@techcorp.com / password123');
    console.log('Recruiter 2: hr@innovate.io / password123');
    console.log('Student 1: alex@student.edu / password123');
    console.log('Student 2: priya@student.edu / password123');
    console.log('---------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
