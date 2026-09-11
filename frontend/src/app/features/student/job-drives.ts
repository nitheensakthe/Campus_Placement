import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-job-drives',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="jobs-page">
      <div class="page-header">
        <h2>💼 Campus Job Placement Drives</h2>
        <p>Explore active company recruitment drives with real-time eligibility computation</p>
      </div>

      <!-- Search & Filter Controls -->
      <div class="card filter-card">
        <div class="search-box">
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Search by Job Title, Skill (e.g. Node.js), or Location..." class="form-control">
        </div>
      </div>

      <!-- Job Drives List -->
      <div class="jobs-grid mt-4">
        <div *ngFor="let drive of filteredDrives" class="card job-card">
          <div class="job-header">
            <div>
              <h3 class="job-title">{{ drive.jobTitle }}</h3>
              <p class="company-name">🏢 {{ drive.companyId?.name }} • 📍 {{ drive.location }}</p>
            </div>
            <div class="salary-tag">{{ drive.salary }}</div>
          </div>

          <div class="eligibility-box mt-3" *ngIf="drive.eligibility" [ngClass]="drive.eligibility.isEligible ? 'eligible-bg' : 'not-eligible-bg'">
            <div class="eligibility-header">
              <span class="badge" [ngClass]="drive.eligibility.isEligible ? 'badge-success' : 'badge-danger'">
                {{ drive.eligibility.isEligible ? 'Eligible to Apply' : 'Not Eligible' }}
              </span>
              <span class="match-score">{{ drive.eligibility.matchPercentage }}% Skill Match</span>
            </div>
            <ul class="reason-list mt-2">
              <li *ngFor="let reason of drive.eligibility.reasons">
                {{ drive.eligibility.isEligible ? '✓' : '✗' }} {{ reason }}
              </li>
            </ul>
          </div>

          <div class="job-skills mt-3">
            <span *ngFor="let skill of drive.requiredSkills" class="skill-tag">{{ skill }}</span>
          </div>

          <div class="job-footer mt-4">
            <span class="deadline">⏰ Deadline: {{ drive.applicationDeadline | date:'mediumDate' }}</span>
            <a [routerLink]="['/student/jobs', drive._id]" class="btn btn-primary btn-sm">View Drive & Apply</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jobs-page { max-width: 1100px; margin: 24px auto; padding: 0 20px; }
    .page-header { margin-bottom: 24px; }
    .filter-card { padding: 16px; }
    .form-control { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; }
    .jobs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 24px; }
    .job-card { display: flex; flex-direction: column; justify-content: space-between; }
    .job-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .job-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .company-name { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
    .salary-tag { font-weight: 700; color: #059669; font-size: 1.1rem; background: #ecfdf5; padding: 6px 12px; border-radius: 8px; }
    
    .eligibility-box { padding: 12px 16px; border-radius: 8px; }
    .eligible-bg { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .not-eligible-bg { background: #fef2f2; border: 1px solid #fecaca; }
    .eligibility-header { display: flex; justify-content: space-between; align-items: center; }
    .match-score { font-size: 0.85rem; font-weight: 600; color: #475569; }
    .reason-list { list-style: none; font-size: 0.85rem; }
    
    .job-skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
    
    .job-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; }
    .deadline { font-size: 0.85rem; color: #64748b; }
    .btn-sm { padding: 8px 16px; font-size: 0.85rem; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class JobDrivesComponent implements OnInit {
  jobDrives: any[] = [];
  filteredDrives: any[] = [];
  searchQuery = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchJobDrives();
  }

  fetchJobDrives(): void {
    this.apiService.get<any>('jobs').subscribe(res => {
      if (res.success) {
        this.jobDrives = res.data || [];
        this.filteredDrives = [...this.jobDrives];
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredDrives = [...this.jobDrives];
      return;
    }

    this.filteredDrives = this.jobDrives.filter(d =>
      d.jobTitle.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      (d.requiredSkills || []).some((s: string) => s.toLowerCase().includes(q))
    );
  }
}
