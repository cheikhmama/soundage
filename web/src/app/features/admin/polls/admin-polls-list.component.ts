import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import type { PollDto } from '../../../core/models/poll.model';

const STATUS_OPTIONS: { value: 'all' | 'active' | 'inactive'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

@Component({
  selector: 'app-admin-polls-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-polls-list.component.html',
  styleUrl: './admin-polls-list.component.css',
})
export class AdminPollsListComponent implements OnInit {
  private pollService = inject(PollService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  polls: PollDto[] = [];
  loading = true;
  error = '';
  deletingId: string | null = null;
  readonly skeletonRowIndices = Array.from({ length: 4 }, (_, i) => i);

  search = '';
  status: 'all' | 'active' | 'inactive' = 'all';
  startDate = '';
  endDate = '';

  readonly statusOptions = STATUS_OPTIONS;
  openStatusDropdown = signal(false);
  filtersModalOpen = signal(false);

  getStatusLabel(): string {
    return STATUS_OPTIONS.find((o) => o.value === this.status)?.label ?? 'All';
  }

  toggleStatusDropdown(): void {
    this.openStatusDropdown.update((v) => !v);
  }

  selectStatus(value: 'all' | 'active' | 'inactive'): void {
    this.status = value;
    this.openStatusDropdown.set(false);
    this.applyParams();
  }

  openFiltersModal(): void {
    this.openStatusDropdown.set(false);
    this.filtersModalOpen.set(true);
  }

  closeFiltersModal(): void {
    this.openStatusDropdown.set(false);
    this.filtersModalOpen.set(false);
  }

  applyFiltersAndCloseModal(): void {
    this.applyParams();
    this.closeFiltersModal();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((qp) => {
      this.search = qp['search'] ?? '';
      const statusParam = qp['status'];
      if (statusParam === 'true') this.status = 'active';
      else if (statusParam === 'false') this.status = 'inactive';
      else this.status = 'all';
      this.startDate = this.parseDateFromParam(qp['startDate']);
      this.endDate = this.parseDateFromParam(qp['endDate']);
      this.loadPolls();
    });
  }

  private parseDateFromParam(value: string | undefined): string {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.applyParams();
  }

  onStatusChange(value: 'all' | 'active' | 'inactive'): void {
    this.status = value;
    this.applyParams();
  }

  onStartDateChange(value: string): void {
    this.startDate = value;
    this.applyParams();
  }

  onEndDateChange(value: string): void {
    this.endDate = value;
    this.applyParams();
  }

  private applyParams(): void {
    const q: Record<string, string> = {};
    if (this.search.trim()) q['search'] = this.search.trim();
    if (this.status === 'active') q['status'] = 'true';
    if (this.status === 'inactive') q['status'] = 'false';
    if (this.startDate) q['startDate'] = this.toISOStartOfDay(this.startDate);
    if (this.endDate) q['endDate'] = this.toISOEndOfDay(this.endDate);
    this.router.navigate([], { queryParams: q, queryParamsHandling: '' });
  }

  private toISOStartOfDay(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00.000Z').toISOString();
  }

  private toISOEndOfDay(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T23:59:59.999Z').toISOString();
  }

  loadPolls(): void {
    this.loading = true;
    this.error = '';
    const startDateParam = this.startDate ? this.toISOStartOfDay(this.startDate) : undefined;
    const endDateParam = this.endDate ? this.toISOEndOfDay(this.endDate) : undefined;
    this.pollService
      .listAllForAdmin({
        search: this.search || undefined,
        status: this.status === 'all' ? undefined : this.status,
        startDate: startDateParam,
        endDate: endDateParam,
      })
      .subscribe({
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
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  deletePoll(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.deletingId) return;
    if (!confirm('Delete this poll? This cannot be undone.')) return;
    this.deletingId = id;
    this.pollService.delete(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.polls = this.polls.filter((p) => p.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete poll.';
        this.cdr.detectChanges();
      },
    });
  }
}
