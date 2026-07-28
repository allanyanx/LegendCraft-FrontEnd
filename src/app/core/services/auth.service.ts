import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { UpdateProfileRequest } from '../models/update-profile-request';
import { ChangePasswordRequest } from '../models/change-password-request';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal centralizado para manejar el estado del usuario en toda la aplicación
  currentUser = signal<AuthResponse | null>(null);

  constructor() {
    this.checkToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-profile`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, data);
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
  }

  private handleAuthResponse(response: AuthResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
      // Guardamos la info básica para recuperarla si refresca la página
      localStorage.setItem('user', JSON.stringify({ 
        email: response.email, 
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles 
      }));
    }
    this.currentUser.set(response);
  }

  private checkToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.currentUser.set({ token, ...user });
      }
    }
  }
}
