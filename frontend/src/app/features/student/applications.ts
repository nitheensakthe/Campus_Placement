import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="applications-page card">
      <h2>📝 My Placement Applications</h2>
      <p>Track your applied job drives and current pipeline status in real-time</p>

      <div class="table-container mt-4">
        <table>
          <thead>
            <tr>
              <th>Job Drive</th>
              <th>Company</th>
              <th>Salary</th>
              <th>Applied On</th>
              <th>Current Status</th>
              <th>Next Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of applications">
              <td><strong>{{ app.jobDriveId?.jobTitle }}</strong></td>
              <td>{{ app.jobDriveId?.companyId?.name }}</td>
              <td class="salary-cell">{{ app.jobDriveId?.salary }}</td>
              <td>{{ app.appliedAt | date:'mediumDate' }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(app.status)">{{ app.status }}</span>
              </td>
              <td>
                <ng-container [ngSwitch]="app.status">
                  <a *ngSwitchCase="'Assessment'" [routerLink]="['/student/test', app.jobDriveId?._id]" class="btn btn-primary btn-xs">Take Assessment</a>
                  <span *ngSwitchCase="'Interview'" class="btn-xs text-info">📅 Check Interviews</span>
                  <span *ngSwitchCase="'Selected'" class="badge badge-success">🎉 Congratulations!</span>
                  <span *ngSwitchCase="'Rejected'" class="text-muted">Application closed</span>
                  <span *ngSwitchDefault class="text-muted text-sm">Awaiting update</span>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="applications.length === 0" class="empty-state mt-4">
          <div class="empty-icon">📭</div>
          <h3>No Applications Yet</h3>
          <p>Browse active job drives and apply for the ones you're eligible for.</p>
          <a routerLink="/student/jobs" class="btn btn-primary mt-3">Explore Job Drives</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .applications-page { max-width: 1100px; margin: 24px auto; padding: 32px; }
    .salary-cell { font-weight: 600; color: #059669; }
    .text-info { color: #0284c7; font-weight: 600; font-size: 0.85rem; }
    .text-muted { color: #64748b; font-size: 0.85rem; }
    .text-sm { font-size: 0.8rem; }
    .btn-xs { padding: 4px 10px; font-size: 0.78rem; }
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .empty-state h3 { font-size: 1.25rem; font-weight: 600; }
    .empty-state p { color: #64748b; margin-top: 6px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
  `]
})
export class StudentApplicationsComponent implements OnInit {
  applications: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.get<any>('applications').subscribe(res => {
      if (res.success) {
        this.applications = res.data || [];
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Selected': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      case 'Interview': case 'Shortlisted': return 'badge-info';
      case 'Assessment': return 'badge-warning';
      default: return '';
    }
  }
}
