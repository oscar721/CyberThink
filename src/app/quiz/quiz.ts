import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ContentService,
  QuizAnswer,
  QuizAttempt,
  QuizResult,
  QuizResultDetail,
} from '../content';
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

  protected readonly quiz = signal<QuizAttempt | null>(null);
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
    this.loadAttempt();
  }

  private loadAttempt(): void {
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.content.startQuiz(this.quizId).subscribe({
      next: (attempt) => {
        this.answers.set(new Array(attempt.questions.length).fill(null));
        this.quiz.set(attempt);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo iniciar la evaluación');
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
    const quiz = this.quiz();
    const answers = this.answers();

    if (
      !quiz ||
      answers.some((answer) => answer === null) ||
      this.submitting()
    ) {
      return;
    }

    const payload: QuizAnswer[] = quiz.questions.map((question, index) => ({
      questionKey: question.key,
      selectedIndex: answers[index] as number,
    }));

    this.submitting.set(true);
    this.error.set('');

    this.content.submitAttempt(quiz.attemptId, payload).subscribe({
      next: (result) => {
        this.result.set(result);
        this.submitting.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo enviar la evaluación');
        this.submitting.set(false);
      },
    });
  }

  protected retry(): void {
    this.loadAttempt();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected optionText(item: QuizResultDetail, optionIndex: number): string {
    return item.options?.[optionIndex] ?? '—';
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
