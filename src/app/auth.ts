import { Injectable, signal } from '@angular/core';

export type Role = 'admin' | 'student';

export interface AuthUser {
  username: string;
  role: Role;
}

const TOKEN_KEY = 'cyberthink.token';
const USER_KEY = 'cyberthink.user';

@Injectable({ providedIn: 'root' })
export class Auth {
  readonly token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  readonly user = signal<AuthUser | null>(this.readUser());

  login(token: string, user: AuthUser): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.user.set(user);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return Boolean(this.token() && this.user());
  }

  isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  isStudent(): boolean {
    return this.user()?.role === 'student';
  }

  private readUser(): AuthUser | null {
    const raw = sessionStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);

      if (
        parsed &&
        typeof parsed.username === 'string' &&
        (parsed.role === 'admin' || parsed.role === 'student')
      ) {
        return { username: parsed.username, role: parsed.role };
      }
    } catch {
      return null;
    }

    return null;
  }
}
