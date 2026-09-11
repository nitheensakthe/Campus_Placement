import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User, Student } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page" *ngIf="user">
      <div class="welcome-banner card">
        <div class="banner-content">
          <h2>Welcome back, {{ user.name }}! 👋</h2>
          <p>Department of {{ student?.department || 'Engineering' }} • CGPA: {{ student?.cgpa || 0 }} • Class of {{ student?.graduationYear || 2026 }}</p>
        </div>
        <div class="placement-status-badge">
          <span class="status-label">Placement Status</span>
          <span class="badge" [ngClass]="student?.placementStatus === 'Placed' ? 'badge-success' : 'badge-warning'">
            {{ student?.placementStatus || 'Unplaced' }}
          </span>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="card kpi-card">
          <div class="kpi-icon bg-indigo">📝</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ applications.length }}</span>
            <span class="kpi-title">Total Applications</span>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-icon bg-amber">⭐</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ shortlistedCount }}</span>
            <span class="kpi-title">Shortlisted Drives</span>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-icon bg-sky">📅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ interviews.length }}</span>
            <span class="kpi-title">Upcoming Interviews</span>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-icon bg-emerald">🏆</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ selectedCount }}</span>
            <span class="kpi-title">Offers Selected</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Upcoming Interviews Section -->
        <div class="card section-card">
          <div class="card-header">
            <h3>📅 Scheduled Interviews</h3>
            <a routerLink="/student/interviews" class="view-all">View All</a>
          </div>

          <div *ngIf="interviews.length === 0" class="empty-state">
            <p>No upcoming interviews scheduled yet.</p>
          </div>

          <div *ngFor="let item of interviews" class="interview-item">
            <div class="interview-company">{{ item.companyId?.name }}</div>
            <div class="interview-details">
              <span><strong>Round:</strong> {{ item.round }}</span>
              <span><strong>Date & Time:</strong> {{ item.date }} at {{ item.time }}</span>
            </div>
            <a [href]="item.meetingLink" target="_blank" class="btn btn-outline btn-sm">Join Meeting</a>
          </div>
        </div>

        <!-- AI Recommended Jobs Section -->
        <div class="card section-card">
          <div class="card-header">
            <h3>🤖 Top AI Recommended Drives</h3>
            <a routerLink="/student/jobs" class="view-all">Browse Drives</a>
          </div>

          <div *ngFor="let rec of recommendedJobs.slice(0, 3)" class="rec-item">
            <div class="rec-header">
              <span class="job-title">{{ rec.jobDrive?.jobTitle }}</span>
              <span class="badge badge-success">{{ rec.matchPercentage }}% Match</span>
            </div>
            <p class="rec-company">{{ rec.jobDrive?.companyId?.name }} • {{ rec.jobDrive?.salary }}</p>
            <p class="rec-explain">{{ rec.explanation }}</p>
            <a [routerLink]="['/student/jobs', rec.jobDrive?._id]" class="btn btn-primary btn-sm mt-2">View & Apply</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .welcome-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      color: white;
      margin-bottom: 24px;
    }
    .welcome-banner p { color: #c7d2fe; margin-top: 4px; }
    .placement-status-badge { text-align: right; }
    .status-label { display: block; font-size: 0.8rem; color: #c7d2fe; margin-bottom: 4px; }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .kpi-card { display: flex; align-items: center; gap: 16px; }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .bg-indigo { background: #e0e7ff; }
    .bg-amber { background: #fef3c7; }
    .bg-sky { background: #e0f2fe; }
    .bg-emerald { background: #d1fae5; }
    
    .kpi-value { font-size: 1.5rem; font-weight: 700; display: block; line-height: 1; }
    .kpi-title { font-size: 0.85rem; color: #64748b; }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .view-all { font-size: 0.85rem; font-weight: 600; }
    
    .interview-item {
      padding: 14px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .interview-company { font-weight: 600; }
    .interview-details { font-size: 0.85rem; color: #64748b; display: flex; flex-direction: column; }
    
    .rec-item {
      padding: 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .rec-header { display: flex; justify-content: space-between; align-items: center; }
    .job-title { font-weight: 600; color: #0f172a; }
    .rec-company { font-size: 0.85rem; color: #64748b; margin: 4px 0; }
    .rec-explain { font-size: 0.8rem; color: #475569; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class StudentDashboardComponent implements OnInit {
  user: User | null = null;
  student: Student | null = null;
  applications: any[] = [];
  interviews: any[] = [];
  recommendedJobs: any[] = [];
  shortlistedCount = 0;
  selectedCount = 0;

  constructor(private authService: AuthService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.student = this.authService.getStudent();
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.get<any>('applications').subscribe(res => {
      if (res.success) {
        this.applications = res.data || [];
        this.shortlistedCount = this.applications.filter(a => ['Shortlisted', 'Assessment', 'Interview'].includes(a.status)).length;
        this.selectedCount = this.applications.filter(a => a.status === 'Selected').length;
      }
    });

    this.apiService.get<any>('interviews').subscribe(res => {
      if (res.success) {
        this.interviews = res.data || [];
      }
    });

    this.apiService.get<any>('ai/recommended-jobs').subscribe(res => {
      if (res.success) {
        this.recommendedJobs = res.data || [];
      }
    });
  }
}
