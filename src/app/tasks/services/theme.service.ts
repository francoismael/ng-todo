import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';
  isDark = false;

  constructor() {
    this.isDark = localStorage.getItem(this.STORAGE_KEY) === 'dark';
    this.apply();
  }

  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem(this.STORAGE_KEY, this.isDark ? 'dark' : 'light');
    this.apply();
  }

  private apply() {
    document.body.classList.toggle('dark', this.isDark);
  }
}
