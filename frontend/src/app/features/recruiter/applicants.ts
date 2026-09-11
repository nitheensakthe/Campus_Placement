import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="applicants-page card">
      <h2>👥 Candidate Applications Board</h2>
      <p>Review applicant profiles, transition recruitment status, schedule interviews, and record feedback</p>

      <div class="table-container mt-4">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Applied Drive</th>
              <th>Current Status</th>
              <th>Actions / Status Transition</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of applications">
              <td>
                <strong>{{ app.studentId?.userId?.name }}</strong><br>
                <small class="text-muted">{{ app.studentId?.registerNumber }}</small>
              </td>
              <td>{{ app.studentId?.department }}</td>
              <td><strong>{{ app.studentId?.cgpa }}</strong></td>
              <td>{{ app.jobDriveId?.jobTitle }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusBadgeClass(app.status)">{{ app.status }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <select [ngModel]="app.status" (ngModelChange)="updateStatus(app, $event)" class="status-select">
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button (click)="openScheduleModal(app)" class="btn btn-outline btn-xs">Schedule Interview</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Interview Scheduling Modal -->
      <div *ngIf="showScheduleModal" class="modal-backdrop">
        <div class="card modal-card">
          <h3>📅 Schedule Interview for Candidate</h3>
          <p *ngIf="selectedApp">Candidate: <strong>{{ selectedApp.studentId?.userId?.name }}</strong></p>

          <div class="form-group mt-3">
            <label>Interview Round</label>
            <input type="text" [(ngModel)]="schedRound" class="form-control" placeholder="Technical Round 1">
          </div>

          <div class="form-row mt-2">
            <div class="form-group col">
              <label>Date</label>
              <input type="date" [(ngModel)]="schedDate" class="form-control">
            </div>
            <div class="form-group col">
              <label>Time</label>
              <input type="text" [(ngModel)]="schedTime" class="form-control" placeholder="11:00 AM">
            </div>
          </div>

          <div class="form-group mt-2">
            <label>Meeting Link (Google Meet / Teams)</label>
            <input type="text" [(ngModel)]="schedLink" class="form-control" placeholder="https://meet.google.com/xyz-abc-123">
          </div>

          <div class="modal-footer mt-4">
            <button (click)="closeScheduleModal()" class="btn btn-outline">Cancel</button>
            <button (click)="confirmSchedule()" class="btn btn-primary">Confirm Interview</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .applicants-page { max-width: 1150px; margin: 24px auto; padding: 32px; }
    .status-select { padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; }
    .action-buttons { display: flex; gap: 8px; align-items: center; }
    .btn-xs { padding: 4px 8px; font-size: 0.75rem; }
    .text-muted { color: #64748b; font-size: 0.8rem; }
    
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center;
      z-index: 500;
    }
    .modal-card { width: 100%; max-width: 480px; padding: 28px; background: white; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .form-row { display: flex; gap: 12px; }
    .col { flex: 1; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class ApplicantsComponent implements OnInit {
  applications: any[] = [];
  showScheduleModal = false;
  selectedApp: any = null;

  schedRound = 'Technical Round 1';
  schedDate = '2026-09-25';
  schedTime = '11:00 AM';
  schedLink = 'https://meet.google.com/interview-2026';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.apiService.get<any>('applications').subscribe(res => {
      if (res.success) {
        this.applications = res.data || [];
      }
    });
  }

  updateStatus(app: any, newStatus: string): void {
    this.apiService.put<any>(`applications/${app._id}/status`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          app.status = newStatus;
        }
      }
    });
  }

  openScheduleModal(app: any): void {
    this.selectedApp = app;
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.selectedApp = null;
  }

  confirmSchedule(): void {
    if (!this.selectedApp) return;

    this.apiService.post<any>('interviews', {
      applicationId: this.selectedApp._id,
      studentId: this.selectedApp.studentId._id,
      companyId: this.selectedApp.jobDriveId.companyId._id,
      round: this.schedRound,
      date: this.schedDate,
      time: this.schedTime,
      mode: 'Online',
      meetingLink: this.schedLink
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedApp.status = 'Interview';
          this.closeScheduleModal();
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Selected') return 'badge-success';
    if (status === 'Rejected') return 'badge-danger';
    if (status === 'Interview' || status === 'Shortlisted') return 'badge-info';
    return 'badge-warning';
  }
}
