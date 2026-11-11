import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { Home } from './home/home';
import { LessonDetail } from './lesson-detail/lesson-detail';
import { Login } from './login/login';
import { QuizPage } from './quiz/quiz';
import { TopicDetail } from './topic-detail/topic-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'topics/:slug', component: TopicDetail, canActivate: [authGuard] },
  { path: 'lessons/:id', component: LessonDetail, canActivate: [authGuard] },
  { path: 'quizzes/:id', component: QuizPage, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
