import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { EditTaskComponent } from './components/edit-task/edit-task.component';
import { TaskShellComponent } from './components/task-shell/task-shell.component';
import { StatsComponent } from './components/stats/stats.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ScheduledTasksComponent } from './components/scheduled-tasks/scheduled-tasks.component';

export const taskRoutes: Routes = [
  {
    path: '',
    component: TaskShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TaskListComponent },
      { path: 'create', component: CreateTaskComponent },
      { path: 'edit/:id', component: EditTaskComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'scheduled', component: ScheduledTasksComponent },
    ],
  },
];
