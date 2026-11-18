import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface QuizSummary {
  _id: string;
  title: string;
  passingScore: number;
}

export interface TopicSummary {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
  published: boolean;
  lessonCount: number;
  videoCount: number;
  quiz: QuizSummary | null;
}

export interface LessonItem {
  _id: string;
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

export interface VideoItem {
  _id: string;
  title: string;
  url: string;
  description: string;
  order: number;
  published: boolean;
  lesson?: string | null;
}

export interface TopicDetailData {
  topic: TopicSummary;
  lessons: LessonItem[];
  videos: VideoItem[];
  quiz: QuizSummary | null;
}

export interface LessonSummary {
  _id: string;
  title: string;
  order: number;
}

export interface LessonDetailData extends LessonItem {
  topic: { _id?: string; name: string; slug: string; description?: string };
  video: VideoItem | null;
  quiz: QuizSummary | null;
  lessons: LessonSummary[];
  previousLesson: LessonSummary | null;
  nextLesson: LessonSummary | null;
}

export interface QuizQuestion {
  text: string;
  options: string[];
}

export interface QuizData {
  _id: string;
  title: string;
  passingScore: number;
  topic?: { name: string; slug: string };
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

export interface AttemptItem {
  _id: string;
  username: string;
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  createdAt: string;
  quiz: {
    _id?: string;
    title: string;
    topic?: { name: string; slug: string } | null;
  } | null;
}

export interface Progress {
  topics: number;
  lessons: number;
  attempts: number;
  passed: number;
  average: number;
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

  submitQuiz(id: string, answers: number[]) {
    return this.http.post<QuizResult>(`${this.base}/quizzes/${id}/submit`, {
      answers,
    });
  }

  getResults() {
    return this.http.get<AttemptItem[]>(`${this.base}/results`);
  }

  getProgress() {
    return this.http.get<Progress>(`${this.base}/progress`);
  }
}
