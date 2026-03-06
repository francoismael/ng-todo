import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  showPassword = false;
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: [''],
      password: [''],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue() as { username: string; password: string };

      this.isLoading = true;
      this.auth.login(credentials).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.access_token);
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
          this.isLoading = false;
        }
      });
    }
  }

}
