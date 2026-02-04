import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, Validators } from '@angular/forms';
import { PollService } from '../../../core/services/poll.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import type {
  PollDetailDto,
  CreatePollRequest,
  CreateQuestionRequest,
  CreateOptionRequest,
  QuestionType,
  OptionType,
} from '../../../core/models/poll.model';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Single choice' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'image_choice', label: 'Image choice (e.g. compare players)' },
  { value: 'text', label: 'Text' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'rating', label: 'Rating (1–5)' },
];

@Component({
  selector: 'app-admin-poll-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-poll-form.component.html',
  styleUrl: './admin-poll-form.component.css',
})
export class AdminPollFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollService = inject(PollService);
  private cloudinary = inject(CloudinaryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  pollId: string | null = null;
  loading = true;
  saving = false;
  error = '';
  questionTypes = QUESTION_TYPES;
  openTypeDropdown = signal<number | null>(null);
  uploadingOption = signal<string | null>(null); // 'qi-oi' when uploading

  get cloudinaryConfigured(): boolean {
    return this.cloudinary.isConfigured;
  }

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
    description: [''],
    isActive: [true],
    startsAt: [''],
    endsAt: [''],
    allowAnonymous: [true],
    questions: this.fb.array<FormGroup>([]),
  });

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.pollId = id;
      this.pollService.getByIdForAdmin(id).subscribe({
        next: (res) => {
          this.loading = false;
          if (res?.success && res.data) {
            this.patchForm(res.data);
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
    } else {
      this.loading = false;
      this.addQuestion();
      this.cdr.detectChanges();
    }
  }

  private patchForm(p: PollDetailDto): void {
    this.form.patchValue({
      title: p.title,
      description: p.description ?? '',
      isActive: p.isActive ?? true,
      startsAt: p.startsAt ? p.startsAt.slice(0, 16) : '',
      endsAt: p.endsAt ? p.endsAt.slice(0, 16) : '',
      allowAnonymous: p.allowAnonymous ?? true,
    });
    this.questions.clear();
    for (const q of p.questions ?? []) {
      const opts = (q.options ?? []).map((o) =>
        this.fb.group({
          type: [(o.type ?? 'TEXT') as OptionType],
          textContent: [o.textContent ?? ''],
          imageUrl: [o.imageUrl ?? ''],
          sortOrder: [o.sortOrder ?? 0],
        })
      );
      this.questions.push(
        this.fb.group({
          type: [q.type as QuestionType],
          title: [q.title, [Validators.required]],
          isRequired: [q.isRequired ?? true],
          allowMultiple: [q.allowMultiple ?? false],
          sortOrder: [q.sortOrder ?? 0],
          options: this.fb.array(opts),
        })
      );
    }
    if (this.questions.length === 0) this.addQuestion();
  }

  addQuestion(): void {
    this.questions.push(
      this.fb.group({
        type: ['single_choice' as QuestionType],
        title: ['', [Validators.required]],
        isRequired: [true],
        allowMultiple: [false],
        sortOrder: [this.questions.length],
        options: this.fb.array([
          this.fb.group({
            type: ['TEXT' as OptionType],
            textContent: [''],
            imageUrl: [''],
            sortOrder: [0],
          }),
          this.fb.group({
            type: ['TEXT' as OptionType],
            textContent: [''],
            imageUrl: [''],
            sortOrder: [1],
          }),
        ]),
      })
    );
    this.cdr.detectChanges();
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    this.cdr.detectChanges();
  }

  optionsOf(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const opts = this.optionsOf(questionIndex);
    opts.push(
      this.fb.group({
        type: ['TEXT' as OptionType],
        textContent: [''],
        imageUrl: [''],
        sortOrder: [opts.length],
      })
    );
    this.cdr.detectChanges();
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    this.optionsOf(questionIndex).removeAt(optionIndex);
    this.cdr.detectChanges();
  }

  needsOptions(type: QuestionType): boolean {
    return ['single_choice', 'multiple_choice', 'yes_no', 'image_choice'].includes(type);
  }

  /** Whether options for this question type can use images (upload). */
  supportsImageOptions(type: QuestionType): boolean {
    return ['single_choice', 'multiple_choice', 'yes_no', 'image_choice'].includes(type);
  }

  onFileSelected(questionIndex: number, optionIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const key = `${questionIndex}-${optionIndex}`;
    this.uploadingOption.set(key);
    this.cloudinary.uploadImage(file).subscribe({
      next: (res) => {
        const opts = this.optionsOf(questionIndex);
        const opt = opts.at(optionIndex);
        if (opt) {
          opt.patchValue({ imageUrl: res.secure_url, type: 'IMAGE' as OptionType });
        }
        this.uploadingOption.set(null);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Image upload failed. Check Cloudinary config (environment).';
        this.uploadingOption.set(null);
        this.cdr.detectChanges();
      },
    });
    input.value = '';
  }

  getQuestionTypeLabel(value: QuestionType | unknown): string {
    const t = this.questionTypes.find((x) => x.value === value);
    return t?.label ?? 'Single choice';
  }

  toggleTypeDropdown(questionIndex: number): void {
    this.openTypeDropdown.update((v) => (v === questionIndex ? null : questionIndex));
  }

  closeTypeDropdown(): void {
    this.openTypeDropdown.set(null);
  }

  selectQuestionType(questionIndex: number, value: QuestionType): void {
    this.questions.at(questionIndex).patchValue({ type: value });
    this.openTypeDropdown.set(null);
    this.cdr.detectChanges();
  }

  buildRequest(): CreatePollRequest {
    const v = this.form.getRawValue();
    const questions: CreateQuestionRequest[] = (v.questions ?? []).map(
      (q: Record<string, unknown>, i: number) => {
        const opts =
          (q['options'] as Array<{
            type?: OptionType;
            textContent?: string;
            imageUrl?: string;
            sortOrder?: number;
          }>) ?? [];
        const options: CreateOptionRequest[] = opts
          .filter((o) => (o.textContent ?? '').trim() !== '' || (o.imageUrl ?? '').trim() !== '')
          .map((o, j) => ({
            type: (o.type ?? 'TEXT') as OptionType,
            textContent: (o.textContent ?? '').trim() || undefined,
            imageUrl: (o.imageUrl ?? '').trim() || undefined,
            sortOrder: j,
          }));
        return {
          type: q['type'] as QuestionType,
          title: (q['title'] as string)?.trim() ?? '',
          isRequired: !!q['isRequired'],
          allowMultiple: !!q['allowMultiple'],
          sortOrder: i,
          options: options.length
            ? options
            : [{ type: 'TEXT', textContent: 'Option', sortOrder: 0 }],
        };
      }
    );
    const toIsoInstant = (s: unknown): string | undefined => {
      const raw = typeof s === 'string' ? s.trim() : '';
      if (!raw) return undefined;
      const d = new Date(raw);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    };
    return {
      title: (v.title as string)?.trim() ?? '',
      description: (v.description as string)?.trim() || undefined,
      isActive: !!v.isActive,
      startsAt: toIsoInstant(v.startsAt),
      endsAt: toIsoInstant(v.endsAt),
      allowAnonymous: !!v.allowAnonymous,
      questions: questions.length
        ? questions
        : [
            {
              type: 'single_choice',
              title: 'Question',
              isRequired: true,
              allowMultiple: false,
              sortOrder: 0,
              options: [
                { type: 'TEXT', textContent: 'Option 1', sortOrder: 0 },
                { type: 'TEXT', textContent: 'Option 2', sortOrder: 1 },
              ],
            },
          ],
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    this.saving = true;
    const body = this.buildRequest();
    const req = this.pollId
      ? this.pollService.update(this.pollId, body)
      : this.pollService.create(body);
    req.subscribe({
      next: (res) => {
        this.saving = false;
        if (res?.success) {
          this.router.navigate(['/admin/polls']);
        } else {
          this.error = res?.message ?? 'Failed to save poll.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        const b = err?.error;
        this.error =
          typeof b === 'object' && b !== null && typeof b.message === 'string'
            ? b.message
            : 'Failed to save poll.';
        this.cdr.detectChanges();
      },
    });
  }
}
