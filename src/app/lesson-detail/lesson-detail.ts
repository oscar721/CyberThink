import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, LessonDetailData } from '../content';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-lesson-detail',
  imports: [RouterLink, Header],
  styleUrl: './lesson-detail.css',
  templateUrl: './lesson-detail.html',
})
export class LessonDetail {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);

  protected readonly lesson = signal<LessonDetailData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.content.getLesson(id).subscribe({
      next: (lesson) => {
        this.lesson.set(lesson);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar la lección');
        this.loading.set(false);
      },
    });
  }

  protected paragraphs(content: string): string[] {
    return content.split('\n\n').filter((paragraph) => paragraph.trim().length > 0);
  }
}
