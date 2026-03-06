import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../types/task.dto';

export type UpdateSubTaskInput = {
  id?: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
};

export type UpdateTaskPayload = Omit<Partial<Task>, 'subTasks'> & {
  subTasks?: UpdateSubTaskInput[];
};

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'https://nest-to-do.vercel.app/tasks';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    };
  }

  createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    startTime?: string;
    endTime?: string;
    subTasks?: { title: string; status?: string }[];
  }): Observable<Task> {
    return this.http.post<Task>(
      `${this.apiUrl}/createTask`,
      data,
      this.getAuthHeaders(),
    );
  }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/findAll`,
      this.getAuthHeaders(),
    );
  }

  updateTask(id: string, data: UpdateTaskPayload): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/updateTask/${id}`,
      data,
      this.getAuthHeaders(),
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/deleteTask/${id}`,
      this.getAuthHeaders(),
    );
  }

  updateTaskStatus(
    taskId: string,
    status: 'pending' | 'in-progress' | 'done',
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/${taskId}/status`,
      { status },
      this.getAuthHeaders(),
    );
  }

  updateSubTaskStatus(
    taskId: string,
    subTaskId: string,
    status: 'pending' | 'in-progress' | 'done',
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/${taskId}/subtasks/${subTaskId}/status`,
      { status },
      this.getAuthHeaders(),
    );
  }

  deleteSubTask(taskId: string, subTaskId: string): Observable<Task> {
    return this.http.delete<Task>(
      `${this.apiUrl}/${taskId}/subtasks/${subTaskId}`,
      this.getAuthHeaders(),
    );
  }

  searchTasks(filters: {
    keyword?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<Task[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });

    return this.http.get<Task[]>(
      `${this.apiUrl}/search`,
      {
        ...this.getAuthHeaders(),
        params,
      },
    );
  }
}
