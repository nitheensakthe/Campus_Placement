import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-page card">
      <div class="page-header">
        <div>
          <h2>🏢 Company Management</h2>
          <p>Register and manage partner companies for campus placements</p>
        </div>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? '✕ Cancel' : '+ Add Company' }}
        </button>
      </div>

      <!-- Add Company Form -->
      <div *ngIf="showForm" class="form-card mt-3">
        <h3>Register New Company</h3>
        <form [formGroup]="companyForm" (ngSubmit)="onSubmit()" class="mt-3">
          <div class="form-row">
            <div class="form-group col">
              <label>Company Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="TechCorp India Pvt Ltd">
            </div>
            <div class="form-group col">
              <label>Industry</label>
              <select formControlName="industry" class="form-control">
                <option value="Information Technology">Information Technology</option>
                <option value="Banking & Finance">Banking & Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consulting">Consulting</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label>Website URL</label>
              <input type="url" formControlName="website" class="form-control" placeholder="https://company.com">
            </div>
            <div class="form-group col">
              <label>HR Contact Email</label>
              <input type="email" formControlName="email" class="form-control" placeholder="hr@company.com">
            </div>
          </div>

          <div class="form-group">
            <label>Company Description</label>
            <textarea formControlName="description" class="form-control" rows="3"
              placeholder="Brief about the company, its products, and culture..."></textarea>
          </div>

          <div *ngIf="successMsg" class="alert alert-success mt-2">{{ successMsg }}</div>
          <div *ngIf="errorMsg" class="alert alert-danger mt-2">{{ errorMsg }}</div>
          <button type="submit" [disabled]="loading" class="btn btn-primary mt-3">
            {{ loading ? 'Registering...' : '✓ Register Company' }}
          </button>
        </form>
      </div>

      <!-- Companies Grid -->
      <div class="companies-grid mt-4">
        <div *ngFor="let c of companies" class="company-card">
          <div class="company-logo">{{ c.name.charAt(0) }}</div>
          <div class="company-info">
            <h4>{{ c.name }}</h4>
            <p class="company-industry">{{ c.industry }}</p>
            <p class="company-desc">{{ c.description || 'No description available.' }}</p>
            <div class="company-meta">
              <a *ngIf="c.website" [href]="c.website" target="_blank" class="link-sm">🌐 Website</a>
              <a *ngIf="c.email" [href]="'mailto:' + c.email" class="link-sm">📧 HR Contact</a>
              <span class="drives-badge">{{ c.drivesCount || 0 }} Drives</span>
            </div>
          </div>
        </div>

        <div *ngIf="companies.length === 0" class="empty-state">
          <div class="empty-icon">🏢</div>
          <p>No companies registered yet. Add your first partner company!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1200px; margin: 24px auto; padding: 28px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 2px; }
    .page-header p { color: #64748b; font-size: 0.88rem; }

    .form-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .form-card h3 { font-size: 1rem; font-weight: 700; }
    .form-row { display: flex; gap: 16px; }
    .col { flex: 1; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; }
    textarea.form-control { resize: vertical; }

    .companies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
    .company-card {
      border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
      display: flex; gap: 16px; transition: box-shadow 0.2s;
    }
    .company-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .company-logo {
      width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 800; flex-shrink: 0;
    }
    .company-info { flex: 1; min-width: 0; }
    .company-info h4 { font-size: 1rem; font-weight: 700; margin-bottom: 2px; }
    .company-industry { font-size: 0.8rem; color: #4f46e5; font-weight: 600; margin-bottom: 6px; }
    .company-desc { font-size: 0.82rem; color: #64748b; margin-bottom: 10px; line-height: 1.4;
      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .company-meta { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .link-sm { color: #4f46e5; font-size: 0.8rem; text-decoration: none; font-weight: 500; }
    .link-sm:hover { text-decoration: underline; }
    .drives-badge { background: #e0e7ff; color: #4f46e5; font-size: 0.75rem; padding: 2px 8px; border-radius: 20px; font-weight: 600; }

    .alert { padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-danger { background: #fee2e2; color: #991b1b; }
    .empty-state { grid-column: 1/-1; text-align: center; padding: 48px; color: #64748b; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 8px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  companies: any[] = [];
  showForm = false;
  loading = false;
  successMsg = '';
  errorMsg = '';
  companyForm: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      name: [''],
      industry: ['Information Technology'],
      website: [''],
      email: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.apiService.get<any>('companies').subscribe(res => {
      if (res.success) this.companies = res.data || [];
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.apiService.post<any>('companies', this.companyForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMsg = 'Company registered successfully!';
          this.companyForm.reset({ industry: 'Information Technology' });
          this.showForm = false;
          this.loadCompanies();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to register company.';
      }
    });
  }
}
