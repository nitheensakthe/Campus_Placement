import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-online-test',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="test-container card" *ngIf="assessment && !submitted">
      <div class="test-header">
        <div>
          <h2>{{ assessment.title }}</h2>
          <p>{{ assessment.description }}</p>
        </div>
        <div class="timer-box" [class.warning-timer]="timeLeft <= 60">
          <span class="timer-label">Time Remaining</span>
          <span class="timer-val">⏱️ {{ formatTime(timeLeft) }}</span>
        </div>
      </div>

      <div class="question-tracker mt-3">
        <span *ngFor="let q of questions; let i = index"
              class="q-chip"
              [class.active]="currentQuestionIndex === i"
              [class.answered]="userAnswers[q._id]"
              (click)="jumpToQuestion(i)">
          {{ i + 1 }}
        </span>
      </div>

      <!-- Current Question Card -->
      <div class="card question-card mt-4" *ngIf="currentQuestion">
        <div class="q-number">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }} ({{ currentQuestion.marks }} mark)</div>
        <h3 class="q-text mt-2">{{ currentQuestion.question }}</h3>

        <div class="options-group mt-3">
          <label *ngFor="let opt of currentQuestion.options" class="option-label" [class.selected]="userAnswers[currentQuestion._id] === opt">
            <input type="radio"
                   [name]="'q_' + currentQuestion._id"
                   [value]="opt"
                   [(ngModel)]="userAnswers[currentQuestion._id]">
            <span>{{ opt }}</span>
          </label>
        </div>
      </div>

      <!-- Navigation & Submit Controls -->
      <div class="test-footer mt-4">
        <button (click)="prevQuestion()" [disabled]="currentQuestionIndex === 0" class="btn btn-outline">Previous</button>

        <div class="right-actions">
          <button (click)="nextQuestion()" *ngIf="currentQuestionIndex < questions.length - 1" class="btn btn-primary">Next Question</button>
          <button (click)="submitTest()" *ngIf="currentQuestionIndex === questions.length - 1" class="btn btn-success">Submit Test</button>
        </div>
      </div>
    </div>

    <!-- Test Result Summary Screen -->
    <div class="test-container card" *ngIf="submitted && testResult">
      <div class="result-header text-center">
        <h2>🎉 Assessment Submitted Successfully!</h2>
        <p>Your performance report has been compiled and saved.</p>
      </div>

      <div class="score-card card mt-4 text-center">
        <div class="percentage-circle">
          {{ testResult.percentage }}%
        </div>
        <h3>Score: {{ testResult.score }} Marks</h3>
        <p class="summary-text mt-2">Correct Answers: {{ testResult.correctAnswers }} | Wrong Answers: {{ testResult.wrongAnswers }}</p>
        <p class="time-text">Time Taken: {{ testResult.timeTaken }} seconds</p>
      </div>

      <div class="text-center mt-4">
        <a routerLink="/student/dashboard" class="btn btn-primary">Return to Student Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .test-container { max-width: 850px; margin: 24px auto; padding: 32px; }
    .test-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
    .timer-box { text-align: right; background: #f1f5f9; padding: 8px 16px; border-radius: 8px; }
    .warning-timer { background: #fee2e2; color: #991b1b; }
    .timer-label { font-size: 0.75rem; display: block; color: #64748b; font-weight: 600; }
    .timer-val { font-size: 1.25rem; font-weight: 800; }
    
    .question-tracker { display: flex; gap: 8px; flex-wrap: wrap; }
    .q-chip {
      width: 36px; height: 36px; border-radius: 8px; border: 1px solid #cbd5e1;
      display: flex; align-items: center; justify-content: center; font-weight: 600;
      cursor: pointer; font-size: 0.9rem; background: white;
    }
    .q-chip.active { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }
    .q-chip.answered { background: #d1fae5; border-color: #10b981; color: #065f46; }
    
    .question-card { background: #f8fafc; padding: 24px; }
    .q-number { font-size: 0.85rem; color: #64748b; font-weight: 600; }
    .q-text { font-size: 1.15rem; font-weight: 600; color: #0f172a; }
    
    .options-group { display: flex; flex-direction: column; gap: 10px; }
    .option-label {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: white; border: 1px solid #cbd5e1; border-radius: 8px;
      cursor: pointer; transition: all 0.2s; font-size: 0.95rem;
    }
    .option-label:hover { border-color: #4f46e5; }
    .option-label.selected { border-color: #4f46e5; background: #eef2ff; font-weight: 600; }
    
    .test-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    
    .text-center { text-align: center; }
    .percentage-circle {
      width: 120px; height: 120px; border-radius: 50%; background: #4f46e5; color: white;
      display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;
      margin: 0 auto 16px;
    }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
  `]
})
export class OnlineTestComponent implements OnInit, OnDestroy {
  assessment: any = null;
  questions: any[] = [];
  currentQuestionIndex = 0;
  userAnswers: { [qId: string]: string } = {};

  timeLeft = 1200; // in seconds
  timerInterval: any = null;
  startTime = Date.now();

  submitted = false;
  testResult: any = null;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchAssessment(id);
    }
  }

  fetchAssessment(id: string): void {
    this.apiService.get<any>(`assessments/${id}`).subscribe(res => {
      if (res.success) {
        this.assessment = res.data.assessment;
        this.questions = res.data.questions || [];
        this.timeLeft = (this.assessment.duration || 20) * 60;
        this.startTimer();
      }
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval);
        this.submitTest(); // Auto-submit on timer expiry!
      }
    }, 1000);
  }

  get currentQuestion(): any {
    return this.questions[this.currentQuestionIndex];
  }

  jumpToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  submitTest(): void {
    if (this.submitted) return;
    clearInterval(this.timerInterval);

    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);

    this.apiService.post<any>(`assessments/${this.assessment._id}/submit`, {
      answers: this.userAnswers,
      timeTaken
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.submitted = true;
          this.testResult = res.data;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
