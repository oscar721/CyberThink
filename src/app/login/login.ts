import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { Auth } from '../auth';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  user: { username: string };
}

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  username = '';
  password = '';
  loading = false;
  message = '';
  error = '';

  onSubmit(): void {
    this.loading = true;
    this.message = '';
    this.error = '';

    this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, {
        username: this.username,
        password: this.password,
      })
      .pipe(timeout(20000))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.auth.login(response.user.username);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.name === 'TimeoutError'
              ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
              : err?.error?.message ?? 'No se pudo conectar con el servidor';
        },
      });
  }
}
