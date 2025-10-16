import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Check for user in localStorage on service initialization
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<boolean> {
    // In a real app, this would be an HTTP request to your backend
    // This is a mock implementation
    if (email === 'admin@example.com' && password === 'admin123') {
      const user: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'admin'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(true);
    }
    
    // For demo purposes, create a regular user
    const user: User = {
      id: '2',
      email,
      name: email.split('@')[0],
      role: 'user'
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(true);
  }

  register(userData: any): Observable<boolean> {
    // In a real app, this would be an HTTP request to your backend
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      name: userData.name,
      role: 'user' // By default, new users are regular users
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(true);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }
}
