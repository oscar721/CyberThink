import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService, Progress, TopicSummary } from '../content';
import { Auth } from '../auth';
import { Header } from '../shared/header/header';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Header, Icon],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly content = inject(ContentService);
  private readonly auth = inject(Auth);

  protected readonly user = this.auth.user;
  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly progress = signal<Progress | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    this.content.getTopics().subscribe({
      next: (topics) => {
        this.topics.set(topics);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los módulos. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });

    this.content.getProgress().subscribe({
      next: (progress) => this.progress.set(progress),
      error: () => {},
    });
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

  protected accent(index: number): string {
    return `accent-${index % 5}`;
  }

  protected moduleNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
