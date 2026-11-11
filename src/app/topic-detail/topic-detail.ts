import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, TopicDetailData } from '../content';
import { Header } from '../shared/header/header';
import { SafeUrlPipe } from '../safe-url.pipe';

@Component({
  selector: 'app-topic-detail',
  imports: [RouterLink, Header, SafeUrlPipe],
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
        this.error.set(err?.error?.message ?? 'No se pudo cargar el tema');
        this.loading.set(false);
      },
    });
  }
}
