import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, LessonDetailData } from '../content';
import { Header } from '../shared/header/header';
import { Icon } from '../shared/icon/icon';
import { SafeUrlPipe } from '../safe-url.pipe';

@Component({
  selector: 'app-lesson-detail',
  imports: [RouterLink, Header, Icon, SafeUrlPipe],
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
    return (content ?? '')
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  }

  protected progressPercent(lesson: LessonDetailData): number {
    const index = lesson.lessons.findIndex((item) => item._id === lesson._id);

    if (index < 0 || !lesson.lessons.length) {
      return 0;
    }

    return Math.round(((index + 1) / lesson.lessons.length) * 100);
  }

  protected moduleIcon(slug: string): string {
    switch (slug) {
      case 'contrasenas-autenticacion':
        return 'key';
      case 'malware-antivirus':
        return 'bug';
      case 'ingenieria-social':
        return 'mask';
      case 'redes-sociales-privacidad':
        return 'smartphone';
      case 'phishing':
        return 'mail';
      default:
        return 'shield';
    }
  }
}
