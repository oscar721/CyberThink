import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, QuizData, QuizResult } from '../content';
import { Auth } from '../auth';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-quiz',
  imports: [RouterLink, Header],
  styleUrl: './quiz.css',
  templateUrl: './quiz.html',
})
export class QuizPage {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Auth);
  private readonly quizId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly quiz = signal<QuizData | null>(null);
  protected readonly answers = signal<(number | null)[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly result = signal<QuizResult | null>(null);

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

  select(index: number, value: number): void {
    this.answers.update((answers) =>
      answers.map((current, position) => (position === index ? value : current)),
    );
  }

  submit(): void {
    const answers = this.answers();

    if (!this.quiz() || answers.some((answer) => answer === null)) {
      return;
    }

    this.submitting.set(true);

    this.content
      .submitQuiz(this.quizId, answers as number[], this.auth.user() ?? '')
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.submitting.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'No se pudo enviar el cuestionario');
          this.submitting.set(false);
        },
      });
  }
}
