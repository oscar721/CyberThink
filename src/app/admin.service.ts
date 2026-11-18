import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface AdminTopic {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
  published: boolean;
  lessonCount?: number;
  videoCount?: number;
  quizCount?: number;
}

export interface AdminLesson {
  _id: string;
  topic: { _id: string; name: string; slug: string } | string;
  title: string;
  introduction: string;
  objectives: string[];
  content: string;
  example: string;
  recommendations: string[];
  imageUrl: string;
  order: number;
  published: boolean;
}

export interface AdminVideo {
  _id: string;
  topic: { _id: string; name: string; slug: string } | string;
  lesson: { _id: string; title: string; order: number } | string | null;
  title: string;
  url: string;
  description: string;
  order: number;
  published: boolean;
}

export interface AdminQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface AdminQuiz {
  _id: string;
  topic: { _id: string; name: string; slug: string } | string;
  lesson: { _id: string; title: string; order: number } | string | null;
  title: string;
  passingScore: number;
  questions: AdminQuestion[];
  published: boolean;
}

export interface AdminUser {
  _id: string;
  username: string;
  role: 'admin' | 'student';
  createdAt: string;
}

export interface AdminAttempt {
  _id: string;
  username: string;
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  createdAt: string;
  quiz: { title: string; topic?: { name: string } | null } | null;
}

export interface AdminStats {
  users: number;
  students: number;
  admins: number;
  topics: number;
  lessons: number;
  videos: number;
  quizzes: number;
  attempts: number;
  recent: AdminAttempt[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/admin`;

  stats() {
    return this.http.get<AdminStats>(`${this.base}/stats`);
  }

  topics() {
    return this.http.get<AdminTopic[]>(`${this.base}/topics`);
  }

  createTopic(payload: Partial<AdminTopic>) {
    return this.http.post<AdminTopic>(`${this.base}/topics`, payload);
  }

  updateTopic(id: string, payload: Partial<AdminTopic>) {
    return this.http.put<AdminTopic>(`${this.base}/topics/${id}`, payload);
  }

  deleteTopic(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/topics/${id}`);
  }

  lessons(topicId?: string) {
    const query = topicId ? `?topic=${topicId}` : '';
    return this.http.get<AdminLesson[]>(`${this.base}/lessons${query}`);
  }

  createLesson(payload: Partial<AdminLesson>) {
    return this.http.post<AdminLesson>(`${this.base}/lessons`, payload);
  }

  updateLesson(id: string, payload: Partial<AdminLesson>) {
    return this.http.put<AdminLesson>(`${this.base}/lessons/${id}`, payload);
  }

  deleteLesson(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/lessons/${id}`);
  }

  videos(topicId?: string) {
    const query = topicId ? `?topic=${topicId}` : '';
    return this.http.get<AdminVideo[]>(`${this.base}/videos${query}`);
  }

  createVideo(payload: Partial<AdminVideo>) {
    return this.http.post<AdminVideo>(`${this.base}/videos`, payload);
  }

  updateVideo(id: string, payload: Partial<AdminVideo>) {
    return this.http.put<AdminVideo>(`${this.base}/videos/${id}`, payload);
  }

  deleteVideo(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/videos/${id}`);
  }

  quizzes(topicId?: string) {
    const query = topicId ? `?topic=${topicId}` : '';
    return this.http.get<AdminQuiz[]>(`${this.base}/quizzes${query}`);
  }

  createQuiz(payload: Partial<AdminQuiz>) {
    return this.http.post<AdminQuiz>(`${this.base}/quizzes`, payload);
  }

  updateQuiz(id: string, payload: Partial<AdminQuiz>) {
    return this.http.put<AdminQuiz>(`${this.base}/quizzes/${id}`, payload);
  }

  deleteQuiz(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/quizzes/${id}`);
  }

  users() {
    return this.http.get<AdminUser[]>(`${this.base}/users`);
  }

  updateUserRole(id: string, role: 'admin' | 'student') {
    return this.http.patch<{ username: string; role: 'admin' | 'student' }>(
      `${this.base}/users/${id}/role`,
      { role },
    );
  }

  results() {
    return this.http.get<AdminAttempt[]>(`${this.base}/results`);
  }
}
