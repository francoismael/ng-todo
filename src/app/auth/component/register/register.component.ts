import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  errorMessage: string = '';
  registerForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      const credentials = this.registerForm.getRawValue() as {
        username: string;
        email: string;
        password: string;
      };

      this.isLoading = true;
      this.auth.register(credentials).subscribe({
        next: (res) => {
          console.log('Registration successful', res);
          this.errorMessage = 'Enregistrement effectuer'
          this.router.navigate(['/authentication/login']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          if (err.status === 409) {
            this.errorMessage = 'Cet email est déjà utilisé';
          } else {
            this.errorMessage = 'Erreur lors de l\'enregistrement';
          }
        }
      });
    }
  }
}
