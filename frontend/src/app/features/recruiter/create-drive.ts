import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-create-job-drive',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="create-drive-page card">
      <h2>➕ Post New Placement Job Drive</h2>
      <p>Configure drive specifications, salary package, minimum CGPA & eligible department constraints</p>

      <div *ngIf="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>

      <form [formGroup]="driveForm" (ngSubmit)="onSubmit()" class="mt-4">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" formControlName="jobTitle" class="form-control" placeholder="Software Engineer / AI Engineer">
        </div>

        <div class="form-group">
          <label>Job Description</label>
          <textarea formControlName="description" rows="4" class="form-control" placeholder="Detailed role responsibilities and requirements..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Salary Package (LPA)</label>
            <input type="text" formControlName="salary" class="form-control" placeholder="12 LPA">
          </div>
          <div class="form-group col">
            <label>Location</label>
            <input type="text" formControlName="location" class="form-control" placeholder="Bangalore / Remote">
          </div>
        </div>

        <div class="form-group">
          <label>Required Technical Skills (Comma separated)</label>
          <input type="text" formControlName="requiredSkills" class="form-control" placeholder="JavaScript, Node.js, Angular, MongoDB, Git">
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Minimum CGPA Cutoff</label>
            <input type="number" step="0.1" formControlName="minimumCGPA" class="form-control" placeholder="7.5">
          </div>
          <div class="form-group col">
            <label>Eligible Departments (Comma separated)</label>
            <input type="text" formControlName="eligibleDepartments" class="form-control" placeholder="Computer Science, Information Technology">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Application Deadline</label>
            <input type="date" formControlName="applicationDeadline" class="form-control">
          </div>
          <div class="form-group col">
            <label>Placement Drive Date</label>
            <input type="date" formControlName="driveDate" class="form-control">
          </div>
        </div>

        <button type="submit" [disabled]="driveForm.invalid || loading" class="btn btn-primary btn-block mt-3">
          {{ loading ? 'Publishing Job Drive...' : 'Publish Job Drive' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .create-drive-page { max-width: 800px; margin: 24px auto; padding: 32px; }
    .form-group { margin-bottom: 18px; }
    .form-row { display: flex; gap: 16px; }
    .col { flex: 1; }
    label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; }
    .btn-block { width: 100%; padding: 12px; font-size: 1rem; }
    .alert-danger { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
  `]
})
export class CreateJobDriveComponent {
  driveForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.driveForm = this.fb.group({
      jobTitle: ['', Validators.required],
      description: ['', Validators.required],
      salary: ['12 LPA', Validators.required],
      location: ['Bangalore / Hybrid', Validators.required],
      requiredSkills: ['JavaScript, Node.js, Angular, MongoDB, Git', Validators.required],
      minimumCGPA: [7.5, Validators.required],
      eligibleDepartments: ['Computer Science, Information Technology'],
      applicationDeadline: ['2026-09-30', Validators.required],
      driveDate: ['2026-10-05', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.driveForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.apiService.post<any>('jobs', this.driveForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/recruiter/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to create job drive.';
      }
    });
  }
}
