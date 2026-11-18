import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, TopicDetailData } from '../content';
import { Header } from '../shared/header/header';
import { Icon } from '../shared/icon/icon';
import { SafeUrlPipe } from '../safe-url.pipe';

@Component({
  selector: 'app-topic-detail',
  imports: [RouterLink, Header, Icon, SafeUrlPipe],
  styleUrl: './topic-detail.css',
  templateUrl: './topic-detail.html',
})
export class TopicDetail {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);

  protected readonly data = signal<TopicDetailData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.content.getTopic(slug).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar el módulo');
        this.loading.set(false);
      },
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

  protected accent(order: number): string {
    return `accent-${((order || 1) - 1) % 5}`;
  }

  protected moduleNumber(order: number): string {
    return String(order || 1).padStart(2, '0');
  }
}
