import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Interview {
  _id: string;
  applicationId: any;
  round: number;
  type: string;
  scheduledAt: string;
  meetingLink?: string;
  status: string;
}

@Component({
  selector: 'app-recruiter-interviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="interviews-page">
      <!-- Schedule Panel -->
      <div class="card schedule-panel">
        <h2>📅 Schedule Interview</h2>
        <p>Book an interview slot for a shortlisted candidate</p>

        <form class="schedule-form mt-3" (ngSubmit)="scheduleInterview()">
          <div class="form-row">
            <div class="form-group col">
              <label>Application ID</label>
              <input type="text" [(ngModel)]="form.applicationId" name="applicationId"
                     class="form-control" placeholder="Paste Application ID from Applicants board">
            </div>
            <div class="form-group col">
              <label>Interview Round</label>
              <select [(ngModel)]="form.round" name="round" class="form-control">
                <option [value]="1">Round 1 — Technical</option>
                <option [value]="2">Round 2 — HR</option>
                <option [value]="3">Round 3 — Final / CXO</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label>Interview Type</label>
              <select [(ngModel)]="form.type" name="type" class="form-control">
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Managerial">Managerial</option>
                <option value="Group Discussion">Group Discussion</option>
              </select>
            </div>
            <div class="form-group col">
              <label>Date & Time</label>
              <input type="datetime-local" [(ngModel)]="form.scheduledAt" name="scheduledAt" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label>Meeting Link</label>
            <input type="url" [(ngModel)]="form.meetingLink" name="meetingLink"
                   class="form-control" placeholder="https://meet.google.com/xyz-abc-def">
          </div>

          <div class="form-group">
            <label>Location / Notes</label>
            <input type="text" [(ngModel)]="form.location" name="location"
                   class="form-control" placeholder="Room 301, Block A  or  Virtual (Google Meet)">
          </div>

          <div *ngIf="successMsg" class="alert alert-success mt-2">{{ successMsg }}</div>
          <div *ngIf="errorMsg" class="alert alert-danger mt-2">{{ errorMsg }}</div>

          <button type="submit" [disabled]="scheduling" class="btn btn-primary mt-3">
            {{ scheduling ? 'Scheduling...' : '📅 Schedule Interview' }}
          </button>
        </form>
      </div>

      <!-- Upcoming Interviews Table -->
      <div class="card mt-4">
        <div class="card-header-row">
          <h3>Upcoming & Scheduled Interviews</h3>
          <select [(ngModel)]="statusFilter" (ngModelChange)="filterInterviews()" class="form-control filter-select">
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div class="table-container mt-3">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Round</th>
                <th>Type</th>
                <th>Scheduled At</th>
                <th>Meeting Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let iv of filteredInterviews">
                <td>
                  <strong>{{ iv.applicationId?.studentId?.userId?.name || 'Candidate' }}</strong>
                </td>
                <td>Round {{ iv.round }}</td>
                <td>{{ iv.type }}</td>
                <td>{{ iv.scheduledAt | date:'medium' }}</td>
                <td>
                  <a *ngIf="iv.meetingLink" [href]="iv.meetingLink" target="_blank" class="link-primary">
                    Join Meeting
                  </a>
                  <span *ngIf="!iv.meetingLink" class="text-muted">—</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(iv.status)">{{ iv.status }}</span>
                </td>
                <td>
                  <button *ngIf="iv.status === 'Scheduled'"
                          (click)="markComplete(iv._id)"
                          class="btn btn-outline btn-xs">
                    ✓ Mark Done
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredInterviews.length === 0" class="empty-state mt-3">
            <div class="empty-icon">📭</div>
            <p>No interviews found for the selected filter.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interviews-page { max-width: 1100px; margin: 24px auto; padding: 0 20px; }
    .schedule-panel { padding: 28px; }
    .schedule-panel h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 4px; }
    .schedule-panel p { color: #64748b; font-size: 0.9rem; }

    .schedule-form .form-row { display: flex; gap: 16px; }
    .schedule-form .col { flex: 1; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; }

    .card-header-row { display: flex; justify-content: space-between; align-items: center; }
    .card-header-row h3 { font-size: 1rem; font-weight: 700; }
    .filter-select { width: 180px; padding: 8px 12px; font-size: 0.85rem; }

    .link-primary { color: #4f46e5; font-weight: 500; font-size: 0.85rem; text-decoration: none; }
    .link-primary:hover { text-decoration: underline; }
    .text-muted { color: #94a3b8; }
    .btn-xs { padding: 4px 10px; font-size: 0.78rem; }

    .alert { padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-danger { background: #fee2e2; color: #991b1b; }

    .empty-state { text-align: center; padding: 32px; color: #64748b; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 8px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class RecruiterInterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  statusFilter = '';
  scheduling = false;
  successMsg = '';
  errorMsg = '';

  form = {
    applicationId: '',
    round: 1,
    type: 'Technical',
    scheduledAt: '',
    meetingLink: '',
    location: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.apiService.get<any>('interviews').subscribe(res => {
      if (res.success) {
        this.interviews = res.data || [];
        this.filterInterviews();
      }
    });
  }

  filterInterviews(): void {
    this.filteredInterviews = this.statusFilter
      ? this.interviews.filter(iv => iv.status === this.statusFilter)
      : [...this.interviews];
  }

  scheduleInterview(): void {
    this.scheduling = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.apiService.post<any>('interviews', this.form).subscribe({
      next: (res) => {
        this.scheduling = false;
        if (res.success) {
          this.successMsg = 'Interview scheduled successfully and candidate notified!';
          this.form = { applicationId: '', round: 1, type: 'Technical', scheduledAt: '', meetingLink: '', location: '' };
          this.loadInterviews();
          setTimeout(() => this.successMsg = '', 4000);
        }
      },
      error: (err) => {
        this.scheduling = false;
        this.errorMsg = err.error?.message || 'Failed to schedule interview.';
      }
    });
  }

  markComplete(id: string): void {
    this.apiService.put<any>(`interviews/${id}`, { status: 'Completed' }).subscribe(res => {
      if (res.success) {
        this.loadInterviews();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  }
}
