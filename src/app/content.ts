import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface ImageMetadata {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  creator: string;
  creatorUrl: string;
  license: string;
  licenseVersion: string;
  licenseUrl: string;
  source: string;
  foreignLandingUrl: string;
  attribution: string;
  query: string;
}

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
  image?: ImageMetadata | null;
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
  image?: ImageMetadata | null;
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
  key: string;
  text: string;
  options: string[];
}

export interface QuizAttempt {
  attemptId: string;
  title: string;
  passingScore: number;
  topic?: { name: string; slug: string } | null;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionKey: string;
  selectedIndex: number;
}

export interface QuizResultDetail {
  text: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
  explanation: string;
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

  startQuiz(id: string) {
    return this.http.post<QuizAttempt>(`${this.base}/quizzes/${id}/attempts`, {});
  }

  submitAttempt(attemptId: string, answers: QuizAnswer[]) {
    return this.http.post<QuizResult>(
      `${this.base}/attempts/${attemptId}/submit`,
      { answers },
    );
  }

  getResults() {
    return this.http.get<AttemptItem[]>(`${this.base}/results`);
  }

  getProgress() {
    return this.http.get<Progress>(`${this.base}/progress`);
  }
}
