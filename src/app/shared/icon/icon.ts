import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('shield') {
          <path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6l7-3z" />
          <path d="M9.3 12.1l1.9 1.9 3.7-3.9" />
        }
        @case ('key') {
          <circle cx="8" cy="12" r="4" />
          <path d="M12 12h9M17 12v3M20 12v2" />
        }
        @case ('bug') {
          <rect x="8" y="8" width="8" height="11" rx="4" />
          <path d="M12 8V5M9.5 5l1.5 2M14.5 5L13 7M4 11h4M16 11h4M4 16.5h4M16 16.5h4" />
        }
        @case ('mask') {
          <path d="M4 7.5l8-3.5 8 3.5V12c0 4.8-3.4 7.8-8 9-4.6-1.2-8-4.2-8-9V7.5z" />
          <path d="M8.6 11.2h.01M15.4 11.2h.01M8.8 15c1 1 2.1 1.5 3.2 1.5s2.2-.5 3.2-1.5" />
        }
        @case ('smartphone') {
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M10.8 18.5h2.4" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3.6 6.6L12 12.1l8.4-5.5" />
        }
        @case ('book') {
          <path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5v-16z" />
          <path d="M4 18.5A2.5 2.5 0 016.5 16H20" />
        }
        @case ('play') {
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.6l5 3.4-5 3.4V8.6z" />
        }
        @case ('clipboard') {
          <rect x="5" y="4" width="14" height="17" rx="2.5" />
          <path d="M9 4V2.6h6V4" />
          <path d="M8.6 11.2l2 2 4-4" />
        }
        @case ('chart') {
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5" />
          <path d="M16 5.5a3.5 3.5 0 010 7M18 14.5c2 .8 3.2 2.6 3.5 5" />
        }
        @case ('logout') {
          <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('edit') {
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M13.5 6.5l4 4" />
        }
        @case ('trash') {
          <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('x') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 6l-6 6 6 6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('lock') {
          <rect x="5" y="10" width="14" height="11" rx="2.5" />
          <path d="M8 10V7a4 4 0 018 0v3" />
        }
        @case ('eye') {
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ('eye-off') {
          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
          <path d="M9.5 5.5A10.7 10.7 0 0112 5.3c6 0 9.5 6.7 9.5 6.7a17 17 0 01-3.1 3.8M6.4 6.4A17.6 17.6 0 002.5 12S6 18.7 12 18.7a10 10 0 004.5-1.1" />
        }
        @case ('alert') {
          <path d="M12 3l9 17H3L12 3zM12 9v5M12 17h.01" />
        }
        @case ('target') {
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.4" />
        }
        @case ('home') {
          <path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6" />
        }
        @case ('award') {
          <circle cx="12" cy="9" r="5" />
          <path d="M8.5 13.2L7 21l5-3 5 3-1.5-7.8" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        }
        @case ('spark') {
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
          <path d="M19 15l.7 2.1L22 18l-2.3.9L19 21l-.7-2.1L16 18l2.3-.9L19 15z" />
        }
        @case ('list') {
          <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        }
        @case ('chevron-down') {
          <path d="M6 9l6 6 6-6" />
        }
        @default {
          <path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6l7-3z" />
          <path d="M9.3 12.1l1.9 1.9 3.7-3.9" />
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
        line-height: 0;
      }
    `,
  ],
})
export class Icon {
  readonly name = input('shield');
  readonly size = input(20);
}
