import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <h2>Sign In to Placement Portal</h2>
          <p>Access student, recruiter, or admin dashboard</p>
        </div>

        <div *ngIf="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" formControlName="email" class="form-control" placeholder="user@campus.edu">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" formControlName="password" class="form-control" placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="btn btn-primary btn-block">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="demo-accounts">
          <p class="demo-title">🔑 Quick Demo Credentials (Click to autofill):</p>
          <div class="demo-buttons">
            <button type="button" (click)="fillDemo('alex@student.edu')" class="demo-chip">Student: Alex</button>
            <button type="button" (click)="fillDemo('recruiter@techcorp.com')" class="demo-chip">Recruiter: TechCorp</button>
            <button type="button" (click)="fillDemo('admin@campus.edu')" class="demo-chip">Admin</button>
          </div>
        </div>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Register here</a>
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
      max-width: 440px;
      padding: 36px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .auth-header h2 { font-size: 1.5rem; font-weight: 700; }
    .auth-header p { color: #64748b; font-size: 0.9rem; margin-top: 4px; }
    .form-group {
      margin-bottom: 20px;
    }
    label { display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 6px; }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }
    .form-control:focus { outline: none; border-color: #4f46e5; }
    .btn-block { width: 100%; padding: 12px; font-size: 1rem; }
    .error-alert {
      background: #fee2e2;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .demo-accounts {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .demo-title { font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 8px; }
    .demo-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
    .demo-chip {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .demo-chip:hover { background: #e2e8f0; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.9rem; color: #64748b; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillDemo(email: string): void {
    this.loginForm.patchValue({
      email,
      password: 'password123'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
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
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
