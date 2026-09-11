import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
}

export interface Student {
  _id: string;
  registerNumber: string;
  department: string;
  cgpa: number;
  graduationYear: number;
  skills: string[];
  resumeUrl?: string;
  placementStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentStudentSubject = new BehaviorSubject<Student | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentStudent$ = this.currentStudentSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const studentStr = localStorage.getItem('student');

    if (token && userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
      if (studentStr) {
        this.currentStudentSubject.next(JSON.parse(studentStr));
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  getStudent(): Student | null {
    return this.currentStudentSubject.value;
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, data).pipe(
      tap(res => {
        if (res.success && res.data.token) {
          this.setSession(res.data);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data.token) {
          this.setSession(res.data);
        }
      })
    );
  }

  private setSession(authResult: { token: string; user: User; student?: Student }): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);

    if (authResult.student) {
      localStorage.setItem('student', JSON.stringify(authResult.student));
      this.currentStudentSubject.next(authResult.student);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    this.currentUserSubject.next(null);
    this.currentStudentSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user ? user.role === role : false;
  }
}
