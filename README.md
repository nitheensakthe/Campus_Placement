# 🎓 Campus Placement & Interview Management Platform

> AI-powered full-stack campus recruitment system with automated eligibility screening, resume analysis, online MCQ assessments, interview scheduling, and real-time placement analytics.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Angular 22 Frontend  (Port 4200)                               │
│  ├── Auth (Login/Register with role-based routing)             │
│  ├── Student Portal  (Dashboard, Resume, Jobs, AI Prep)        │
│  ├── Recruiter Portal (Job Drives, Applicants, Interviews)     │
│  └── Admin Portal    (Placement Analytics Dashboard)           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST + JWT Bearer
┌──────────────────────────▼──────────────────────────────────────┐
│  Node.js + Express Backend API  (Port 5000)                    │
│  ├── /api/auth       (JWT auth, register, login, me)           │
│  ├── /api/students   (profile CRUD, resume upload)             │
│  ├── /api/companies  (company CRUD)                            │
│  ├── /api/jobs       (job drives, eligibility engine)          │
│  ├── /api/applications (apply, status transitions)             │
│  ├── /api/assessments  (MCQ test, auto-grading)                │
│  ├── /api/interviews   (scheduling, feedback)                  │
│  ├── /api/notifications (bell, read state)                     │
│  ├── /api/analytics    (MongoDB aggregation pipelines)         │
│  └── /api/ai           (resume analyzer, job matching, prep)   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────────────────┐
│  MongoDB  (Local: 27017 | MongoMemoryServer fallback)          │
│  Collections: User, Student, Company, JobDrive, Application,   │
│               Assessment, Question, TestResult, Interview,      │
│               Notification, Feedback                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **MongoDB** (local installation, or the app will auto-fallback to MongoMemoryServer)
- **Python** 3.9+ (for optional AI microservice)

---

### 1. Clone & Install

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
# Root .env (already pre-configured)
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campus_placement
JWT_SECRET=super_secret_jwt_key_campus_placement_2026
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

> **Note:** If MongoDB is not running locally, the backend automatically starts an in-memory MongoDB server as a fallback — no setup needed for development.

---

### 3. Seed Demo Database

```bash
cd backend
node seed.js
```

**Demo Accounts (all use password `password123`):**

| Role          | Email                      | Password      |
|---------------|----------------------------|---------------|
| 🔴 Admin       | admin@campus.edu           | password123   |
| 🔵 Recruiter 1 | recruiter@techcorp.com     | password123   |
| 🔵 Recruiter 2 | hr@innovate.io             | password123   |
| 🟢 Student 1   | alex@student.edu           | password123   |
| 🟢 Student 2   | priya@student.edu          | password123   |

---

### 4. Start the Backend API

```bash
cd backend
npm run dev
# API running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

---

### 5. Start the Angular Frontend

```bash
cd frontend
npm start
# UI running at http://localhost:4200
```

---

### 6. (Optional) Start the Python AI Microservice

```bash
cd ai-service
pip install -r requirements.txt
python main.py
# FastAPI running at http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

---

## 📋 Full API Reference

### Authentication
| Method | Endpoint              | Access  | Description |
|--------|-----------------------|---------|-------------|
| POST   | /api/auth/register    | Public  | Register Student / Recruiter / Admin |
| POST   | /api/auth/login       | Public  | Login & receive JWT token |
| GET    | /api/auth/me          | Private | Get current authenticated user info |

### Student Management
| Method | Endpoint                  | Access          | Description |
|--------|---------------------------|-----------------|-------------|
| GET    | /api/students/profile     | Student         | Get own profile |
| PUT    | /api/students/profile     | Student         | Update profile & skills |
| POST   | /api/students/resume      | Student         | Upload PDF resume |
| DELETE | /api/students/resume      | Student         | Delete resume |
| GET    | /api/students             | Admin/Recruiter | List all students (with filters) |

### Job Drives
| Method | Endpoint       | Access          | Description |
|--------|----------------|-----------------|-------------|
| GET    | /api/jobs      | Public + Auth   | Get all drives (with eligibility for students) |
| GET    | /api/jobs/:id  | Public + Auth   | Drive details with eligibility breakdown |
| POST   | /api/jobs      | Recruiter/Admin | Create new job drive |
| PUT    | /api/jobs/:id  | Recruiter/Admin | Update job drive |
| DELETE | /api/jobs/:id  | Recruiter/Admin | Delete job drive |

### Applications
| Method | Endpoint                       | Access          | Description |
|--------|--------------------------------|-----------------|-------------|
| POST   | /api/applications              | Student         | Apply (with eligibility validation) |
| GET    | /api/applications              | All             | Get applications (role-filtered) |
| PUT    | /api/applications/:id/status   | Recruiter/Admin | Update recruitment status |

### Assessments
| Method | Endpoint                    | Access          | Description |
|--------|-----------------------------|-----------------|-------------|
| POST   | /api/assessments            | Recruiter/Admin | Create assessment + questions |
| GET    | /api/assessments/:id        | All             | Get test (answers hidden for students) |
| POST   | /api/assessments/:id/submit | Student         | Submit answers for auto-grading |

### Interviews & Feedback
| Method | Endpoint                  | Access          | Description |
|--------|---------------------------|-----------------|-------------|
| POST   | /api/interviews           | Recruiter/Admin | Schedule interview |
| GET    | /api/interviews           | All             | Get interviews (role-filtered) |
| PUT    | /api/interviews/:id       | Recruiter/Admin | Update interview details/status |
| POST   | /api/interviews/feedback  | Recruiter/Admin | Submit candidate feedback scores |

### AI Services
| Method | Endpoint                      | Access | Description |
|--------|-------------------------------|--------|-------------|
| POST   | /api/ai/resume-analyzer       | Auth   | AI resume extraction & scoring |
| POST   | /api/ai/job-matching          | Auth   | Skill-overlap + AI match score |
| GET    | /api/ai/recommended-jobs      | Auth   | Personalized AI job recommendations |
| POST   | /api/ai/interview/questions   | Auth   | Generate mock interview questions |
| POST   | /api/ai/interview/evaluate    | Auth   | AI answer scoring (Technical/Communication/Completeness) |

### Analytics
| Method | Endpoint        | Access          | Description |
|--------|-----------------|-----------------|-------------|
| GET    | /api/analytics  | Admin/Recruiter | Full placement analytics with MongoDB aggregations |

---

## 🤖 AI Features Breakdown

### 1. Resume Analyzer
- Extracts skills, education, projects, experience, certifications from PDF resume
- Assigns overall resume quality score (0–100) and readability grade
- Highlights core strengths and improvement recommendations

### 2. Resume-to-Job Matcher
- Transparent formula: `(Matched Skills / Required Skills) × 100`
- AI semantic bonus for department & CGPA alignment (up to +15%)
- Lists exactly which skills match vs. what's missing

### 3. AI Job Recommendations
- Ranks all active job drives by student profile compatibility
- Sorted by match percentage with natural language explanation per drive

### 4. Mock Interview Prep & Evaluator
- Generates role-specific Technical, Behavioral, Project-based, and HR questions
- Scores candidate answers on three axes: Technical (0–100), Communication (0–100), Completeness (0–100)
- Provides advisory improvement suggestions per answer

---

## 🛡️ Eligibility Engine Rules

The backend **automatically** validates every application submission against:

1. **CGPA Check** — Student CGPA must meet or exceed `drive.minimumCGPA`
2. **Department Check** — Student's department must be in `drive.eligibleDepartments` list
3. **Graduation Year Check** — Student's year must be in `drive.eligibleGraduationYears` list
4. **Deadline Check** — Application date must be before `drive.applicationDeadline`
5. **Status Check** — Job drive must be in `Active` status

Any failure returns a detailed `reasons` array explaining exactly why the student is ineligible.

---

## 📊 Analytics Computed Metrics

The admin dashboard uses **MongoDB Aggregation Pipelines** to compute:

- **Department-Wise Placement Rate** — `placed / total × 100` per department
- **Top Skill Demand Trends** — Most required skills across all job drives
- **Application Pipeline Distribution** — Count per status (Applied → Selected)
- **Company Hiring Engagement** — Drives posted & applicants per company
- **KPIs** — Total students, placement rate, highest/average package

---

## 🧪 Running Tests

```bash
# Backend Integration Tests (4 suites)
node --test tests/backend.test.js

# Tests cover:
# ✔ 1. Database Connection & Schema Verification
# ✔ 2. User Password Hashing & Authentication Validation
# ✔ 3. Automated Eligibility Rule Engine Verification
# ✔ 4. Assessment Grading Engine Calculation
```

---

## 📁 Project Structure

```
Resume Analysis/
├── backend/
│   ├── config/           # MongoDB connection with MongoMemoryServer fallback
│   ├── controllers/      # Auth, Student, Company, Job, Application, Assessment,
│   │                     # Interview, Notification, Analytics, AI controllers
│   ├── middleware/        # JWT auth, role authorization, error handler
│   ├── models/           # 11 Mongoose models with indexes and validations
│   ├── routes/           # Express routers for all API endpoints
│   ├── utils/            # Standardized apiResponse helper
│   ├── uploads/          # PDF resume files storage
│   ├── seed.js           # Full demo database seeder
│   └── server.js         # Express app entrypoint
├── frontend/
│   └── src/app/
│       ├── core/         # AuthService, ApiService, Guards, JWT Interceptor
│       ├── features/
│       │   ├── auth/     # Login, Register components
│       │   ├── student/  # Dashboard, Profile, Resume, Jobs, Applications,
│       │   │             # OnlineTest, AI Interview Prep
│       │   ├── recruiter/# Dashboard, CreateDrive, Applicants board
│       │   └── admin/    # Analytics Dashboard
│       └── shared/       # Header (notification bell), Sidebar navigation
├── ai-service/
│   ├── main.py           # FastAPI AI microservice
│   └── requirements.txt
├── tests/
│   └── backend.test.js   # Backend integration test suite
├── .env                  # Environment configuration
└── README.md
```

---

## ✅ Feature Checklist

### Core Platform
- [x] Secure JWT authentication with bcrypt password hashing
- [x] Multi-role access (Student / Recruiter / Admin) with authorization middleware
- [x] Student profile management with skills, certifications, projects, experience
- [x] PDF resume upload with auto-skill extraction (Multer + pdf-parse)

### Job Drive & Eligibility
- [x] Job drive CRUD with eligibility constraint configuration
- [x] Automated multi-rule eligibility engine (CGPA + Department + Year + Deadline)
- [x] Real-time eligibility badges and skill-overlap reporting
- [x] Duplicate application & deadline validation

### Assessment System
- [x] MCQ assessment creation with questions, options, marks
- [x] Correct answers hidden from student during test (backend-only reveal on submission)
- [x] Countdown timer with auto-submit on expiry
- [x] Instant auto-grading with percentage and score breakdown

### Interview & Candidate Management
- [x] Interview scheduling with meeting link and round management
- [x] Application status lifecycle (Applied → Rejected/Selected)
- [x] Candidate feedback scoring (Technical / Communication / Completeness)
- [x] Automatic status-change notifications

### AI Features
- [x] AI Resume Analyzer (skill extraction, score, improvement tips)
- [x] AI Resume-to-Job Matcher (transparent skill-overlap formula)
- [x] AI Job Recommendations (ranked by profile compatibility)
- [x] AI Mock Interview Question Generator
- [x] AI Interview Answer Evaluator with 3-axis scoring

### Admin & Analytics
- [x] Real-time MongoDB aggregation pipeline analytics
- [x] Department-wise placement rate charts
- [x] Company-wise hiring engagement metrics
- [x] Top skill demand trend visualization
- [x] Application pipeline status distribution

---

## 🔐 Security Features

- JWT tokens with configurable expiry (default 7 days)
- bcrypt password hashing (salt rounds: 10)
- Role-based route guards on frontend and backend
- Multer file type validation (PDF-only uploads, 5MB limit)
- Assessment correct answers never exposed to student endpoints
- CORS configured for development

---

*Built with Node.js, Express, MongoDB (Mongoose), Angular 22, and Python FastAPI*
#   C a m p u s _ P l a c e m e n t  
 