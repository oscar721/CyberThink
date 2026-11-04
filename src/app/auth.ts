import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'cyberthink.user';

@Injectable({ providedIn: 'root' })
export class Auth {
  readonly user = signal<string | null>(sessionStorage.getItem(STORAGE_KEY));

  login(username: string): void {
    sessionStorage.setItem(STORAGE_KEY, username);
    this.user.set(username);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }
}
