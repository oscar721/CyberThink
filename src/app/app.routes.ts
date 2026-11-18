import { Routes } from '@angular/router';
import { adminGuard, guestGuard, studentGuard } from './auth.guard';
import { Admin } from './admin/admin';
import { Home } from './home/home';
import { LessonDetail } from './lesson-detail/lesson-detail';
import { Login } from './login/login';
import { QuizPage } from './quiz/quiz';
import { Results } from './results/results';
import { TopicDetail } from './topic-detail/topic-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'home', component: Home, canActivate: [studentGuard] },
  { path: 'topics/:slug', component: TopicDetail, canActivate: [studentGuard] },
  { path: 'lessons/:id', component: LessonDetail, canActivate: [studentGuard] },
  { path: 'quizzes/:id', component: QuizPage, canActivate: [studentGuard] },
  { path: 'results', component: Results, canActivate: [studentGuard] },
  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'login' },
];
