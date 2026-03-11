import { Component, OnInit, OnDestroy } from '@angular/core';
import { Task } from '../../types/task.dto';
import { TaskService } from '../../services/task.service';
import { ScheduledTaskService } from '../../services/scheduled-task.service';
import { ToastService } from '../../services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type StatusFilter = '' | 'pending' | 'in-progress' | 'done';
type SortOption = 'default' | 'priority' | 'deadline' | 'title';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  private timerSub: ReturnType<typeof setInterval> | null = null;
  allTasks: Task[] = [];
  tasks: Task[] = [];
  loading = true;
  loadingCardId: string | null = null;
  keyword = '';
  activeTab: StatusFilter = '';
  sortBy: SortOption = 'default';
  pendingDeleteId: string | null = null;

  readonly tabs: { value: StatusFilter; label: string }[] = [
    { value: '', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'in-progress', label: 'En cours' },
    { value: 'done', label: 'Terminées' },
  ];

  constructor(private taskService: TaskService, private router: Router, private scheduledTaskService: ScheduledTaskService, private toast: ToastService) {}

  ngOnInit() {
    this.loadTasks();
    this.timerSub = setInterval(() => {}, 1000);
  }

  ngOnDestroy() {
    if (this.timerSub) clearInterval(this.timerSub);
  }

  loadTasks() {
    if (!this.loadingCardId) this.loading = true;
    this.scheduledTaskService.generateToday().subscribe({
      next: () => this.fetchTasks(),
      error: () => this.fetchTasks(),
    });
  }

  private fetchTasks() {
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.loading = false;
        this.loadingCardId = null;
        if (!this.autoDeleteExpired(data)) {
          this.allTasks = data;
          this.applyFilters();
        }
      },
      error: (err) => { this.loading = false; this.loadingCardId = null; console.error(err); },
    });
  }

  private autoDeleteExpired(tasks: Task[]): boolean {
    const now = new Date();
    const expired = tasks.filter(t =>
      t.endTime && new Date(t.endTime) < now && t.status !== 'done'
    );
    const scheduledDone = tasks.filter(t => t.isScheduled && t.status === 'done');
    const toDelete = [...new Map([...expired, ...scheduledDone].map(t => [t.id, t])).values()];

    if (toDelete.length === 0) return false;

    let remaining = toDelete.length;
    toDelete.forEach(t => {
      this.taskService.deleteTask(t.id).subscribe({
        next: () => { if (--remaining === 0) this.fetchAndDisplay(); },
        error: () => { if (--remaining === 0) this.fetchAndDisplay(); },
      });
    });
    return true;
  }

  private fetchAndDisplay() {
    this.fetchTasks();
  }

  setTab(tab: StatusFilter) {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.allTasks;
    if (this.activeTab) {
      filtered = filtered.filter(t => t.status === this.activeTab);
    }
    if (this.keyword.trim()) {
      const kw = this.keyword.trim().toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(kw) ||
        (t.description ?? '').toLowerCase().includes(kw)
      );
    }
    this.tasks = this.sortTasks(filtered);
  }

  private sortTasks(list: Task[]): Task[] {
    const priorityOrder: Record<string, number> = { urgent: 0, normal: 1, low: 2 };
    return [...list].sort((a, b) => {
      if (this.sortBy === 'priority') {
        return (priorityOrder[a.priority ?? 'normal'] ?? 1) - (priorityOrder[b.priority ?? 'normal'] ?? 1);
      }
      if (this.sortBy === 'deadline') {
        const aTime = a.endTime ? new Date(a.endTime).getTime() : Infinity;
        const bTime = b.endTime ? new Date(b.endTime).getTime() : Infinity;
        return aTime - bTime;
      }
      if (this.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }

  clearSearch() {
    this.keyword = '';
    this.applyFilters();
  }

  countByStatus(status: StatusFilter): number {
    if (!status) return this.allTasks.length;
    return this.allTasks.filter(t => t.status === status).length;
  }

  showDeadlineInfo(task: Task): boolean {
    if (task.status === 'done') return false;
    const now = Date.now();
    if (task.startTime && new Date(task.startTime).getTime() > now) return true;
    if (task.endTime) {
      const diff = new Date(task.endTime).getTime() - now;
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    }
    return false;
  }

  isDeadlineSoon(task: Task): boolean {
    if (!task.endTime || task.status === 'done') return false;
    if (task.startTime && new Date(task.startTime).getTime() > Date.now()) return false;
    const diff = new Date(task.endTime).getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  }

  isDeadlineUrgent(task: Task): boolean {
    if (!task.endTime || task.status === 'done') return false;
    if (task.startTime && new Date(task.startTime).getTime() > Date.now()) return false;
    const diff = new Date(task.endTime).getTime() - Date.now();
    return diff > 0 && diff < 60 * 60 * 1000;
  }

  deadlineRemainingText(task: Task): string {
    const now = Date.now();
    if (task.startTime && new Date(task.startTime).getTime() > now) {
      const diffMs = new Date(task.startTime).getTime() - now;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      if (hours > 0) return `Débute dans ${hours}h ${minutes}min`;
      return `Débute dans ${minutes}min ${seconds}s`;
    }
    if (!task.endTime) return '';
    const diffMs = new Date(task.endTime).getTime() - now;
    if (diffMs <= 0) return 'Aucun temps restant';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    if (hours > 0) return `Terminer dans ${hours}h ${minutes}min`;
    return `Terminer dans ${minutes}min ${seconds}s`;
  }

  editTask(id: string) {
    this.router.navigate(['/tasks/edit', id]);
  }

  deleteTask(id: string) {
    this.pendingDeleteId = id;
  }

  confirmDeleteTask() {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.loadingCardId = id;
    this.taskService.deleteTask(id).subscribe({
      next: () => { this.toast.success('Tâche supprimée'); this.loadTasks(); },
      error: (err) => { this.loadingCardId = null; this.toast.error('Erreur lors de la suppression'); console.error(err); },
    });
  }

  cancelDelete() {
    this.pendingDeleteId = null;
  }

  updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'done') {
    this.loadingCardId = taskId;
    this.taskService.updateTaskStatus(taskId, status).subscribe({
      next: () => { this.loadTasks(); },
      error: (err) => { this.loadingCardId = null; console.error(err); },
    });
  }

  toggleSubTaskStatus(taskId: string, subTaskId: string, current: 'pending' | 'in-progress' | 'done') {
    const next: 'pending' | 'done' = current === 'done' ? 'pending' : 'done';
    this.loadingCardId = taskId;

    this.taskService.updateSubTaskStatus(taskId, subTaskId, next).subscribe({
      next: () => this.loadTasks(),
      error: (err) => {
        console.error('Erreur mise à jour sous-tâche :', err);
        this.loadTasks();
      },
    });
  }

  onStatusChange(taskId: string, event: Event) {
    const status = (event.target as HTMLSelectElement).value as 'pending' | 'in-progress' | 'done';
    this.updateTaskStatus(taskId, status);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { pending: 'En attente', 'in-progress': 'En cours', done: 'Terminé' };
    return map[status] ?? status;
  }

  priorityLabel(p: string): string {
    const map: Record<string, string> = { low: 'Faible', normal: 'Normale', urgent: 'Urgent' };
    return map[p] ?? p;
  }
}
