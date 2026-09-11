import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { LoginComponent } from './features/auth/login';
import { RegisterComponent } from './features/auth/register';
import { StudentDashboardComponent } from './features/student/dashboard';
import { StudentResumeComponent } from './features/student/resume';
import { StudentProfileComponent } from './features/student/profile';
import { StudentApplicationsComponent } from './features/student/applications';
import { JobDrivesComponent } from './features/student/job-drives';
import { JobDetailsComponent } from './features/student/job-details';
import { OnlineTestComponent } from './features/student/online-test';
import { AiInterviewPrepComponent } from './features/student/ai-interview';
import { RecruiterDashboardComponent } from './features/recruiter/dashboard';
import { CreateJobDriveComponent } from './features/recruiter/create-drive';
import { ApplicantsComponent } from './features/recruiter/applicants';
import { RecruiterInterviewsComponent } from './features/recruiter/interviews';
import { AdminDashboardComponent } from './features/admin/dashboard';
import { AdminStudentsComponent } from './features/admin/students';
import { AdminCompaniesComponent } from './features/admin/companies';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Public / Student Job Views
  { path: 'jobs', component: JobDrivesComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },

  // Student Routes
  {
    path: 'student',
    canActivate: [authGuard, roleGuard(['student'])],
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'profile', component: StudentProfileComponent },
      { path: 'resume', component: StudentResumeComponent },
      { path: 'jobs', component: JobDrivesComponent },
      { path: 'jobs/:id', component: JobDetailsComponent },
      { path: 'test/:id', component: OnlineTestComponent },
      { path: 'ai-interview-prep', component: AiInterviewPrepComponent },
      { path: 'ai-matching', component: JobDrivesComponent },
      { path: 'applications', component: StudentApplicationsComponent },
      { path: 'interviews', component: StudentDashboardComponent }
    ]
  },

  // Recruiter Routes
  {
    path: 'recruiter',
    canActivate: [authGuard, roleGuard(['recruiter', 'admin'])],
    children: [
      { path: 'dashboard', component: RecruiterDashboardComponent },
      { path: 'create-drive', component: CreateJobDriveComponent },
      { path: 'applicants', component: ApplicantsComponent },
      { path: 'interviews', component: RecruiterInterviewsComponent },
      { path: 'manage-drives', component: RecruiterDashboardComponent },
      { path: 'create-assessment', component: CreateJobDriveComponent },
      { path: 'schedule-interview', component: RecruiterInterviewsComponent }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'students', component: AdminStudentsComponent },
      { path: 'companies', component: AdminCompaniesComponent },
      { path: 'job-drives', component: AdminDashboardComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
