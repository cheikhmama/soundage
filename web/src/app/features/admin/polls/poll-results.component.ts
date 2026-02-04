import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import type {
  PollResultsDto,
  QuestionResultDto,
  OptionCountDto,
} from '../../../core/models/poll.model';

@Component({
  selector: 'app-poll-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './poll-results.component.html',
  styleUrl: './poll-results.component.css',
})
export class PollResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pollService = inject(PollService);
  private cdr = inject(ChangeDetectorRef);

  results = null as PollResultsDto | null;
  loading = true;
  error = '';

  /** Expose Math for template (e.g. Math.max). */
  readonly Math = Math;

  /** Max count for scaling bar width (percentage of max). */
  maxOptionCount(question: QuestionResultDto): number {
    const counts = question.optionCounts?.map((o) => o.count) ?? [];
    return Math.max(1, ...counts);
  }

  maxRatingCount(question: QuestionResultDto): number {
    const counts = question.ratingDistribution?.map((r) => r.count) ?? [];
    return Math.max(1, ...counts);
  }

  isChoice(type: string): boolean {
    const t = (type ?? '').toLowerCase();
    return (
      t === 'single_choice' || t === 'multiple_choice' || t === 'yes_no' || t === 'image_choice'
    );
  }

  isRating(type: string): boolean {
    return (type ?? '').toLowerCase() === 'rating';
  }

  isText(type: string): boolean {
    return (type ?? '').toLowerCase() === 'text';
  }

  /** Whether any option in the list has an image URL (for grid layout and img display). */
  hasOptionImages(optionCounts: QuestionResultDto['optionCounts']): boolean {
    return optionCounts?.some((o) => !!(o as OptionCountDto).imageUrl) ?? false;
  }

  /** Option image URL for binding (ensures template sees the value from API). */
  getOptionImageUrl(opt: OptionCountDto): string | null {
    const url = (opt as OptionCountDto).imageUrl;
    return url && typeof url === 'string' ? url : null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid poll.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    this.pollService.getResults(id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success && res.data) {
          this.results = res.data;
        } else {
          this.error = res?.message ?? 'Failed to load results.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load results.';
        this.cdr.detectChanges();
      },
    });
  }
}
