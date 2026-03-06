import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduledTask, RecurrenceType } from '../../types/scheduled-task.dto';
import { ScheduledTaskService } from '../../services/scheduled-task.service';
import { ToastService } from '../../services/toast.service';

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

@Component({
  selector: 'app-scheduled-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheduled-tasks.component.html',
  styleUrls: ['./scheduled-tasks.component.css'],
})
export class ScheduledTasksComponent implements OnInit {
  tasks: ScheduledTask[] = [];
  loading = true;
  saving = false;
  loadingCardId: string | null = null;
  errorMsg = '';

  // Form fields
  title = '';
  description = '';
  priority: string = 'normal';
  recurrenceType: RecurrenceType = 'daily';
  selectedDays: boolean[] = Array(7).fill(false);
  scheduledDate = '';
  startHour = '';
  endHour = '';

  readonly dayLabels = DAY_LABELS;
  readonly recurrenceOptions = [
    { value: 'daily', label: 'Chaque jour' },
    { value: 'weekly', label: 'Jours spécifiques' },
    { value: 'once', label: 'Une fois (date précise)' },
  ];

  pendingDeleteId: string | null = null;

  constructor(private service: ScheduledTaskService, private toast: ToastService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    if (!this.loadingCardId) this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.tasks = data; this.loading = false; this.loadingCardId = null; },
      error: () => { this.loading = false; this.loadingCardId = null; },
    });
  }

  submit() {
    if (!this.title.trim()) { this.errorMsg = 'Le titre est requis.'; return; }
    if (this.recurrenceType === 'weekly' && !this.selectedDays.some(d => d)) {
      this.errorMsg = 'Sélectionnez au moins un jour.'; return;
    }
    if (this.recurrenceType === 'once' && !this.scheduledDate) {
      this.errorMsg = 'Sélectionnez une date.'; return;
    }
    this.errorMsg = '';
    this.saving = true;

    const daysOfWeek: number[] = this.recurrenceType === 'weekly'
      ? this.selectedDays.map((s, i) => s ? i : -1).filter(i => i >= 0)
      : [];

    this.service.create({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      priority: this.priority,
      recurrenceType: this.recurrenceType,
      daysOfWeek,
      scheduledDate: this.recurrenceType === 'once' ? this.scheduledDate : undefined,
      startHour: this.startHour || undefined,
      endHour: this.endHour || undefined,
    }).subscribe({
      next: () => { this.toast.success('Planification créée'); this.resetForm(); this.loadTasks(); this.saving = false; },
      error: () => { this.errorMsg = 'Erreur lors de la création.'; this.toast.error('Erreur lors de la création'); this.saving = false; },
    });
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.priority = 'normal';
    this.recurrenceType = 'daily';
    this.selectedDays = Array(7).fill(false);
    this.scheduledDate = '';
    this.startHour = '';
    this.endHour = '';
    this.errorMsg = '';
  }

  toggle(task: ScheduledTask) {
    this.loadingCardId = task.id;
    this.service.toggle(task.id).subscribe({
      next: () => { this.loadTasks(); },
      error: () => { this.loadingCardId = null; },
    });
  }

  deleteTask(id: string) {
    this.pendingDeleteId = id;
  }

  confirmDelete() {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.loadingCardId = id;
    this.service.delete(id).subscribe({
      next: () => { this.toast.success('Planification supprimée'); this.loadTasks(); },
      error: () => { this.loadingCardId = null; this.toast.error('Erreur lors de la suppression'); },
    });
  }

  cancelDelete() {
    this.pendingDeleteId = null;
  }

  recurrenceLabel(t: ScheduledTask): string {
    if (t.recurrenceType === 'daily') return 'Chaque jour';
    if (t.recurrenceType === 'once') return `Le ${t.scheduledDate ?? ''}`;
    if (t.recurrenceType === 'weekly' && t.daysOfWeek?.length) {
      return t.daysOfWeek.map(d => DAY_LABELS[d]).join(', ');
    }
    return '';
  }

  hoursLabel(t: ScheduledTask): string {
    if (!t.startHour && !t.endHour) return '';
    if (t.startHour && t.endHour) return `${t.startHour} – ${t.endHour}`;
    return t.startHour ?? t.endHour ?? '';
  }
}
