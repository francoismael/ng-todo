import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckSquare, LogOut, Plus, List, BarChart2, User, Calendar } from 'lucide-angular';
import { LogoutComponent } from '../../../auth/component/logout/logout.component';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-task-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, LogoutComponent, ToastComponent],
  templateUrl: './task-shell.component.html',
  styleUrl: './task-shell.component.css',
})
export class TaskShellComponent {
  readonly LogOut = LogOut;
  readonly Plus = Plus;
  readonly List = List;
  readonly BarChart2 = BarChart2;
  readonly User = User;
  readonly Calendar = Calendar;

  showLogout = false;

  toggleLogout() {
    this.showLogout = !this.showLogout;
  }
}
