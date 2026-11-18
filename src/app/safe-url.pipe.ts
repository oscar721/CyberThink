import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
]);

function youtubeId(parsed: URL): string | null {
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

  if (host === 'youtu.be') {
    return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
  }

  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  const parts = parsed.pathname.split('/').filter(Boolean);

  if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
    return parts[1] ?? null;
  }

  return parsed.searchParams.get('v');
}

function toEmbedUrl(url: string): string {
  const value = (url ?? '').trim();

  if (!value) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const id = youtubeId(parsed);

    if (!id) {
      return value;
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const base =
      host === 'youtube-nocookie.com'
        ? 'https://www.youtube-nocookie.com'
        : 'https://www.youtube.com';

    return `${base}/embed/${encodeURIComponent(id)}?rel=0`;
  } catch {
    return value;
  }
}

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(toEmbedUrl(url));
  }
}
