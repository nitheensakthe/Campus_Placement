import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-resume',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resume-page card">
      <div class="header">
        <h2>📄 My Resume & AI Analysis</h2>
        <p>Upload your PDF resume to generate automatic AI skill extraction and resume scoring.</p>
      </div>

      <div class="upload-area" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)">
        <div class="upload-box">
          <span class="upload-icon">📤</span>
          <p>Drag & Drop your PDF resume here, or <strong>browse file</strong></p>
          <input type="file" (change)="onFileSelected($event)" accept="application/pdf" class="file-input">
        </div>
      </div>

      <div *ngIf="uploadSuccess" class="alert alert-success">
        {{ uploadSuccess }}
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <!-- AI Analysis Results Display -->
      <div *ngIf="aiAnalysis" class="analysis-results mt-4">
        <div class="score-banner card">
          <div class="score-info">
            <span class="score-num">{{ aiAnalysis.overallResumeScore }}/100</span>
            <span class="score-label">AI Resume Impact Score</span>
          </div>
          <div class="grade-info">
            <span class="badge badge-success">Grade {{ aiAnalysis.readabilityGrade }}</span>
          </div>
        </div>

        <div class="analysis-grid">
          <!-- Detected Skills Card -->
          <div class="card">
            <h3>🛠️ Extracted Skills Matrix</h3>
            <div class="skills-tags mt-2">
              <span *ngFor="let skill of aiAnalysis.skills" class="badge badge-info skill-chip">{{ skill }}</span>
            </div>
          </div>

          <!-- Strengths Card -->
          <div class="card">
            <h3>💪 Core Resume Strengths</h3>
            <ul class="strength-list mt-2">
              <li *ngFor="let item of aiAnalysis.strengths">✅ {{ item }}</li>
            </ul>
          </div>

          <!-- Improvement Suggestions Card -->
          <div class="card">
            <h3>💡 AI Improvement Recommendations</h3>
            <ul class="improvement-list mt-2">
              <li *ngFor="let item of aiAnalysis.improvements">📌 {{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resume-page { max-width: 1000px; margin: 24px auto; padding: 32px; }
    .upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      margin: 24px 0;
      position: relative;
      background: #f8fafc;
      transition: background 0.2s;
    }
    .upload-area:hover { background: #f1f5f9; border-color: #4f46e5; }
    .upload-icon { font-size: 3rem; margin-bottom: 12px; display: block; }
    .file-input {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    .alert { padding: 12px 16px; border-radius: 8px; margin-top: 16px; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-danger { background: #fee2e2; color: #991b1b; }
    
    .score-banner {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 32px;
      margin-bottom: 24px;
    }
    .score-num { font-size: 2.25rem; font-weight: 800; display: block; }
    .score-label { font-size: 0.9rem; color: #e0f2fe; }
    
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .skills-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip { font-size: 0.85rem; padding: 6px 12px; }
    .strength-list, .improvement-list { list-style: none; font-size: 0.9rem; }
    .strength-list li, .improvement-list li { margin-bottom: 8px; color: #334155; }
    .mt-4 { margin-top: 24px; }
    .mt-2 { margin-top: 12px; }
  `]
})
export class StudentResumeComponent implements OnInit {
  selectedFile: File | null = null;
  uploadSuccess = '';
  errorMessage = '';
  aiAnalysis: any = null;

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.runAiAnalysis();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  uploadFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Please upload a PDF file only!';
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    this.apiService.upload<any>('students/resume', formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.uploadSuccess = 'Resume uploaded & scanned successfully!';
          this.errorMessage = '';
          this.runAiAnalysis();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to upload resume';
      }
    });
  }

  runAiAnalysis(): void {
    this.apiService.post<any>('ai/resume-analyzer', {}).subscribe({
      next: (res) => {
        if (res.success) {
          this.aiAnalysis = res.data;
        }
      }
    });
  }
}
