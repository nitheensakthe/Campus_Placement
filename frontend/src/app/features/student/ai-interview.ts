import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-ai-interview-prep',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-interview-page card">
      <div class="header">
        <h2>🤖 AI Mock Interview Practice & Answer Evaluator</h2>
        <p>Select your tech stack and experience level to generate dynamic interview questions and get real-time AI scoring.</p>
      </div>

      <!-- Setup Control Wizard -->
      <div class="setup-grid mt-4">
        <div class="form-group">
          <label>Target Job Role</label>
          <input type="text" [(ngModel)]="role" class="form-control" placeholder="Full Stack Developer">
        </div>

        <div class="form-group">
          <label>Experience Level</label>
          <select [(ngModel)]="experienceLevel" class="form-control">
            <option value="Fresher">Fresher / Graduate</option>
            <option value="1-2 Years">1-2 Years Experience</option>
            <option value="3+ Years">Senior / Experienced</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tech Stack</label>
          <input type="text" [(ngModel)]="stack" class="form-control" placeholder="MEAN / MERN / Python">
        </div>
      </div>

      <button (click)="generateQuestions()" [disabled]="loadingQuestions" class="btn btn-primary mt-2">
        {{ loadingQuestions ? 'Generating Questions...' : '✨ Generate AI Questions' }}
      </button>

      <!-- Questions List & Practice Board -->
      <div *ngIf="questions.length > 0" class="questions-board mt-5">
        <h3>Generated Mock Interview Questions</h3>

        <div *ngFor="let q of questions; let i = index" class="card question-item mt-3">
          <div class="q-header">
            <span class="badge badge-info">{{ q.category }}</span>
            <span class="q-num">Question {{ i + 1 }}</span>
          </div>

          <h4 class="q-title mt-2">{{ q.question }}</h4>

          <div class="answer-box mt-3">
            <label>Type Your Proposed Answer:</label>
            <textarea [(ngModel)]="userAnswers[q.id]" rows="4" class="form-control mt-1" placeholder="Write your structured response using technical examples..."></textarea>
            <button (click)="evaluateAnswer(q)" [disabled]="evaluating[q.id] || !userAnswers[q.id]" class="btn btn-outline btn-sm mt-2">
              {{ evaluating[q.id] ? 'Evaluating Answer...' : '⚡ Submit Answer to AI Evaluator' }}
            </button>
          </div>

          <!-- Evaluation Feedback Result -->
          <div *ngIf="evalResults[q.id]" class="evaluation-result card mt-3">
            <div class="scores-row">
              <div class="score-chip">
                <span class="score-val">{{ evalResults[q.id].overallScore }}/100</span>
                <span class="score-lbl">Overall Fit</span>
              </div>
              <div class="sub-scores">
                <span>Technical Knowledge: <strong>{{ evalResults[q.id].technicalScore }}/100</strong></span>
                <span>Communication Clarity: <strong>{{ evalResults[q.id].communicationScore }}/100</strong></span>
                <span>Completeness: <strong>{{ evalResults[q.id].completenessScore }}/100</strong></span>
              </div>
            </div>

            <div class="feedback-text mt-2">
              <p><strong>AI Analysis:</strong> {{ evalResults[q.id].feedback }}</p>
              <ul class="suggestions mt-1">
                <li *ngFor="let sug of evalResults[q.id].improvementSuggestions">💡 {{ sug }}</li>
              </ul>
              <p class="disclaimer mt-2">⚠️ Note: AI-generated evaluation is advisory and provided for practice purposes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-interview-page { max-width: 950px; margin: 24px auto; padding: 32px; }
    .setup-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; }
    
    .question-item { background: #f8fafc; }
    .q-header { display: flex; justify-content: space-between; align-items: center; }
    .q-num { font-size: 0.85rem; color: #64748b; font-weight: 600; }
    .q-title { font-size: 1.05rem; font-weight: 600; color: #0f172a; }
    
    .evaluation-result { background: #f0f9ff; border: 1px solid #bae6fd; }
    .scores-row { display: flex; gap: 20px; align-items: center; border-bottom: 1px solid #e0f2fe; padding-bottom: 12px; }
    .score-chip { text-align: center; background: #0284c7; color: white; padding: 8px 16px; border-radius: 12px; }
    .score-val { font-size: 1.5rem; font-weight: 800; display: block; }
    .score-lbl { font-size: 0.75rem; text-transform: uppercase; }
    .sub-scores { display: flex; flex-direction: column; font-size: 0.85rem; color: #0369a1; }
    
    .disclaimer { font-size: 0.75rem; color: #64748b; font-style: italic; }
    .suggestions { list-style: none; font-size: 0.85rem; color: #0f172a; }
    .btn-sm { padding: 6px 14px; font-size: 0.85rem; }
    .mt-5 { margin-top: 32px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
    .mt-1 { margin-top: 4px; }
  `]
})
export class AiInterviewPrepComponent {
  role = 'Full Stack Developer';
  experienceLevel = 'Fresher';
  stack = 'MEAN';

  loadingQuestions = false;
  questions: any[] = [];

  userAnswers: { [qId: number]: string } = {};
  evaluating: { [qId: number]: boolean } = {};
  evalResults: { [qId: number]: any } = {};

  constructor(private apiService: ApiService) {}

  generateQuestions(): void {
    this.loadingQuestions = true;
    this.apiService.post<any>('ai/interview/questions', {
      role: this.role,
      experienceLevel: this.experienceLevel,
      stack: this.stack
    }).subscribe({
      next: (res) => {
        this.loadingQuestions = false;
        if (res.success) {
          this.questions = res.data.questions || [];
        }
      },
      error: () => {
        this.loadingQuestions = false;
      }
    });
  }

  evaluateAnswer(q: any): void {
    const answerText = this.userAnswers[q.id];
    if (!answerText) return;

    this.evaluating[q.id] = true;
    this.apiService.post<any>('ai/interview/evaluate', {
      question: q.question,
      answer: answerText
    }).subscribe({
      next: (res) => {
        this.evaluating[q.id] = false;
        if (res.success) {
          this.evalResults[q.id] = res.data;
        }
      },
      error: () => {
        this.evaluating[q.id] = false;
      }
    });
  }
}
