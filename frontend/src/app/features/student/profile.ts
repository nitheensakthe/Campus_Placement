import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService, Student } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-page card">
      <div class="profile-header">
        <div class="avatar-large">{{ userName.charAt(0) }}</div>
        <div class="profile-meta">
          <h2>{{ userName }}</h2>
          <p class="dept-info">{{ student?.department }} • CGPA: {{ student?.cgpa }} • Batch of {{ student?.graduationYear }}</p>
          <span class="badge" [ngClass]="student?.placementStatus === 'Placed' ? 'badge-success' : 'badge-warning'">
            {{ student?.placementStatus || 'Unplaced' }}
          </span>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <form [formGroup]="profileForm" (ngSubmit)="onSave()" class="profile-form mt-4">
        <div class="form-section">
          <h3>📋 Academic Information</h3>
          <div class="form-row mt-2">
            <div class="form-group col">
              <label>Department</label>
              <select formControlName="department" class="form-control">
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Electrical Eng">Electrical Eng</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
              </select>
            </div>
            <div class="form-group col">
              <label>CGPA (Out of 10)</label>
              <input type="number" step="0.1" min="0" max="10" formControlName="cgpa" class="form-control">
            </div>
            <div class="form-group col">
              <label>Graduation Year</label>
              <input type="number" formControlName="graduationYear" class="form-control">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label>Register Number</label>
              <input type="text" formControlName="registerNumber" class="form-control" placeholder="CS2026-001">
            </div>
            <div class="form-group col">
              <label>Phone Number</label>
              <input type="text" formControlName="phone" class="form-control" placeholder="+91-9876543210">
            </div>
          </div>
        </div>

        <div class="form-section mt-4">
          <h3>🛠️ Technical Skills</h3>
          <p class="help-text">Enter skills separated by commas</p>
          <input type="text" formControlName="skills" class="form-control mt-2" placeholder="JavaScript, Node.js, Angular, MongoDB, Docker, Git...">
          <div class="skills-preview mt-2">
            <span *ngFor="let s of previewSkills" class="badge badge-info skill-chip">{{ s }}</span>
          </div>
        </div>

        <button type="submit" [disabled]="loading" class="btn btn-primary btn-block mt-4">
          {{ loading ? 'Saving Profile...' : '💾 Save Profile Changes' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 900px; margin: 24px auto; padding: 32px; }
    .profile-header { display: flex; gap: 20px; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
    .avatar-large {
      width: 64px; height: 64px; border-radius: 50%; background: #4f46e5; color: white;
      display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800;
    }
    .dept-info { color: #64748b; font-size: 0.95rem; margin: 4px 0 8px; }

    .form-section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .form-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
    .help-text { font-size: 0.85rem; color: #64748b; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; }
    .form-row { display: flex; gap: 16px; }
    .col { flex: 1; }

    .skills-preview { display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; }
    .skill-chip { font-size: 0.8rem; padding: 4px 10px; }

    .alert { padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-danger { background: #fee2e2; color: #991b1b; }
    .btn-block { width: 100%; padding: 12px; font-size: 1rem; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class StudentProfileComponent implements OnInit {
  profileForm: FormGroup;
  student: Student | null = null;
  userName = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  get previewSkills(): string[] {
    const raw = this.profileForm.get('skills')?.value || '';
    return raw.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      department: ['Computer Science'],
      cgpa: [8.0],
      graduationYear: [2026],
      registerNumber: [''],
      phone: [''],
      skills: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userName = user?.name || 'Student';
    this.student = this.authService.getStudent();

    if (this.student) {
      this.profileForm.patchValue({
        department: this.student.department,
        cgpa: this.student.cgpa,
        graduationYear: this.student.graduationYear,
        skills: (this.student.skills || []).join(', ')
      });
    }

    // Fetch fresh data from API
    this.apiService.get<any>('students/profile').subscribe(res => {
      if (res.success && res.data) {
        const s = res.data;
        this.profileForm.patchValue({
          department: s.department,
          cgpa: s.cgpa,
          graduationYear: s.graduationYear,
          registerNumber: s.registerNumber || '',
          phone: s.phone || '',
          skills: (s.skills || []).join(', ')
        });
      }
    });
  }

  onSave(): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formVal = this.profileForm.value;
    const payload = {
      ...formVal,
      skills: formVal.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    };

    this.apiService.put<any>('students/profile', payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to save profile.';
      }
    });
  }
}
