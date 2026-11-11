import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface TopicSummary {
  _id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  lessonCount: number;
  videoCount: number;
}

export interface LessonItem {
  _id: string;
  title: string;
  content: string;
  order: number;
}

export interface VideoItem {
  _id: string;
  title: string;
  url: string;
  description: string;
  order: number;
}

export interface QuizSummary {
  _id: string;
  title: string;
  passingScore: number;
}

export interface TopicDetailData {
  topic: TopicSummary;
  lessons: LessonItem[];
  videos: VideoItem[];
  quiz: QuizSummary | null;
}

export interface LessonDetailData {
  _id: string;
  title: string;
  content: string;
  topic: { name: string; slug: string };
}

export interface QuizQuestion {
  text: string;
  options: string[];
}

export interface QuizData {
  _id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizResultDetail {
  text: string;
  correctIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  passingScore: number;
  detail: QuizResultDetail[];
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  getTopics() {
    return this.http.get<TopicSummary[]>(`${this.base}/topics`);
  }

  getTopic(slug: string) {
    return this.http.get<TopicDetailData>(`${this.base}/topics/${slug}`);
  }

  getLesson(id: string) {
    return this.http.get<LessonDetailData>(`${this.base}/lessons/${id}`);
  }

  getQuiz(id: string) {
    return this.http.get<QuizData>(`${this.base}/quizzes/${id}`);
  }

  submitQuiz(id: string, answers: number[], username: string) {
    return this.http.post<QuizResult>(`${this.base}/quizzes/${id}/submit`, {
      answers,
      username,
    });
  }
}
