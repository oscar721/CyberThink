import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.message = `${response.message}. Bienvenido, ${response.user.username}.`;
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message ?? 'No se pudo conectar con el servidor';
        },
      });
  }
}
