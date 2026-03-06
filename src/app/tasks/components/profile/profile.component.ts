import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../auth/service/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  username = '';
  email = '';
  profileSuccess = '';
  profileError = '';
  profileLoading = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;
  passwordSuccess = '';
  passwordError = '';
  passwordLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (p) => { this.username = p.username; this.email = p.email; },
      error: () => { this.profileError = 'Impossible de charger le profil.'; },
    });
  }

  saveProfile() {
    this.profileSuccess = '';
    this.profileError = '';
    if (!this.username.trim() || !this.email.trim()) {
      this.profileError = "Nom d'utilisateur et email sont requis.";
      return;
    }
    this.profileLoading = true;
    this.userService.updateProfile({ username: this.username, email: this.email }).subscribe({
      next: () => {
        this.profileSuccess = 'Profil mis à jour avec succès.';
        this.profileLoading = false;
      },
      error: (err) => {
        this.profileError = err.status === 409 ? 'Cet email est déjà utilisé.' : 'Erreur lors de la mise à jour.';
        this.profileLoading = false;
      },
    });
  }

  changePassword() {
    this.passwordSuccess = '';
    this.passwordError = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Tous les champs sont requis.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'Le nouveau mot de passe doit comporter au moins 8 caractères.';
      return;
    }
    this.passwordLoading = true;
    this.userService.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.passwordSuccess = 'Mot de passe changé avec succès.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordLoading = false;
      },
      error: (err) => {
        this.passwordError = err.status === 401
          ? 'Mot de passe actuel incorrect.'
          : 'Erreur lors du changement de mot de passe.';
        this.passwordLoading = false;
      },
    });
  }
}
