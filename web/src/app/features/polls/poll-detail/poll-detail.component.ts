import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormArray,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { PollService } from '../../../core/services/poll.service';
import { AuthService } from '../../../core/services/auth.service';
import type {
  PollDetailDto,
  QuestionDto,
  OptionDto,
  AnswerInputDto,
} from '../../../core/models/poll.model';

type AnswerForm = FormGroup<{
  questionId: FormControl<string>;
  optionId: FormControl<string | null>;
  optionIds: FormControl<string[]>;
  textValue: FormControl<string>;
  numericValue: FormControl<number | null>;
}>;

@Component({
  selector: 'app-poll-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './poll-detail.component.html',
  styleUrl: './poll-detail.component.css',
})
export class PollDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pollService = inject(PollService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  poll = signal<PollDetailDto | null>(null);
  loading = true;
  submitted = false;
  submitMessage = '';
  error = '';
  submitLoading = false;
  questions = signal<QuestionDto[]>([]);

  form = this.fb.group({
    answers: this.fb.array<AnswerForm>([]),
  });

  get answers(): FormArray<AnswerForm> {
    return this.form.get('answers') as FormArray<AnswerForm>;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid poll.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    const anonymousId = this.auth.isLoggedIn() ? undefined : this.getAnonymousId();
    this.pollService.getById(id, anonymousId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success && res.data) {
          this.poll.set(res.data);
          this.questions.set(res.data.questions ?? []);
          this.buildAnswerControls(res.data.questions ?? []);
        } else {
          this.error = res?.message ?? 'Poll not found.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load poll.';
        this.cdr.detectChanges();
      },
    });
  }

  private buildAnswerControls(questions: QuestionDto[]): void {
    const arr = this.answers;
    arr.clear();
    for (const q of questions) {
      arr.push(
        this.fb.group({
          questionId: this.fb.nonNullable.control(q.id),
          optionId: this.fb.control<string | null>(null),
          optionIds: this.fb.control<string[]>([]),
          textValue: this.fb.nonNullable.control(''),
          numericValue: this.fb.control<number | null>(null),
        }) as AnswerForm
      );
    }
  }

  isSingleChoice(type: string): boolean {
    return type === 'single_choice' || type === 'yes_no' || type === 'image_choice';
  }

  isMultipleChoice(type: string): boolean {
    return type === 'multiple_choice';
  }

  isText(type: string): boolean {
    return type === 'text';
  }

  isRating(type: string): boolean {
    return type === 'rating';
  }

  hasImageOptions(options: QuestionDto['options']): boolean {
    return options?.some((o) => !!o?.imageUrl) ?? false;
  }

  canVote(poll: PollDetailDto | null): boolean {
    if (!poll?.isActive) return false;
    const now = new Date();
    if (poll.startsAt && new Date(poll.startsAt) > now) return false;
    if (poll.endsAt && new Date(poll.endsAt) < now) return false;
    return true;
  }

  /** One stable id per browser so the same person cannot vote twice (backend allows one response per anonymousId per poll). */
  getAnonymousId(): string {
    const key = 'soundage_anonymous_id';
    let id = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID?.() ?? `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, id);
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  onSubmit(): void {
    if (this.submitLoading) return;
    const p = this.poll();
    if (!p || !this.canVote(p)) return;
    const questions = this.questions();
    const raw = this.form.getRawValue();
    const answerList: AnswerInputDto[] = [];
    for (let i = 0; i < (raw.answers?.length ?? 0); i++) {
      const a = raw.answers![i];
      const q = questions[i];
      if (!q) continue;
      const single = this.isSingleChoice(q.type);
      const multi = this.isMultipleChoice(q.type);
      const text = this.isText(q.type);
      const rating = this.isRating(q.type);
      if (single && a.optionId) {
        answerList.push({ questionId: q.id, optionId: a.optionId });
      } else if (multi && a.optionIds?.length) {
        answerList.push({ questionId: q.id, optionIds: a.optionIds });
      } else if (text && a.textValue?.trim()) {
        answerList.push({ questionId: q.id, textValue: a.textValue.trim() });
      } else if (rating && a.numericValue != null) {
        answerList.push({ questionId: q.id, numericValue: a.numericValue });
      } else if (q.isRequired) {
        this.error = `Please answer: ${q.title}`;
        this.cdr.detectChanges();
        return;
      }
    }
    this.error = '';
    this.submitLoading = true;
    const anonymousId = this.auth.isLoggedIn() ? undefined : this.getAnonymousId();
    this.pollService.submitVote(p.id, { anonymousId, answers: answerList }).subscribe({
      next: (res) => {
        this.submitLoading = false;
        if (res?.success) {
          this.submitted = true;
          this.submitMessage = res?.data?.message ?? res?.message ?? 'Your vote has been recorded.';
        } else {
          this.error = res?.message ?? 'Failed to submit vote.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitLoading = false;
        const body = err?.error;
        this.error =
          typeof body === 'object' && body !== null && typeof body.message === 'string'
            ? body.message
            : 'Failed to submit vote.';
        this.cdr.detectChanges();
      },
    });
  }

  onSingleSelect(questionIndex: number, optionId: string): void {
    const control = this.answers.at(questionIndex);
    if (control) {
      control.patchValue({ optionId, optionIds: [] });
    }
  }

  onMultipleToggle(questionIndex: number, optionId: string, checked: boolean): void {
    const control = this.answers.at(questionIndex);
    if (!control) return;
    const current: string[] = control.value.optionIds ?? [];
    let next: string[];
    if (checked) {
      next = current.includes(optionId) ? current : [...current, optionId];
    } else {
      next = current.filter((id) => id !== optionId);
    }
    control.patchValue({ optionIds: next, optionId: null });
  }
}
