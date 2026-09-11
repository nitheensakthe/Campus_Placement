import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" *ngIf="user">
      <div class="sidebar-brand">
        <span class="role-title">{{ getRoleTitle() }}</span>
      </div>

      <nav class="sidebar-nav">
        <!-- Student Menu -->
        <ng-container *ngIf="user.role === 'student'">
          <a routerLink="/student/dashboard" routerLinkActive="active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/student/profile" routerLinkActive="active">
            <span class="icon">👤</span> My Profile
          </a>
          <a routerLink="/student/resume" routerLinkActive="active">
            <span class="icon">📄</span> My Resume & AI Analysis
          </a>
          <a routerLink="/student/jobs" routerLinkActive="active">
            <span class="icon">💼</span> Job Drives & Eligibility
          </a>
          <a routerLink="/student/applications" routerLinkActive="active">
            <span class="icon">📝</span> My Applications
          </a>
          <a routerLink="/student/ai-matching" routerLinkActive="active">
            <span class="icon">🎯</span> AI Job Matcher
          </a>
          <a routerLink="/student/ai-interview-prep" routerLinkActive="active">
            <span class="icon">🤖</span> AI Interview Prep
          </a>
          <a routerLink="/student/interviews" routerLinkActive="active">
            <span class="icon">📅</span> Scheduled Interviews
          </a>
        </ng-container>

        <!-- Recruiter Menu -->
        <ng-container *ngIf="user.role === 'recruiter'">
          <a routerLink="/recruiter/dashboard" routerLinkActive="active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/recruiter/create-drive" routerLinkActive="active">
            <span class="icon">➕</span> Create Job Drive
          </a>
          <a routerLink="/recruiter/manage-drives" routerLinkActive="active">
            <span class="icon">📋</span> Manage Job Drives
          </a>
          <a routerLink="/recruiter/applicants" routerLinkActive="active">
            <span class="icon">👥</span> Applicants & Shortlisting
          </a>
          <a routerLink="/recruiter/create-assessment" routerLinkActive="active">
            <span class="icon">🧠</span> Create Assessment
          </a>
          <a routerLink="/recruiter/schedule-interview" routerLinkActive="active">
            <span class="icon">📅</span> Schedule Interview
          </a>
        </ng-container>

        <!-- Admin Menu -->
        <ng-container *ngIf="user.role === 'admin'">
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            <span class="icon">📈</span> Analytics & Reports
          </a>
          <a routerLink="/admin/students" routerLinkActive="active">
            <span class="icon">🎓</span> Manage Students
          </a>
          <a routerLink="/admin/companies" routerLinkActive="active">
            <span class="icon">🏢</span> Companies & Recruiters
          </a>
          <a routerLink="/admin/job-drives" routerLinkActive="active">
            <span class="icon">💼</span> All Job Drives
          </a>
        </ng-container>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      min-height: calc(100vh - 65px);
      padding: 20px 16px;
    }
    .sidebar-brand {
      padding: 0 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 16px;
    }
    .role-title {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      color: #334155;
      font-weight: 500;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .sidebar-nav a:hover {
      background-color: #f1f5f9;
      color: #4f46e5;
    }
    .sidebar-nav a.active {
      background-color: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
    }
    .icon {
      font-size: 1.1rem;
    }
  `]
})
export class SidebarComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.user = user);
  }

  getRoleTitle(): string {
    if (!this.user) return '';
    return `${this.user.role} Portal`;
  }
}
