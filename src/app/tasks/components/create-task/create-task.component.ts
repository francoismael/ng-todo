import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TaskPriority } from '../../types/task.dto';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css'
})
export class CreateTaskComponent {
  title = '';
  description = '';
  priority: TaskPriority = 'normal';
  // Desktop: datetime-local
  startTime = '';
  endTime = '';
  // Mobile: date + time séparés
  startDate = '';
  startHour = '';
  endDate = '';
  endHour = '';
  subTasks: { title: string }[] = [];
  errorMsg = '';

  constructor(private taskService: TaskService, private router: Router, private toast: ToastService) {}

  addSubTask() {
    this.subTasks.push({ title: '' });
  }

  removeSubTask(index: number) {
    this.subTasks.splice(index, 1);
  }

  submit() {
    if (!this.title.trim()) {
      this.errorMsg = 'Le titre est obligatoire.';
      return;
    }
    this.errorMsg = '';

    const isMobile = window.innerWidth <= 600;
    const rawStart = isMobile
      ? (this.startDate ? `${this.startDate}T${this.startHour || '00:00'}` : '')
      : this.startTime;
    const rawEnd = isMobile
      ? (this.endDate ? `${this.endDate}T${this.endHour || '00:00'}` : '')
      : this.endTime;
    const startTime = rawStart ? new Date(rawStart).toISOString() : '';
    const endTime = rawEnd ? new Date(rawEnd).toISOString() : '';

    this.taskService.createTask({
      title: this.title,
      description: this.description,
      priority: this.priority,
      startTime,
      endTime,
      subTasks: this.subTasks.filter(s => s.title.trim()).map(s => ({
        title: s.title,
        status: 'pending',
      })),
    }).subscribe({
      next: () => { this.toast.success('Tâche créée avec succès'); this.router.navigate(['/tasks']); },
      error: () => { this.errorMsg = 'Erreur lors de la creation.'; this.toast.error('Erreur lors de la création'); },
    });
  }
}
