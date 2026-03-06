import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScheduledTask } from '../types/scheduled-task.dto';

@Injectable({ providedIn: 'root' })
export class ScheduledTaskService {
  private apiUrl = 'https://nest-to-do.vercel.app/scheduled-tasks';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    };
  }

  getAll(): Observable<ScheduledTask[]> {
    return this.http.get<ScheduledTask[]>(this.apiUrl, this.getHeaders());
  }

  create(data: Partial<ScheduledTask>): Observable<ScheduledTask> {
    return this.http.post<ScheduledTask>(this.apiUrl, data, this.getHeaders());
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  toggle(id: string): Observable<ScheduledTask> {
    return this.http.patch<ScheduledTask>(`${this.apiUrl}/${id}/toggle`, {}, this.getHeaders());
  }

  generateToday(): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/generate-today`, {}, this.getHeaders());
  }
}
