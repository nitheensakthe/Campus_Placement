import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <app-header></app-header>
    <div class="app-layout">
      <app-sidebar *ngIf="authService.isLoggedIn()"></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: calc(100vh - 65px);
    }
    .main-content {
      flex: 1;
      background-color: #f8fafc;
    }
  `]
})
export class AppComponent {
  title = 'AI Campus Placement Management Platform';
  constructor(public authService: AuthService) {}
}
