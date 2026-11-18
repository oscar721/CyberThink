import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AdminAttempt,
  AdminLesson,
  AdminQuestion,
  AdminQuiz,
  AdminService,
  AdminStats,
  AdminTopic,
  AdminUser,
  AdminVideo,
} from '../admin.service';
import { Auth } from '../auth';
import type { ImageMetadata } from '../content';
import { Icon } from '../shared/icon/icon';

type AdminTab =
  | 'dashboard'
  | 'topics'
  | 'lessons'
  | 'videos'
  | 'quizzes'
  | 'users'
  | 'results';

type FormKind = 'topics' | 'lessons' | 'videos' | 'quizzes';

interface TopicForm {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageQuery: string;
  order: number;
  published: boolean;
}

interface LessonForm {
  topic: string;
  title: string;
  introduction: string;
  objectivesText: string;
  content: string;
  example: string;
  recommendationsText: string;
  imageUrl: string;
  imageQuery: string;
  order: number;
  published: boolean;
}

interface VideoForm {
  topic: string;
  lesson: string;
  title: string;
  url: string;
  description: string;
  order: number;
  published: boolean;
}

interface QuizForm {
  topic: string;
  lesson: string;
  title: string;
  passingScore: number;
  questions: AdminQuestion[];
  published: boolean;
}

interface UserForm {
  username: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'student';
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule, RouterLink, Icon, DatePipe],
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly activeTab = signal<AdminTab>('dashboard');
  protected readonly menuOpen = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly topics = signal<AdminTopic[]>([]);
  protected readonly lessons = signal<AdminLesson[]>([]);
  protected readonly videos = signal<AdminVideo[]>([]);
  protected readonly quizzes = signal<AdminQuiz[]>([]);
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly results = signal<AdminAttempt[]>([]);

  protected readonly lessonFilter = signal('');
  protected readonly videoFilter = signal('');
  protected readonly quizFilter = signal('');

  protected readonly formKind = signal<FormKind | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly editingImage = signal<ImageMetadata | null>(null);
  protected readonly loadingQuiz = signal(false);
  protected readonly checkingImages = signal(false);
  protected readonly showUserPassword = signal(false);

  protected topicForm: TopicForm = this.emptyTopic();
  protected lessonForm: LessonForm = this.emptyLesson();
  protected videoForm: VideoForm = this.emptyVideo();
  protected quizForm: QuizForm = this.emptyQuiz();
  protected userForm: UserForm = this.emptyUser();

  protected readonly navItems: { tab: AdminTab; label: string; icon: string }[] = [
    { tab: 'dashboard', label: 'Resumen', icon: 'chart' },
    { tab: 'topics', label: 'Módulos', icon: 'book' },
    { tab: 'lessons', label: 'Lecciones', icon: 'list' },
    { tab: 'videos', label: 'Videos', icon: 'play' },
    { tab: 'quizzes', label: 'Cuestionarios', icon: 'clipboard' },
    { tab: 'users', label: 'Usuarios y roles', icon: 'users' },
    { tab: 'results', label: 'Resultados', icon: 'award' },
  ];

  protected readonly tabTitle = computed(() => {
    const titles: Record<AdminTab, string> = {
      dashboard: 'Resumen general',
      topics: 'Módulos',
      lessons: 'Lecciones',
      videos: 'Videos',
      quizzes: 'Cuestionarios',
      users: 'Usuarios y roles',
      results: 'Resultados',
    };

    return titles[this.activeTab()];
  });

  protected readonly formTitle = computed(() => {
    const kind = this.formKind();

    if (!kind) {
      return '';
    }

    const labels: Record<FormKind, string> = {
      topics: 'módulo',
      lessons: 'lección',
      videos: 'video',
      quizzes: 'cuestionario',
    };
    const articles: Record<FormKind, string> = {
      topics: 'Nuevo',
      lessons: 'Nueva',
      videos: 'Nuevo',
      quizzes: 'Nuevo',
    };

    return this.editingId()
      ? `Editar ${labels[kind]}`
      : `${articles[kind]} ${labels[kind]}`;
  });

  protected readonly dashboardStats = computed(() => {
    const data = this.stats();
    const plural = (value: number, singular: string, pluralForm: string) =>
      value === 1 ? singular : pluralForm;

    const users = data?.users ?? 0;
    const students = data?.students ?? 0;
    const topics = data?.topics ?? 0;
    const lessons = data?.lessons ?? 0;
    const videos = data?.videos ?? 0;
    const quizzes = data?.quizzes ?? 0;
    const attempts = data?.attempts ?? 0;

    return [
      { label: plural(users, 'Usuario', 'Usuarios'), value: users, icon: 'users', accent: 'blue', tab: 'users' as AdminTab },
      { label: plural(students, 'Estudiante', 'Estudiantes'), value: students, icon: 'award', accent: 'green', tab: 'users' as AdminTab },
      { label: plural(topics, 'Módulo', 'Módulos'), value: topics, icon: 'book', accent: 'cyan', tab: 'topics' as AdminTab },
      { label: plural(lessons, 'Lección', 'Lecciones'), value: lessons, icon: 'list', accent: 'indigo', tab: 'lessons' as AdminTab },
      { label: plural(videos, 'Video', 'Videos'), value: videos, icon: 'play', accent: 'rose', tab: 'videos' as AdminTab },
      { label: plural(quizzes, 'Cuestionario', 'Cuestionarios'), value: quizzes, icon: 'clipboard', accent: 'amber', tab: 'quizzes' as AdminTab },
      { label: plural(attempts, 'Intento', 'Intentos'), value: attempts, icon: 'chart', accent: 'green', tab: 'results' as AdminTab },
    ];
  });

  protected readonly filteredLessons = computed(() => {
    const filter = this.lessonFilter();
    return filter
      ? this.lessons().filter((lesson) => this.topicIdOf(lesson.topic) === filter)
      : this.lessons();
  });

  protected readonly filteredVideos = computed(() => {
    const filter = this.videoFilter();
    return filter
      ? this.videos().filter((video) => this.topicIdOf(video.topic) === filter)
      : this.videos();
  });

  protected readonly filteredQuizzes = computed(() => {
    const filter = this.quizFilter();
    return filter
      ? this.quizzes().filter((quiz) => this.topicIdOf(quiz.topic) === filter)
      : this.quizzes();
  });

  constructor() {
    this.loadAll();
  }

  protected setTab(tab: AdminTab): void {
    if (this.activeTab() === tab) {
      this.menuOpen.set(false);
      return;
    }

    this.activeTab.set(tab);
    this.menuOpen.set(false);
    this.closeForm();
    this.clearMessages();
  }

  protected refresh(): void {
    this.clearMessages();
    this.loadAll(true, true);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  protected initial(): string {
    return (this.user()?.username ?? '?').charAt(0).toUpperCase();
  }

  protected clearMessages(): void {
    this.message.set('');
    this.error.set('');
  }

  private loadAll(silent = false, notify = false): void {
    if (!silent) {
      this.loading.set(true);
    }

    forkJoin({
      stats: this.admin.stats(),
      topics: this.admin.topics(),
      lessons: this.admin.lessons(),
      videos: this.admin.videos(),
      quizzes: this.admin.quizzes(),
      users: this.admin.users(),
      results: this.admin.results(),
    }).subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.topics.set(data.topics);
        this.lessons.set(data.lessons);
        this.videos.set(data.videos);
        this.quizzes.set(data.quizzes);
        this.users.set(data.users);
        this.results.set(data.results);
        this.loading.set(false);

        if (notify) {
          this.message.set('Datos actualizados correctamente.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ?? 'No se pudieron cargar los datos del panel.',
        );
      },
    });
  }

  private loadStats(): void {
    this.admin.stats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  protected closeForm(): void {
    this.formKind.set(null);
    this.editingId.set(null);
    this.editingImage.set(null);
    this.loadingQuiz.set(false);
  }

  private scrollToForm(): void {
    setTimeout(() => {
      document
        .getElementById('admin-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  private emptyTopic(): TopicForm {
    return {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      imageQuery: '',
      order: 1,
      published: true,
    };
  }

  private emptyLesson(): LessonForm {
    return {
      topic: '',
      title: '',
      introduction: '',
      objectivesText: '',
      content: '',
      example: '',
      recommendationsText: '',
      imageUrl: '',
      imageQuery: '',
      order: 1,
      published: true,
    };
  }

  private emptyVideo(): VideoForm {
    return {
      topic: '',
      lesson: '',
      title: '',
      url: '',
      description: '',
      order: 1,
      published: true,
    };
  }

  private emptyQuiz(): QuizForm {
    return {
      topic: '',
      lesson: '',
      title: '',
      passingScore: 70,
      questions: [this.newQuestion()],
      published: false,
    };
  }

  private emptyUser(): UserForm {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    };
  }

  private newQuestion(): AdminQuestion {
    return {
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    };
  }

  private splitLines(value: string): string[] {
    return (value ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  protected topicIdOf(
    topic: AdminLesson['topic'] | AdminVideo['topic'] | AdminQuiz['topic'] | null | undefined,
  ): string {
    if (!topic) {
      return '';
    }

    return typeof topic === 'string' ? topic : topic._id;
  }

  protected topicNameOf(
    topic: AdminLesson['topic'] | AdminVideo['topic'] | AdminQuiz['topic'] | null | undefined,
  ): string {
    if (!topic) {
      return 'Sin módulo';
    }

    return typeof topic === 'string' ? topic : topic.name;
  }

  protected lessonTitleOf(
    lesson: AdminVideo['lesson'] | AdminQuiz['lesson'] | null | undefined,
  ): string {
    if (!lesson) {
      return 'Sin lección';
    }

    return typeof lesson === 'string' ? lesson : `${lesson.order}. ${lesson.title}`;
  }

  protected lessonIdOf(
    lesson: AdminVideo['lesson'] | AdminQuiz['lesson'] | null | undefined,
  ): string {
    if (!lesson) {
      return '';
    }

    return typeof lesson === 'string' ? lesson : lesson._id;
  }

  protected lessonsForTopic(topicId: string): AdminLesson[] {
    if (!topicId) {
      return [];
    }

    return this.lessons().filter((lesson) => this.topicIdOf(lesson.topic) === topicId);
  }

  protected questionCount(quiz: AdminQuiz): number {
    return quiz.questionCount ?? quiz.questions?.length ?? 0;
  }

  protected roleLabel(role: 'admin' | 'student'): string {
    return role === 'admin' ? 'Administrador' : 'Estudiante';
  }

  protected newTopic(): void {
    this.activeTab.set('topics');
    this.openTopicForm();
  }

  protected newLesson(): void {
    this.activeTab.set('lessons');
    this.openLessonForm();
  }

  protected newVideo(): void {
    this.activeTab.set('videos');
    this.openVideoForm();
  }

  protected newQuiz(): void {
    this.activeTab.set('quizzes');
    this.openQuizForm();
  }

  protected openTopicForm(topic?: AdminTopic): void {
    this.clearMessages();
    this.editingId.set(topic?._id ?? null);
    this.editingImage.set(topic?.image ?? null);
    this.topicForm = topic
      ? {
          name: topic.name,
          slug: topic.slug,
          description: topic.description,
          imageUrl: topic.imageUrl,
          imageQuery: topic.image?.query ?? '',
          order: topic.order,
          published: topic.published,
        }
      : { ...this.emptyTopic(), order: this.topics().length + 1 };
    this.formKind.set('topics');
    this.scrollToForm();
  }

  protected openLessonForm(lesson?: AdminLesson): void {
    this.clearMessages();
    this.editingId.set(lesson?._id ?? null);
    this.editingImage.set(lesson?.image ?? null);
    this.lessonForm = lesson
      ? {
          topic: this.topicIdOf(lesson.topic),
          title: lesson.title,
          introduction: lesson.introduction,
          objectivesText: (lesson.objectives ?? []).join('\n'),
          content: lesson.content,
          example: lesson.example,
          recommendationsText: (lesson.recommendations ?? []).join('\n'),
          imageUrl: lesson.imageUrl,
          imageQuery: lesson.image?.query ?? '',
          order: lesson.order,
          published: lesson.published,
        }
      : {
          ...this.emptyLesson(),
          topic: this.lessonFilter() || this.topics()[0]?._id || '',
          order:
            this.lessonsForTopic(this.lessonFilter() || this.topics()[0]?._id || '').length + 1,
        };
    this.formKind.set('lessons');
    this.scrollToForm();
  }

  protected openVideoForm(video?: AdminVideo): void {
    this.clearMessages();
    this.editingId.set(video?._id ?? null);
    this.videoForm = video
      ? {
          topic: this.topicIdOf(video.topic),
          lesson: this.lessonIdOf(video.lesson),
          title: video.title,
          url: video.url,
          description: video.description,
          order: video.order,
          published: video.published,
        }
      : {
          ...this.emptyVideo(),
          topic: this.videoFilter() || this.topics()[0]?._id || '',
        };
    this.formKind.set('videos');
    this.scrollToForm();
  }

  protected openQuizForm(quiz?: AdminQuiz): void {
    this.clearMessages();
    this.editingId.set(quiz?._id ?? null);
    this.loadingQuiz.set(false);
    this.formKind.set('quizzes');

    if (!quiz) {
      this.quizForm = {
        ...this.emptyQuiz(),
        topic: this.quizFilter() || this.topics()[0]?._id || '',
      };
      this.scrollToForm();
      return;
    }

    this.quizForm = {
      topic: this.topicIdOf(quiz.topic),
      lesson: this.lessonIdOf(quiz.lesson),
      title: quiz.title,
      passingScore: quiz.passingScore,
      questions: [],
      published: quiz.published,
    };
    this.loadingQuiz.set(true);
    this.scrollToForm();

    this.admin.quiz(quiz._id).subscribe({
      next: (detail) => {
        this.fillQuizForm(detail);
        this.loadingQuiz.set(false);
      },
      error: (err) => {
        this.loadingQuiz.set(false);
        this.error.set(
          err?.error?.message ?? 'No se pudo cargar el cuestionario completo.',
        );
        this.closeForm();
      },
    });
  }

  private fillQuizForm(quiz: AdminQuiz): void {
    const questions = quiz.questions?.length
      ? quiz.questions
      : [this.newQuestion()];

    this.quizForm = {
      topic: this.topicIdOf(quiz.topic),
      lesson: this.lessonIdOf(quiz.lesson),
      title: quiz.title,
      passingScore: quiz.passingScore,
      questions: questions.map((question) => ({
        text: question.text,
        options: [0, 1, 2, 3].map((index) => question.options?.[index] ?? ''),
        correctIndex: Math.max(
          0,
          Math.min(3, Number(question.correctIndex) || 0),
        ),
        explanation: question.explanation ?? '',
      })),
      published: quiz.published,
    };
  }

  protected setVideoTopic(topicId: string): void {
    this.videoForm.topic = topicId;

    const selected = this.lessonIdOf(
      this.lessonsForTopic(topicId).find((lesson) => lesson._id === this.videoForm.lesson),
    );

    if (!selected) {
      this.videoForm.lesson = '';
    }
  }

  protected setQuizTopic(topicId: string): void {
    this.quizForm.topic = topicId;

    const selected = this.lessonIdOf(
      this.lessonsForTopic(topicId).find((lesson) => lesson._id === this.quizForm.lesson),
    );

    if (!selected) {
      this.quizForm.lesson = '';
    }
  }

  protected addQuestion(): void {
    this.quizForm = {
      ...this.quizForm,
      questions: [...this.quizForm.questions, this.newQuestion()],
    };
  }

  protected removeQuestion(index: number): void {
    if (this.quizForm.questions.length <= 1) {
      return;
    }

    this.quizForm = {
      ...this.quizForm,
      questions: this.quizForm.questions.filter((_, position) => position !== index),
    };
  }

  protected setCorrect(questionIndex: number, optionIndex: number): void {
    this.quizForm.questions[questionIndex].correctIndex = optionIndex;
  }

  protected saveTopic(): void {
    this.clearMessages();

    if (!this.topicForm.name.trim()) {
      this.error.set('El nombre del módulo es obligatorio.');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const payload = { ...this.topicForm };
    const request = id
      ? this.admin.updateTopic(id, payload)
      : this.admin.createTopic(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set(
          id
            ? 'Módulo actualizado.'
            : 'Módulo creado. La imagen se asigna automáticamente en segundo plano.',
        );
        this.closeForm();
        this.loadAll(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el módulo.');
      },
    });
  }

  protected saveLesson(): void {
    this.clearMessages();

    if (!this.lessonForm.topic) {
      this.error.set('Selecciona un módulo.');
      return;
    }

    if (!this.lessonForm.title.trim()) {
      this.error.set('El título de la lección es obligatorio.');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const payload = {
      topic: this.lessonForm.topic,
      title: this.lessonForm.title,
      introduction: this.lessonForm.introduction,
      objectives: this.splitLines(this.lessonForm.objectivesText),
      content: this.lessonForm.content,
      example: this.lessonForm.example,
      recommendations: this.splitLines(this.lessonForm.recommendationsText),
      imageUrl: this.lessonForm.imageUrl,
      imageQuery: this.lessonForm.imageQuery,
      order: this.lessonForm.order,
      published: this.lessonForm.published,
    };
    const request = id
      ? this.admin.updateLesson(id, payload)
      : this.admin.createLesson(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set(
          id
            ? 'Lección actualizada.'
            : 'Lección creada. La imagen se asigna automáticamente en segundo plano.',
        );
        this.closeForm();
        this.loadAll(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar la lección.');
      },
    });
  }

  protected saveVideo(): void {
    this.clearMessages();

    if (!this.videoForm.topic) {
      this.error.set('Selecciona un módulo.');
      return;
    }

    if (!this.videoForm.title.trim()) {
      this.error.set('El título del video es obligatorio.');
      return;
    }

    if (this.videoForm.url && !/^https?:\/\//i.test(this.videoForm.url)) {
      this.error.set('La URL del video debe comenzar con http(s)://');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const payload = {
      topic: this.videoForm.topic,
      lesson: this.videoForm.lesson || null,
      title: this.videoForm.title,
      url: this.videoForm.url,
      description: this.videoForm.description,
      order: this.videoForm.order,
      published: this.videoForm.published,
    };
    const request = id
      ? this.admin.updateVideo(id, payload)
      : this.admin.createVideo(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set(id ? 'Video actualizado.' : 'Video creado.');
        this.closeForm();
        this.loadAll(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el video.');
      },
    });
  }

  private normalizedQuestions(): AdminQuestion[] {
    return this.quizForm.questions.map((question) => {
      const options = [0, 1, 2, 3].map((index) =>
        (question.options?.[index] ?? '').trim(),
      );

      return {
        text: (question.text ?? '').trim(),
        options,
        correctIndex: Math.max(
          0,
          Math.min(3, Number(question.correctIndex) || 0),
        ),
        explanation: (question.explanation ?? '').trim(),
      };
    });
  }

  protected saveQuiz(): void {
    this.clearMessages();

    if (this.loadingQuiz()) {
      return;
    }

    if (!this.quizForm.topic) {
      this.error.set('Selecciona un módulo.');
      return;
    }

    if (!this.quizForm.title.trim()) {
      this.error.set('El título del cuestionario es obligatorio.');
      return;
    }

    const missingCorrect = this.quizForm.questions.some(
      (question) => !(question.options[question.correctIndex] ?? '').trim(),
    );

    if (missingCorrect) {
      this.error.set('Marca una respuesta correcta válida en cada pregunta.');
      return;
    }

    const questions = this.normalizedQuestions();

    if (
      questions.some(
        (question) =>
          !question.text ||
          question.options.length !== 4 ||
          !question.options.every(Boolean) ||
          !question.explanation,
      )
    ) {
      this.error.set(
        'Cada pregunta necesita un enunciado, cuatro opciones y una explicación.',
      );
      return;
    }

    if (this.quizForm.published && questions.length < 20) {
      this.error.set('Publica solo cuando el cuestionario tenga al menos 20 preguntas.');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const passingScore = Math.min(
      100,
      Math.max(0, Number(this.quizForm.passingScore) || 0),
    );
    const payload = {
      topic: this.quizForm.topic,
      lesson: this.quizForm.lesson || null,
      title: this.quizForm.title,
      passingScore,
      questions,
      published: this.quizForm.published,
    };
    const request = id
      ? this.admin.updateQuiz(id, payload)
      : this.admin.createQuiz(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set(id ? 'Cuestionario actualizado.' : 'Cuestionario creado.');
        this.closeForm();
        this.loadAll(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el cuestionario.');
      },
    });
  }

  protected toggleTopic(topic: AdminTopic): void {
    this.clearMessages();
    this.admin
      .updateTopic(topic._id, {
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        imageUrl: topic.imageUrl,
        order: topic.order,
        published: !topic.published,
      })
      .subscribe({
        next: () => {
          this.message.set(
            topic.published ? 'Módulo despublicado.' : 'Módulo publicado.',
          );
          this.loadAll(true);
        },
        error: (err) =>
          this.error.set(err?.error?.message ?? 'No se pudo cambiar la publicación.'),
      });
  }

  protected toggleLesson(lesson: AdminLesson): void {
    this.clearMessages();
    this.admin
      .updateLesson(lesson._id, {
        topic: this.topicIdOf(lesson.topic),
        title: lesson.title,
        introduction: lesson.introduction,
        objectives: lesson.objectives,
        content: lesson.content,
        example: lesson.example,
        recommendations: lesson.recommendations,
        imageUrl: lesson.imageUrl,
        order: lesson.order,
        published: !lesson.published,
      })
      .subscribe({
        next: () => {
          this.message.set(
            lesson.published ? 'Lección despublicada.' : 'Lección publicada.',
          );
          this.loadAll(true);
        },
        error: (err) =>
          this.error.set(err?.error?.message ?? 'No se pudo cambiar la publicación.'),
      });
  }

  protected toggleVideo(video: AdminVideo): void {
    this.clearMessages();
    this.admin
      .updateVideo(video._id, {
        topic: this.topicIdOf(video.topic),
        lesson: this.lessonIdOf(video.lesson) || null,
        title: video.title,
        url: video.url,
        description: video.description,
        order: video.order,
        published: !video.published,
      })
      .subscribe({
        next: () => {
          this.message.set(
            video.published ? 'Video despublicado.' : 'Video publicado.',
          );
          this.loadAll(true);
        },
        error: (err) =>
          this.error.set(err?.error?.message ?? 'No se pudo cambiar la publicación.'),
      });
  }

  protected toggleQuiz(quiz: AdminQuiz): void {
    this.clearMessages();
    const published = !quiz.published;

    this.admin.setQuizPublished(quiz._id, published).subscribe({
      next: () => {
        this.quizzes.update((quizzes) =>
          quizzes.map((item) =>
            item._id === quiz._id ? { ...item, published } : item,
          ),
        );
        this.message.set(
          published ? 'Cuestionario publicado.' : 'Cuestionario despublicado.',
        );
        this.loadStats();
      },
      error: (err) =>
        this.error.set(err?.error?.message ?? 'No se pudo cambiar la publicación.'),
    });
  }

  protected regenerateTopicImage(): void {
    const id = this.editingId();

    if (!id || this.saving()) {
      return;
    }

    this.clearMessages();
    this.saving.set(true);

    this.admin.assignTopicImage(id, this.topicForm.imageQuery).subscribe({
      next: ({ image, imageUrl }) => {
        this.editingImage.set(image);
        this.topicForm.imageUrl = imageUrl;
        this.saving.set(false);
        this.message.set('Imagen del módulo actualizada.');
        this.loadAll(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err?.error?.message ?? 'No se pudo obtener una imagen para el módulo.',
        );
      },
    });
  }

  protected regenerateLessonImage(): void {
    const id = this.editingId();

    if (!id || this.saving()) {
      return;
    }

    this.clearMessages();
    this.saving.set(true);

    this.admin.assignLessonImage(id, this.lessonForm.imageQuery).subscribe({
      next: ({ image, imageUrl }) => {
        this.editingImage.set(image);
        this.lessonForm.imageUrl = imageUrl;
        this.saving.set(false);
        this.message.set('Imagen de la lección actualizada.');
        this.loadAll(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err?.error?.message ?? 'No se pudo obtener una imagen para la lección.',
        );
      },
    });
  }

  protected checkImages(): void {
    if (this.checkingImages()) {
      return;
    }

    this.clearMessages();
    this.checkingImages.set(true);

    this.admin.checkImages().subscribe({
      next: (summary) => {
        this.checkingImages.set(false);

        if (summary.skipped) {
          this.message.set('La verificación de imágenes ya está en curso.');
        } else {
          this.message.set(
            `Imágenes verificadas: ${summary.available}/${summary.checked} disponibles, ${summary.repaired} reemplazadas, ${summary.failed} fallidas.`,
          );
        }

        this.loadAll(true);
      },
      error: (err) => {
        this.checkingImages.set(false);
        this.error.set(
          err?.error?.message ?? 'No se pudieron verificar las imágenes.',
        );
      },
    });
  }

  protected newUser(): void {
    this.activeTab.set('users');
    this.closeForm();
    this.clearMessages();
    this.userForm = this.emptyUser();
    this.showUserPassword.set(false);
    setTimeout(() => {
      document
        .getElementById('user-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  protected saveUser(): void {
    this.clearMessages();

    const username = this.userForm.username.trim().toLowerCase();
    const password = this.userForm.password;

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      this.error.set(
        'El usuario debe tener entre 3 y 32 caracteres y usar solo minúsculas, números, punto, guion o guion bajo.',
      );
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      this.error.set(
        'La contraseña debe tener al menos 8 caracteres e incluir una letra y un número.',
      );
      return;
    }

    if (password !== this.userForm.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.saving.set(true);

    this.admin
      .createUser({
        username,
        password,
        role: this.userForm.role,
      })
      .subscribe({
        next: (created) => {
          this.users.update((users) =>
            [...users, created].sort((a, b) =>
              a.username.localeCompare(b.username),
            ),
          );
          this.userForm = this.emptyUser();
          this.showUserPassword.set(false);
          this.saving.set(false);
          this.message.set(`Usuario ${created.username} creado.`);
          this.loadStats();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? 'No se pudo crear el usuario.');
        },
      });
  }

  protected deleteTopic(topic: AdminTopic): void {
    if (
      !confirm(
        `¿Eliminar el módulo "${topic.name}"? También se eliminarán sus lecciones, videos y cuestionarios sin intentos registrados.`,
      )
    ) {
      return;
    }

    this.clearMessages();
    this.admin.deleteTopic(topic._id).subscribe({
      next: () => {
        this.message.set('Módulo eliminado.');
        this.loadAll(true);
      },
      error: (err) =>
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el módulo.'),
    });
  }

  protected deleteLesson(lesson: AdminLesson): void {
    if (!confirm(`¿Eliminar la lección "${lesson.title}"?`)) {
      return;
    }

    this.clearMessages();
    this.admin.deleteLesson(lesson._id).subscribe({
      next: () => {
        this.message.set('Lección eliminada.');
        this.loadAll(true);
      },
      error: (err) =>
        this.error.set(err?.error?.message ?? 'No se pudo eliminar la lección.'),
    });
  }

  protected deleteVideo(video: AdminVideo): void {
    if (!confirm(`¿Eliminar el video "${video.title}"?`)) {
      return;
    }

    this.clearMessages();
    this.admin.deleteVideo(video._id).subscribe({
      next: () => {
        this.message.set('Video eliminado.');
        this.loadAll(true);
      },
      error: (err) =>
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el video.'),
    });
  }

  protected deleteQuiz(quiz: AdminQuiz): void {
    if (!confirm(`¿Eliminar el cuestionario "${quiz.title}"?`)) {
      return;
    }

    this.clearMessages();
    this.admin.deleteQuiz(quiz._id).subscribe({
      next: () => {
        this.message.set('Cuestionario eliminado.');
        this.loadAll(true);
      },
      error: (err) =>
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el cuestionario.'),
    });
  }

  protected changeRole(
    user: AdminUser,
    role: 'admin' | 'student',
    event: Event,
  ): void {
    const select = event.target as HTMLSelectElement;

    if (this.user()?.username === user.username) {
      select.value = user.role;
      this.error.set('No puedes cambiar tu propio rol.');
      return;
    }

    if (
      !confirm(
        `¿Cambiar el rol de ${user.username} a ${this.roleLabel(role).toLowerCase()}?`,
      )
    ) {
      select.value = user.role;
      return;
    }

    this.clearMessages();
    this.admin.updateUserRole(user._id, role).subscribe({
      next: (updated) => {
        this.users.update((users) =>
          users.map((item) =>
            item._id === user._id ? { ...item, role: updated.role } : item,
          ),
        );
        this.message.set(
          `Rol de ${user.username} actualizado a ${this.roleLabel(updated.role).toLowerCase()}.`,
        );
        this.loadStats();
      },
      error: (err) => {
        select.value = user.role;
        this.error.set(err?.error?.message ?? 'No se pudo actualizar el rol.');
      },
    });
  }
}
