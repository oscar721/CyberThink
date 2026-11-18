import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import type { ImageMetadata } from './content';

export interface AdminTopic {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  image?: ImageMetadata | null;
  imageQuery?: string;
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
  image?: ImageMetadata | null;
  imageQuery?: string;
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
  explanation: string;
}

export interface AdminQuiz {
  _id: string;
  topic: { _id: string; name: string; slug: string } | string;
  lesson: { _id: string; title: string; order: number } | string | null;
  title: string;
  passingScore: number;
  questions?: AdminQuestion[];
  questionCount?: number;
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

export interface AdminUserPayload {
  username: string;
  password: string;
  role: 'admin' | 'student';
}

export interface ImageAssignmentResponse {
  image: ImageMetadata | null;
  imageUrl: string;
}

export interface ImageCheckSummary {
  checked: number;
  available: number;
  repaired: number;
  failed: number;
  skipped?: boolean;
  reason?: string;
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

  assignTopicImage(id: string, query?: string) {
    return this.http.post<ImageAssignmentResponse>(`${this.base}/topics/${id}/image`, {
      query: query ?? '',
    });
  }

  checkImages() {
    return this.http.post<ImageCheckSummary>(`${this.base}/images/check`, {});
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

  assignLessonImage(id: string, query?: string) {
    return this.http.post<ImageAssignmentResponse>(
      `${this.base}/lessons/${id}/image`,
      { query: query ?? '' },
    );
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

  quiz(id: string) {
    return this.http.get<AdminQuiz>(`${this.base}/quizzes/${id}`);
  }

  createQuiz(payload: Partial<AdminQuiz>) {
    return this.http.post<AdminQuiz>(`${this.base}/quizzes`, payload);
  }

  updateQuiz(id: string, payload: Partial<AdminQuiz>) {
    return this.http.put<AdminQuiz>(`${this.base}/quizzes/${id}`, payload);
  }

  setQuizPublished(id: string, published: boolean) {
    return this.http.patch<{ _id: string; published: boolean }>(
      `${this.base}/quizzes/${id}/published`,
      { published },
    );
  }

  deleteQuiz(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/quizzes/${id}`);
  }

  users() {
    return this.http.get<AdminUser[]>(`${this.base}/users`);
  }

  createUser(payload: AdminUserPayload) {
    return this.http.post<AdminUser>(`${this.base}/users`, payload);
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
