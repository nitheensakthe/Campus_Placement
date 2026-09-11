import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="job-details-page card" *ngIf="jobDrive">
      <div class="header">
        <div class="company-brand">
          <h2>{{ jobDrive.jobTitle }}</h2>
          <p class="company-sub">🏢 {{ jobDrive.companyId?.name }} • 📍 {{ jobDrive.location }}</p>
        </div>
        <div class="salary-box">{{ jobDrive.salary }}</div>
      </div>

      <div *ngIf="successMessage" class="alert alert-success mt-3">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>

      <!-- Eligibility Breakdown Card -->
      <div class="eligibility-banner mt-4" *ngIf="jobDrive.eligibility">
        <h3>Backend Automated Eligibility Report</h3>
        <div class="status-row mt-2">
          <span class="badge" [ngClass]="jobDrive.eligibility.isEligible ? 'badge-success' : 'badge-danger'">
            {{ jobDrive.eligibility.isEligible ? 'Passed Eligibility Screening' : 'Eligibility Issues Found' }}
          </span>
        </div>
        <ul class="reasons mt-2">
          <li *ngFor="let r of jobDrive.eligibility.reasons">👉 {{ r }}</li>
        </ul>
      </div>

      <div class="section mt-4">
        <h3>Job Description</h3>
        <p class="desc">{{ jobDrive.description }}</p>
      </div>

      <div class="section mt-4">
        <h3>Required Technical Skills</h3>
        <div class="skills-list mt-2">
          <span *ngFor="let s of jobDrive.requiredSkills" class="badge badge-info skill-chip">{{ s }}</span>
        </div>
      </div>

      <div class="section mt-4">
        <h3>Eligibility Criteria Thresholds</h3>
        <ul class="criteria-list">
          <li><strong>Minimum Academic CGPA:</strong> {{ jobDrive.minimumCGPA }}</li>
          <li><strong>Eligible Departments:</strong> {{ jobDrive.eligibleDepartments?.join(', ') }}</li>
          <li><strong>Graduation Batches:</strong> {{ jobDrive.eligibleGraduationYears?.join(', ') }}</li>
        </ul>
      </div>

      <div class="action-footer mt-5">
        <button (click)="apply()" [disabled]="applying || (jobDrive.eligibility && !jobDrive.eligibility.isEligible)" class="btn btn-primary btn-lg">
          {{ applying ? 'Submitting Application...' : 'Apply for this Job Drive' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .job-details-page { max-width: 900px; margin: 24px auto; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
    .company-sub { color: #64748b; font-size: 1rem; margin-top: 4px; }
    .salary-box { font-size: 1.5rem; font-weight: 800; color: #059669; background: #ecfdf5; padding: 8px 16px; border-radius: 8px; }
    
    .eligibility-banner { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; }
    .reasons { list-style: none; font-size: 0.9rem; color: #334155; }
    
    .desc { font-size: 1rem; color: #475569; line-height: 1.6; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip { font-size: 0.9rem; padding: 6px 14px; }
    .criteria-list { list-style: disc; margin-left: 20px; color: #475569; }
    
    .alert { padding: 12px 16px; border-radius: 8px; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-danger { background: #fee2e2; color: #991b1b; }
    
    .action-footer { display: flex; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .btn-lg { padding: 12px 28px; font-size: 1rem; }
    .mt-5 { margin-top: 32px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class JobDetailsComponent implements OnInit {
  jobDrive: any = null;
  applying = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchJobDrive(id);
    }
  }

  fetchJobDrive(id: string): void {
    this.apiService.get<any>(`jobs/${id}`).subscribe(res => {
      if (res.success) {
        this.jobDrive = res.data;
      }
    });
  }

  apply(): void {
    if (!this.jobDrive) return;

    this.applying = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.apiService.post<any>('applications', { jobDriveId: this.jobDrive._id }).subscribe({
      next: (res) => {
        this.applying = false;
        if (res.success) {
          this.successMessage = 'Application submitted successfully! Redirecting to applications board...';
          setTimeout(() => this.router.navigate(['/student/applications']), 1500);
        }
      },
      error: (err) => {
        this.applying = false;
        this.errorMessage = err.error?.message || 'Failed to submit application.';
      }
    });
  }
}
