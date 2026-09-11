import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-analytics-page">
      <div class="header-banner card">
        <div>
          <h2>📈 Placement Officer & Admin Analytics Dashboard</h2>
          <p>Real-time MongoDB aggregation metrics, department statistics, company hiring & skill demand trends</p>
        </div>
        <span class="badge badge-success live-badge">Live System Metrics</span>
      </div>

      <!-- KPI Overview Cards -->
      <div class="kpi-grid mt-4" *ngIf="kpi">
        <div class="card kpi-card">
          <span class="kpi-title">Total Registered Students</span>
          <span class="kpi-value">{{ kpi.totalStudents }}</span>
          <span class="kpi-sub">Placed: {{ kpi.placedStudentsCount }} | Unplaced: {{ kpi.unplacedStudentsCount }}</span>
        </div>

        <div class="card kpi-card">
          <span class="kpi-title">Overall Placement Rate</span>
          <span class="kpi-value text-emerald">{{ kpi.placementRate }}%</span>
          <span class="kpi-sub">Target: 90%+</span>
        </div>

        <div class="card kpi-card">
          <span class="kpi-title">Highest Salary Package</span>
          <span class="kpi-value text-indigo">{{ kpi.highestPackage }}</span>
          <span class="kpi-sub">Average: {{ kpi.averagePackage }}</span>
        </div>

        <div class="card kpi-card">
          <span class="kpi-title">Active Companies & Drives</span>
          <span class="kpi-value">{{ kpi.totalCompanies }} Companies</span>
          <span class="kpi-sub">{{ kpi.totalJobDrives }} Job Drives Posted</span>
        </div>
      </div>

      <!-- Analytics Charts & Statistics Section -->
      <div class="analytics-grid mt-5" *ngIf="charts">
        <!-- Department Placement Rate -->
        <div class="card chart-card">
          <h3>📊 Department-Wise Placement Rate</h3>
          <div class="bar-chart mt-3">
            <div *ngFor="let d of charts.departmentPlacement" class="bar-row">
              <div class="bar-label">{{ d.department }}</div>
              <div class="bar-track">
                <div class="bar-fill bg-indigo" [style.width.%]="(d.placed / (d.total || 1)) * 100"></div>
              </div>
              <div class="bar-val">{{ d.placed }}/{{ d.total }} ({{ getPercent(d.placed, d.total) }}%)</div>
            </div>
          </div>
        </div>

        <!-- Top Requested Skills -->
        <div class="card chart-card">
          <h3>🔥 Top Recruiter Skill Demand</h3>
          <div class="skill-demand-list mt-3">
            <div *ngFor="let sk of charts.skillDemand" class="skill-row">
              <span class="skill-name">{{ sk.skill | titlecase }}</span>
              <div class="skill-bar-track">
                <div class="skill-bar-fill bg-sky" [style.width.%]="sk.count * 15"></div>
              </div>
              <span class="skill-count">{{ sk.count }} Job Requirements</span>
            </div>
          </div>
        </div>

        <!-- Application Workflow Status Distribution -->
        <div class="card chart-card">
          <h3>🔄 Application Pipeline Status Breakdown</h3>
          <div class="status-list mt-3">
            <div *ngFor="let st of charts.applicationStatus" class="status-row">
              <span class="status-name">{{ st.status }}</span>
              <span class="badge badge-info">{{ st.count }} Candidates</span>
            </div>
          </div>
        </div>

        <!-- Company Hiring Statistics -->
        <div class="card chart-card">
          <h3>🏢 Hiring Partner Engagement</h3>
          <div class="table-container mt-3">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Drives Hosted</th>
                  <th>Total Applicants</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of charts.companyHiring">
                  <td><strong>{{ c.company }}</strong></td>
                  <td>{{ c.totalDrives }}</td>
                  <td><span class="badge badge-success">{{ c.totalApplicants }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-analytics-page { max-width: 1200px; margin: 24px auto; padding: 0 20px; }
    .header-banner { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: white; }
    .header-banner p { color: #94a3b8; margin-top: 4px; }
    .live-badge { padding: 6px 14px; font-size: 0.85rem; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .kpi-card { padding: 20px; }
    .kpi-title { font-size: 0.85rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .kpi-value { font-size: 2rem; font-weight: 800; display: block; margin: 6px 0; color: #0f172a; }
    .text-emerald { color: #059669; }
    .text-indigo { color: #4f46e5; }
    .kpi-sub { font-size: 0.8rem; color: #64748b; }
    
    .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(520px, 1fr)); gap: 24px; }
    .chart-card { padding: 24px; }
    
    .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; font-size: 0.85rem; }
    .bar-label { width: 140px; font-weight: 600; color: #334155; }
    .bar-track { flex: 1; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 6px; }
    .bg-indigo { background: #4f46e5; }
    .bg-sky { background: #0ea5e9; }
    .bar-val { font-weight: 600; color: #475569; width: 110px; text-align: right; }
    
    .skill-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 0.85rem; }
    .skill-name { width: 110px; font-weight: 600; }
    .skill-bar-track { flex: 1; height: 10px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
    .skill-bar-fill { height: 100%; }
    .skill-count { font-size: 0.8rem; color: #64748b; width: 130px; text-align: right; }
    
    .status-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
    .status-name { font-weight: 600; color: #334155; }
    
    .mt-5 { margin-top: 32px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  kpi: any = null;
  charts: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics(): void {
    this.apiService.get<any>('analytics').subscribe(res => {
      if (res.success) {
        this.kpi = res.data.kpi;
        this.charts = res.data.charts;
      }
    });
  }

  getPercent(placed: number, total: number): number {
    if (!total) return 0;
    return Math.round((placed / total) * 100);
  }
}
