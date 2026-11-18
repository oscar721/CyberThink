import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, QuizData, QuizResult } from '../content';
import { Header } from '../shared/header/header';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-quiz',
  imports: [RouterLink, Header, Icon],
  styleUrl: './quiz.css',
  templateUrl: './quiz.html',
})
export class QuizPage {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly quizId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly quiz = signal<QuizData | null>(null);
  protected readonly answers = signal<(number | null)[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly result = signal<QuizResult | null>(null);

  protected readonly answeredCount = computed(
    () => this.answers().filter((answer) => answer !== null).length,
  );

  protected readonly progress = computed(() => {
    const total = this.quiz()?.questions.length ?? 0;
    return total ? Math.round((this.answeredCount() / total) * 100) : 0;
  });

  constructor() {
    this.content.getQuiz(this.quizId).subscribe({
      next: (quiz) => {
        this.answers.set(new Array(quiz.questions.length).fill(null));
        this.quiz.set(quiz);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar el cuestionario');
        this.loading.set(false);
      },
    });
  }

  protected answered(): boolean {
    const answers = this.answers();
    return answers.length > 0 && answers.every((answer) => answer !== null);
  }

  protected select(index: number, value: number): void {
    this.answers.update((answers) =>
      answers.map((current, position) => (position === index ? value : current)),
    );
  }

  protected submit(): void {
    const answers = this.answers();

    if (!this.quiz() || answers.some((answer) => answer === null) || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    this.content.submitQuiz(this.quizId, answers as number[]).subscribe({
      next: (result) => {
        this.result.set(result);
        this.submitting.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo enviar el cuestionario');
        this.submitting.set(false);
      },
    });
  }

  protected retry(): void {
    this.result.set(null);
    this.error.set('');
    this.answers.set(new Array(this.quiz()?.questions.length ?? 0).fill(null));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected optionText(questionIndex: number, optionIndex: number): string {
    return this.quiz()?.questions[questionIndex]?.options?.[optionIndex] ?? '—';
  }

  protected backLink(): string[] {
    const slug = this.quiz()?.topic?.slug;
    return slug ? ['/topics', slug] : ['/home'];
  }

  protected scoreGradient(result: QuizResult): string {
    const color = result.passed ? '#34d399' : '#fb7185';
    return `conic-gradient(${color} ${result.score}%, rgba(120, 170, 255, 0.1) 0)`;
  }
}
