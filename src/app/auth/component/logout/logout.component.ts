import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {
  @Output() cancel = new EventEmitter<void>();

  constructor(private router: Router) {}

  confirm() {
    localStorage.removeItem('token');
    this.router.navigate(['/authentication/login']);
  }

  dismiss() {
    this.cancel.emit();
  }
}
