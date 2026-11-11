import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
