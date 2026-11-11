import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService, TopicSummary } from '../content';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Header],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly content = inject(ContentService);

  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.content.getTopics().subscribe({
      next: (topics) => {
        this.topics.set(topics);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los temas. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
