import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page card">
      <div class="page-header">
        <div>
          <h2>👩‍🎓 Student Management</h2>
          <p>View, filter, and manage all registered students</p>
        </div>
        <div class="filters">
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()"
                 placeholder="Search by name or department..." class="form-control search-box">
          <select [(ngModel)]="deptFilter" (ngModelChange)="filter()" class="form-control filter-select">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>
          <select [(ngModel)]="statusFilter" (ngModelChange)="filter()" class="form-control filter-select">
            <option value="">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Unplaced">Unplaced</option>
          </select>
        </div>
      </div>

      <!-- KPI Strip -->
      <div class="kpi-strip mt-3">
        <div class="kpi-item">
          <span class="kpi-num">{{ students.length }}</span>
          <span class="kpi-lbl">Total Students</span>
        </div>
        <div class="kpi-item placed">
          <span class="kpi-num">{{ placedCount }}</span>
          <span class="kpi-lbl">Placed</span>
        </div>
        <div class="kpi-item unplaced">
          <span class="kpi-num">{{ students.length - placedCount }}</span>
          <span class="kpi-lbl">Unplaced</span>
        </div>
        <div class="kpi-item rate">
          <span class="kpi-num">{{ placementRate }}%</span>
          <span class="kpi-lbl">Placement Rate</span>
        </div>
      </div>

      <!-- Students Table -->
      <div class="table-container mt-4">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Batch</th>
              <th>Skills</th>
              <th>Placement Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filteredStudents; let i = index">
              <td class="text-muted">{{ i + 1 }}</td>
              <td>
                <div class="student-name">
                  <div class="avatar-sm">{{ s.userId?.name?.charAt(0) || '?' }}</div>
                  <div>
                    <strong>{{ s.userId?.name }}</strong>
                    <div class="text-muted text-sm">{{ s.userId?.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ s.department }}</td>
              <td>
                <span class="cgpa-badge" [ngClass]="s.cgpa >= 8 ? 'cgpa-high' : s.cgpa >= 6 ? 'cgpa-mid' : 'cgpa-low'">
                  {{ s.cgpa }}
                </span>
              </td>
              <td>{{ s.graduationYear }}</td>
              <td>
                <div class="skill-tags">
                  <span *ngFor="let sk of (s.skills || []).slice(0, 3)" class="skill-pill">{{ sk }}</span>
                  <span *ngIf="(s.skills || []).length > 3" class="text-muted text-sm">+{{ s.skills.length - 3 }}</span>
                </div>
              </td>
              <td>
                <span class="badge" [ngClass]="s.placementStatus === 'Placed' ? 'badge-success' : 'badge-warning'">
                  {{ s.placementStatus || 'Unplaced' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredStudents.length === 0" class="empty-state mt-3">
          <div class="empty-icon">🔍</div>
          <p>No students match the current filters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1200px; margin: 24px auto; padding: 28px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .page-header h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 2px; }
    .page-header p { color: #64748b; font-size: 0.88rem; }
    .filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .search-box { width: 260px; padding: 9px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; }
    .filter-select { width: 160px; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; }

    .kpi-strip { display: flex; gap: 16px; flex-wrap: wrap; }
    .kpi-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 20px; min-width: 100px; }
    .kpi-item.placed { border-color: #a7f3d0; background: #ecfdf5; }
    .kpi-item.unplaced { border-color: #fde68a; background: #fffbeb; }
    .kpi-item.rate { border-color: #c7d2fe; background: #eef2ff; }
    .kpi-num { font-size: 1.75rem; font-weight: 800; color: #1e293b; display: block; }
    .kpi-lbl { font-size: 0.78rem; color: #64748b; font-weight: 500; }

    .student-name { display: flex; align-items: center; gap: 10px; }
    .avatar-sm {
      width: 36px; height: 36px; border-radius: 50%; background: #4f46e5; color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
    }
    .text-sm { font-size: 0.78rem; }
    .text-muted { color: #94a3b8; }

    .cgpa-badge { padding: 3px 8px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; }
    .cgpa-high { background: #d1fae5; color: #065f46; }
    .cgpa-mid  { background: #fef9c3; color: #92400e; }
    .cgpa-low  { background: #fee2e2; color: #991b1b; }

    .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .skill-pill { background: #e0e7ff; color: #4f46e5; font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: 500; }

    .empty-state { text-align: center; padding: 32px; color: #64748b; }
    .empty-icon { font-size: 2rem; margin-bottom: 6px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
  `]
})
export class AdminStudentsComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  search = '';
  deptFilter = '';
  statusFilter = '';

  departments = ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical Eng', 'Mechanical Eng'];

  get placedCount(): number {
    return this.students.filter(s => s.placementStatus === 'Placed').length;
  }

  get placementRate(): number {
    if (!this.students.length) return 0;
    return Math.round((this.placedCount / this.students.length) * 100);
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.get<any>('students').subscribe(res => {
      if (res.success) {
        this.students = res.data || [];
        this.filteredStudents = [...this.students];
      }
    });
  }

  filter(): void {
    this.filteredStudents = this.students.filter(s => {
      const matchSearch = !this.search ||
        s.userId?.name?.toLowerCase().includes(this.search.toLowerCase()) ||
        s.department?.toLowerCase().includes(this.search.toLowerCase());
      const matchDept = !this.deptFilter || s.department === this.deptFilter;
      const matchStatus = !this.statusFilter ||
        (this.statusFilter === 'Placed' ? s.placementStatus === 'Placed' : s.placementStatus !== 'Placed');
      return matchSearch && matchDept && matchStatus;
    });
  }
}
