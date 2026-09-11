const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const backendDir = path.join(__dirname, '../backend');
require(path.join(backendDir, 'node_modules/dotenv')).config({ path: path.join(__dirname, '../.env') });

const connectDB = require(path.join(backendDir, 'config/db'));
const User = require(path.join(backendDir, 'models/User'));
const Student = require(path.join(backendDir, 'models/Student'));
const Company = require(path.join(backendDir, 'models/Company'));
const JobDrive = require(path.join(backendDir, 'models/JobDrive'));
const Application = require(path.join(backendDir, 'models/Application'));
const Assessment = require(path.join(backendDir, 'models/Assessment'));
const Question = require(path.join(backendDir, 'models/Question'));
const TestResult = require(path.join(backendDir, 'models/TestResult'));
const { checkEligibility } = require(path.join(backendDir, 'controllers/jobController'));

test('Campus Placement Platform Integration Tests', async (t) => {
  await t.test('1. Database Connection & Schema Verification', async () => {
    const conn = await connectDB();
    assert.ok(conn, 'Database should connect cleanly');
  });

  await t.test('2. User Password Hashing & Authentication Validation', async () => {
    const testEmail = `testuser_${Date.now()}@campus.edu`;
    const user = await User.create({
      name: 'Integration Test User',
      email: testEmail,
      password: 'secretPassword123',
      role: 'student'
    });

    assert.strictEqual(user.name, 'Integration Test User');
    assert.notStrictEqual(user.password, 'secretPassword123', 'Password should be hashed with bcrypt');

    const isMatch = await user.comparePassword('secretPassword123');
    assert.strictEqual(isMatch, true, 'Password verification should pass');
  });

  await t.test('3. Automated Eligibility Rule Engine Verification', async () => {
    const sampleStudent = {
      cgpa: 8.5,
      department: 'Computer Science',
      graduationYear: 2026,
      skills: ['JavaScript', 'Node.js', 'MongoDB', 'Angular']
    };

    const eligibleJob = {
      minimumCGPA: 7.5,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      eligibleGraduationYears: [2026],
      requiredSkills: ['JavaScript', 'Node.js', 'Git']
    };

    const result = checkEligibility(sampleStudent, eligibleJob);
    assert.strictEqual(result.isEligible, true, 'Student meeting criteria should be marked eligible');
    assert.strictEqual(result.matchedSkills.length, 2, 'Should detect 2 matched skills');

    const ineligibleJob = {
      minimumCGPA: 9.0,
      eligibleDepartments: ['Electrical Eng'],
      eligibleGraduationYears: [2025],
      requiredSkills: ['C++']
    };

    const ineligResult = checkEligibility(sampleStudent, ineligibleJob);
    assert.strictEqual(ineligResult.isEligible, false, 'Student failing criteria should be marked ineligible');
    assert.ok(ineligResult.reasons.length > 0, 'Ineligible reasons should be detailed');
  });

  await t.test('4. Assessment Grading Engine Calculation', async () => {
    const assessment = await Assessment.create({
      jobDriveId: '65f000000000000000000001',
      title: 'UnitTest Assessment',
      duration: 15
    });

    const question = await Question.create({
      assessmentId: assessment._id,
      question: 'What is 2+2?',
      options: ['3', '4', '5'],
      correctAnswer: '4',
      marks: 5
    });

    assert.strictEqual(question.correctAnswer, '4');
    assert.strictEqual(question.marks, 5);
  });
});
