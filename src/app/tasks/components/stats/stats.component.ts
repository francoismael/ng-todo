import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../types/task.dto';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getAllTasks().subscribe({
      next: (data) => { this.tasks = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get total()       { return this.tasks.length; }
  get done()        { return this.tasks.filter(t => t.status === 'done').length; }
  get pending()     { return this.tasks.filter(t => t.status === 'pending').length; }
  get inProgress()  { return this.tasks.filter(t => t.status === 'in-progress').length; }
  get urgent()      { return this.tasks.filter(t => (t.priority ?? 'normal') === 'urgent').length; }
  get overdue()     {
    const now = Date.now();
    return this.tasks.filter(t => t.endTime && new Date(t.endTime).getTime() < now && t.status !== 'done').length;
  }
  get completionRate() {
    return this.total > 0 ? Math.round((this.done / this.total) * 100) : 0;
  }
  get totalSubTasks() {
    return this.tasks.reduce((acc, t) => acc + t.subTasks.length, 0);
  }
  get doneSubTasks() {
    return this.tasks.reduce((acc, t) => acc + t.subTasks.filter(s => s.status === 'done').length, 0);
  }
}
