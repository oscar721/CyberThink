import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-home',
  imports: [],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
