import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://nest-to-do.vercel.app/auth';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    };
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, this.getAuthHeaders());
  }

  updateProfile(data: { username?: string; email?: string }): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/profile`, data, this.getAuthHeaders());
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/profile/password`, data, this.getAuthHeaders());
  }
}
