import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://nest-to-do.vercel.app/auth';
  constructor(private http: HttpClient) { }

  register(data: {email: string; password: string, username: string}){
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: {username: string, password: string}){
    return this.http.post(`${this.apiUrl}/login`, data);
  }
}
