import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import type { PollDto } from '../../../core/models/poll.model';

@Component({
  selector: 'app-polls-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './polls-list.component.html',
  styleUrl: './polls-list.component.css',
})
export class PollsListComponent implements OnInit {
  private pollService = inject(PollService);
  private cdr = inject(ChangeDetectorRef);
  polls: PollDto[] = [];
  loading = true;
  error = '';
  readonly skeletonCount = 3;

  ngOnInit(): void {
    this.pollService.listActive().subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success && Array.isArray(res.data)) {
          this.polls = res.data;
        } else {
          this.error = res?.message ?? 'Failed to load polls.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load polls.';
        this.cdr.detectChanges();
      },
    });
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  canVote(poll: PollDto): boolean {
    if (!poll.isActive) return false;
    const now = new Date();
    if (poll.startsAt && new Date(poll.startsAt) > now) return false;
    if (poll.endsAt && new Date(poll.endsAt) < now) return false;
    return true;
  }

  pollStatusLabel(poll: PollDto): string {
    if (!poll.isActive) return 'Inactive';
    const now = new Date();
    if (poll.startsAt && new Date(poll.startsAt) > now) return 'Not started';
    if (poll.endsAt && new Date(poll.endsAt) < now) return 'Ended';
    return 'Vote';
  }
}
