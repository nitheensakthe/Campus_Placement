import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <h2>Create Platform Account</h2>
          <p>Register as a Student, Recruiter, or Admin</p>
        </div>

        <div *ngIf="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>I am registering as a:</label>
            <select formControlName="role" class="form-control">
              <option value="student">Student</option>
              <option value="recruiter">Recruiter / Employer</option>
              <option value="admin">Placement Officer / Admin</option>
            </select>
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input type="text" formControlName="name" class="form-control" placeholder="Alex Johnson">
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" formControlName="email" class="form-control" placeholder="alex@campus.edu">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="At least 6 characters">
          </div>

          <!-- Student specific fields -->
          <ng-container *ngIf="registerForm.value.role === 'student'">
            <div class="form-row">
              <div class="form-group col">
                <label>Department</label>
                <select formControlName="department" class="form-control">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Electrical Eng">Electrical Eng</option>
                </select>
              </div>
              <div class="form-group col">
                <label>CGPA</label>
                <input type="number" step="0.1" min="0" max="10" formControlName="cgpa" class="form-control" placeholder="8.5">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>Graduation Year</label>
                <input type="number" formControlName="graduationYear" class="form-control" placeholder="2026">
              </div>
              <div class="form-group col">
                <label>Register No.</label>
                <input type="text" formControlName="registerNumber" class="form-control" placeholder="REG-101">
              </div>
            </div>
          </ng-container>

          <!-- Recruiter specific fields -->
          <ng-container *ngIf="registerForm.value.role === 'recruiter'">
            <div class="form-group">
              <label>Company Name</label>
              <input type="text" formControlName="companyName" class="form-control" placeholder="TechCorp Solutions">
            </div>
          </ng-container>

          <button type="submit" [disabled]="registerForm.invalid || loading" class="btn btn-primary btn-block">
            {{ loading ? 'Creating Account...' : 'Register Account' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 36px;
    }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-header h2 { font-size: 1.5rem; font-weight: 700; }
    .auth-header p { color: #64748b; font-size: 0.9rem; margin-top: 4px; }
    .form-group { margin-bottom: 18px; }
    .form-row { display: flex; gap: 12px; }
    .col { flex: 1; }
    label { display: block; font-weight: 500; font-size: 0.85rem; margin-bottom: 6px; }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .btn-block { width: 100%; padding: 12px; margin-top: 10px; }
    .error-alert {
      background: #fee2e2;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.9rem; color: #64748b; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      role: ['student', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: ['Computer Science'],
      cgpa: [8.0],
      graduationYear: [2026],
      registerNumber: [''],
      companyName: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const role = res.data.user.role;
          if (role === 'student') this.router.navigate(['/student/dashboard']);
          else if (role === 'recruiter') this.router.navigate(['/recruiter/dashboard']);
          else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
