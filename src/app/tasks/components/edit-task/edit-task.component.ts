import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, UpdateSubTaskInput } from '../../services/task.service';
import { Task, TaskPriority } from '../../types/task.dto';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {

  task!: Task;

  title = '';
  description = '';
  priority: TaskPriority = 'normal';
  // Desktop: datetime-local
  startTime = '';
  endTime = '';
  // Mobile: date + time
  startDate = '';
  startHour = '';
  endDate = '';
  endHour = '';
  errorMsg = '';

  subTasks: {
    id?: string;
    title: string;
    status: 'pending' | 'in-progress' | 'done';
  }[] = [];

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) return;

    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
          this.errorMsg = 'Tâche non trouvée';
          return;
        }

        this.task = task;
        this.title = task.title;
        this.description = task.description || '';
        this.priority = task.priority ?? 'normal';
        if (task.startTime) {
          const iso = new Date(task.startTime).toISOString().slice(0, 16);
          this.startTime = iso;
          this.startDate = iso.slice(0, 10);
          this.startHour = iso.slice(11, 16);
        }
        if (task.endTime) {
          const iso = new Date(task.endTime).toISOString().slice(0, 16);
          this.endTime = iso;
          this.endDate = iso.slice(0, 10);
          this.endHour = iso.slice(11, 16);
        }

        this.subTasks = task.subTasks.map(s => ({
          id: s.id,
          title: s.title,
          status: s.status
        }));
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Erreur lors du chargement de la tâche';
      }
    });
  }

  // -------- SOUS-TÂCHES --------

  addSubTask() {
    this.subTasks.push({ title: '', status: 'pending' });
  }

  removeSubTask(index: number) {
    const sub = this.subTasks[index];

    if (sub.id) {
      this.taskService.deleteSubTask(this.task.id, sub.id).subscribe({
        next: (updatedTask) => {
          const unsaved = this.subTasks.filter(s => !s.id);
          this.subTasks = [
            ...updatedTask.subTasks.map(s => ({ id: s.id, title: s.title, status: s.status })),
            ...unsaved,
          ];
        },
        error: (err) => console.error('Erreur suppression sous-tâche :', err),
      });
    } else {
      this.subTasks.splice(index, 1);
    }
  }

  // -------- SUBMIT --------

  submit() {
    if (!this.task) return;
    if (!this.title.trim()) {
      this.errorMsg = 'Le titre est obligatoire';
      return;
    }
    this.errorMsg = '';

    const subTasksPayload: UpdateSubTaskInput[] = this.subTasks
      .filter(s => s.title.trim() !== '')
      .map(s => ({ id: s.id, title: s.title, status: s.status }));

    const isMobile = window.innerWidth <= 600;
    const startStr = isMobile
      ? (this.startDate ? `${this.startDate}T${this.startHour || '00:00'}` : '')
      : this.startTime;
    const endStr = isMobile
      ? (this.endDate ? `${this.endDate}T${this.endHour || '00:00'}` : '')
      : this.endTime;
    const startTime = startStr ? new Date(startStr) : undefined;
    const endTime = endStr ? new Date(endStr) : undefined;

    this.taskService.updateTask(this.task.id, {
      title: this.title,
      description: this.description,
      priority: this.priority,
      startTime,
      endTime,
      subTasks: subTasksPayload,
    }).subscribe({
      next: () => { this.router.navigate(['/tasks']); },
      error: (err) => {
        console.error('Erreur mise à jour :', err);
        this.errorMsg = 'Erreur lors de la mise à jour';
      },
    });
  }
}
