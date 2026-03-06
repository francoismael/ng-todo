import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'authentication',
    loadChildren: ()=> import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/task.routes').then((m) => m.taskRoutes),
  },

  { path: '', redirectTo: 'authentication/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
