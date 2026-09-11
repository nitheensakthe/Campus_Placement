import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">CampusPlacement<span class="highlight">AI</span></span>
        </a>

        <nav class="nav-links" *ngIf="!currentUser">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/jobs" routerLinkActive="active">Job Drives</a>
          <a routerLink="/companies" routerLinkActive="active">Companies</a>
        </nav>

        <div class="header-actions">
          <ng-container *ngIf="!currentUser">
            <a routerLink="/login" class="btn btn-outline">Sign In</a>
            <a routerLink="/register" class="btn btn-primary">Register</a>
          </ng-container>

          <ng-container *ngIf="currentUser">
            <div class="notification-wrapper" (click)="toggleNotifications()">
              <button class="icon-btn" aria-label="Notifications">
                🔔
                <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </button>

              <div class="notification-dropdown" *ngIf="showNotifications">
                <div class="dropdown-header">
                  <h4>Notifications</h4>
                  <span class="badge badge-info">{{ notifications.length }} Total</span>
                </div>
                <div class="dropdown-body">
                  <div *ngIf="notifications.length === 0" class="empty-notif">No new notifications</div>
                  <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read" (click)="markRead(n)">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-msg">{{ n.message }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="user-profile-badge">
              <div class="avatar">{{ currentUser.name.charAt(0) }}</div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.name }}</span>
                <span class="user-role badge" [ngClass]="getRoleBadgeClass(currentUser.role)">{{ currentUser.role | titlecase }}</span>
              </div>
              <button (click)="logout()" class="btn btn-outline logout-btn">Logout</button>
            </div>
          </ng-container>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05);
    }
    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      text-decoration: none;
    }
    .highlight { color: #4f46e5; }
    .nav-links {
      display: flex;
      gap: 24px;
    }
    .nav-links a {
      color: #64748b;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: #4f46e5;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .notification-wrapper {
      position: relative;
    }
    .icon-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      position: relative;
      padding: 6px;
    }
    .unread-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      border-radius: 999px;
      padding: 2px 6px;
      font-weight: bold;
    }
    .notification-dropdown {
      position: absolute;
      right: 0;
      top: 40px;
      width: 320px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      z-index: 200;
    }
    .dropdown-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dropdown-body {
      max-height: 300px;
      overflow-y: auto;
    }
    .notif-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
    }
    .notif-item.unread {
      background: #f0f9ff;
    }
    .notif-title {
      font-weight: 600;
      font-size: 0.9rem;
      color: #0f172a;
    }
    .notif-msg {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 2px;
    }
    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #4f46e5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .logout-btn {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;

  constructor(private authService: AuthService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.fetchNotifications();
      }
    });
  }

  fetchNotifications(): void {
    this.apiService.get<any>('notifications').subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.data.notifications || [];
          this.unreadCount = res.data.unreadCount || 0;
        }
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markRead(notification: any): void {
    if (!notification.read) {
      this.apiService.put<any>(`notifications/${notification._id}/read`, {}).subscribe(() => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleBadgeClass(role: string): string {
    if (role === 'admin') return 'badge-danger';
    if (role === 'recruiter') return 'badge-info';
    return 'badge-success';
  }
}
