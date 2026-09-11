import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recruiter-dashboard">
      <div class="welcome-banner card">
        <div>
          <h2>Recruiter Portal - Dashboard</h2>
          <p>Manage job drives, shortlist eligible candidates, create assessments & schedule interviews</p>
        </div>
        <a routerLink="/recruiter/create-drive" class="btn btn-primary">+ Create New Job Drive</a>
      </div>

      <div class="kpi-grid mt-4">
        <div class="card kpi-card">
          <span class="kpi-num">{{ jobDrives.length }}</span>
          <span class="kpi-lbl">Active Job Drives</span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-num">{{ totalApplicants }}</span>
          <span class="kpi-lbl">Total Candidates</span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-num">{{ shortlistedCount }}</span>
          <span class="kpi-lbl">Shortlisted Candidates</span>
        </div>
      </div>

      <!-- Active Job Drives Table -->
      <div class="card mt-4">
        <h3>Active Placement Job Drives</h3>
        <div class="table-container mt-3">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Salary</th>
                <th>Min. CGPA</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let drive of jobDrives">
                <td><strong>{{ drive.jobTitle }}</strong></td>
                <td>{{ drive.companyId?.name }}</td>
                <td><span class="salary-text">{{ drive.salary }}</span></td>
                <td>{{ drive.minimumCGPA }} CGPA</td>
                <td>{{ drive.applicationDeadline | date:'mediumDate' }}</td>
                <td><span class="badge badge-success">{{ drive.status }}</span></td>
                <td>
                  <a [routerLink]="['/recruiter/applicants']" [queryParams]="{ driveId: drive._id }" class="btn btn-outline btn-sm">View Applicants</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recruiter-dashboard { max-width: 1100px; margin: 24px auto; padding: 0 20px; }
    .welcome-banner { display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: white; }
    .welcome-banner p { color: #94a3b8; margin-top: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .kpi-card { text-align: center; padding: 24px; }
    .kpi-num { font-size: 2.25rem; font-weight: 800; color: #4f46e5; display: block; }
    .kpi-lbl { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .salary-text { font-weight: 600; color: #059669; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
  `]
})
export class RecruiterDashboardComponent implements OnInit {
  jobDrives: any[] = [];
  totalApplicants = 0;
  shortlistedCount = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchDrives();
  }

  fetchDrives(): void {
    this.apiService.get<any>('jobs').subscribe(res => {
      if (res.success) {
        this.jobDrives = res.data || [];
      }
    });

    this.apiService.get<any>('applications').subscribe(res => {
      if (res.success) {
        const apps = res.data || [];
        this.totalApplicants = apps.length;
        this.shortlistedCount = apps.filter((a: any) => ['Shortlisted', 'Assessment', 'Interview', 'Selected'].includes(a.status)).length;
      }
    });
  }
}
