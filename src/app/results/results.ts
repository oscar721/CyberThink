import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttemptItem, ContentService } from '../content';
import { Header } from '../shared/header/header';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-results',
  imports: [RouterLink, Header, Icon, DatePipe],
  styleUrl: './results.css',
  templateUrl: './results.html',
})
export class Results {
  private readonly content = inject(ContentService);

  protected readonly attempts = signal<AttemptItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly summary = computed(() => {
    const list = this.attempts();
    const passed = list.filter((attempt) => attempt.passed).length;
    const average = list.length
      ? Math.round(list.reduce((sum, attempt) => sum + attempt.score, 0) / list.length)
      : 0;
    const best = list.length ? Math.max(...list.map((attempt) => attempt.score)) : 0;

    return { total: list.length, passed, average, best };
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    this.content.getResults().subscribe({
      next: (attempts) => {
        this.attempts.set(attempts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus resultados. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  protected quizTitle(attempt: AttemptItem): string {
    return attempt.quiz?.title ?? 'Cuestionario no disponible';
  }

  protected topicName(attempt: AttemptItem): string {
    return attempt.quiz?.topic?.name ?? 'Módulo eliminado';
  }

  protected topicLink(attempt: AttemptItem): string[] {
    const slug = attempt.quiz?.topic?.slug;
    return slug ? ['/topics', slug] : ['/home'];
  }

  protected quizLink(attempt: AttemptItem): string[] {
    const id = attempt.quiz?._id;
    return id ? ['/quizzes', id] : ['/home'];
  }
}
