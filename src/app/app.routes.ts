import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { Home } from './home/home';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
