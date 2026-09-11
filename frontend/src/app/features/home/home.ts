import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-section">
      <div class="hero-container">
        <div class="hero-badge">🚀 Next-Gen AI Campus Placement Platform</div>
        <h1 class="hero-title">Empowering Campus Placements with <span class="gradient-text">AI Automation</span></h1>
        <p class="hero-subtitle">
          Connect students, recruiters, and placement officers seamlessly. Automated eligibility screening, AI resume analysis, skill-gap matching, and mock interview prep.
        </p>
        <div class="hero-cta">
          <a routerLink="/register" class="btn btn-primary btn-lg">Get Started Free</a>
          <a routerLink="/jobs" class="btn btn-outline btn-lg">Explore Job Drives</a>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="section-container">
        <h2 class="section-title">Key Platform Capabilities</h2>
        <div class="features-grid">
          <div class="card feature-card">
            <div class="feature-icon">🤖</div>
            <h3>AI Resume Analyzer</h3>
            <p>Automatically extract skills, projects, and certifications from PDF resumes with instant AI feedback and improvement recommendations.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Automated Eligibility Engine</h3>
            <p>Smart verification checking CGPA thresholds, departments, graduation years, and skill matrix overlap in real-time.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">⏱️</div>
            <h3>Online MCQ Assessment System</h3>
            <p>Built-in secure test platform with countdown timer, auto-submission, anti-tamper answer protection, and instant score calculation.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">💬</div>
            <h3>AI Interview Prep & Evaluation</h3>
            <p>Generate role-specific technical, behavioral, and HR questions with interactive candidate answer feedback & score breakdown.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">📈</div>
            <h3>Placement Analytics</h3>
            <p>Comprehensive dashboard charts tracking department placement rates, company-wise hiring metrics, and top requested skills.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">👥</div>
            <h3>Multi-Role Ecosystem</h3>
            <p>Customized dashboards for Students, Recruiters, and Placement Officers with granular role-based authorization guards.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      padding: 80px 24px;
      text-align: center;
      background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
    }
    .hero-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .hero-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 999px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.2;
      color: #0f172a;
      margin-bottom: 20px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: #64748b;
      margin-bottom: 32px;
    }
    .hero-cta {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    .btn-lg {
      padding: 14px 28px;
      font-size: 1.05rem;
    }
    .features-section {
      padding: 80px 24px;
    }
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-title {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 48px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }
    .feature-card {
      padding: 32px;
    }
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .feature-card p {
      color: #64748b;
      font-size: 0.95rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
