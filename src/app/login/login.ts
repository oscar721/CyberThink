import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { Auth, Role } from '../auth';
import { environment } from '../../environments/environment';
import { Icon } from '../shared/icon/icon';

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: { username: string; role: Role };
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, Icon],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected username = '';
  protected password = '';
  protected loading = false;
  protected showPassword = false;
  protected error = '';
  protected readonly year = new Date().getFullYear();

  onSubmit(): void {
    if (this.loading || !this.username.trim() || !this.password) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, {
        username: this.username.trim(),
        password: this.password,
      })
      .pipe(timeout(20000))
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (!response?.token || !response?.user?.role) {
            this.error = 'Respuesta inválida del servidor. Inténtalo de nuevo.';
            return;
          }

          this.auth.login(response.token, response.user);
          this.router.navigate([response.user.role === 'admin' ? '/admin' : '/home']);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.name === 'TimeoutError'
              ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
              : (err?.error?.message ?? 'No se pudo conectar con el servidor');
        },
      });
  }
}
