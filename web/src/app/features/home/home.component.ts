import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PollService } from '../../core/services/poll.service';
import { UserService } from '../../core/services/user.service';
import type { PollDto } from '../../core/models/poll.model';

export interface DashboardStats {
  totalPolls: number;
  activePolls: number;
  endedPolls: number;
  notStartedPolls: number;
  totalUsers: number;
}

export interface BarChartItem {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

export interface MonthBarItem {
  month: string;
  year: number;
  count: number;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private pollService = inject(PollService);
  private userService = inject(UserService);

  readonly user = this.auth.user;
  loading = signal(true);
  error = signal('');
  polls = signal<PollDto[]>([]);
  stats = signal<DashboardStats>({
    totalPolls: 0,
    activePolls: 0,
    endedPolls: 0,
    notStartedPolls: 0,
    totalUsers: 0,
  });

  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  /** Bar chart: poll status distribution (for horizontal bar chart). */
  readonly statusBarData = computed<BarChartItem[]>(() => {
    const s = this.stats();
    const total = s.totalPolls || 1;
    return [
      { label: 'Active', value: s.activePolls, color: '#10b981', percentage: (100 * s.activePolls) / total },
      { label: 'Ended', value: s.endedPolls, color: '#f59e0b', percentage: (100 * s.endedPolls) / total },
      { label: 'Not started', value: s.notStartedPolls, color: '#6366f1', percentage: (100 * s.notStartedPolls) / total },
    ].filter((d) => d.value > 0);
  });

  /** Donut chart: same status breakdown with angles. */
  readonly statusDonutData = computed<DonutSegment[]>(() => {
    const s = this.stats();
    const total = s.totalPolls || 1;
    const items: DonutSegment[] = [
      { label: 'Active', value: s.activePolls, color: '#10b981', percentage: (100 * s.activePolls) / total, startAngle: 0, endAngle: 0 },
      { label: 'Ended', value: s.endedPolls, color: '#f59e0b', percentage: (100 * s.endedPolls) / total, startAngle: 0, endAngle: 0 },
      { label: 'Not started', value: s.notStartedPolls, color: '#6366f1', percentage: (100 * s.notStartedPolls) / total, startAngle: 0, endAngle: 0 },
    ].filter((d) => d.value > 0);
    let angle = 0;
    for (const seg of items) {
      seg.startAngle = angle;
      angle += (seg.value / total) * 360;
      seg.endAngle = angle;
    }
    return items;
  });

  /** Vertical bar chart: polls created per month (from polls list). */
  readonly pollsByMonthData = computed<MonthBarItem[]>(() => {
    const list = this.polls();
    const byKey = new Map<string, number>();
    for (const p of list) {
      const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      byKey.set(key, (byKey.get(key) ?? 0) + 1);
    }
    const months: MonthBarItem[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sorted = [...byKey.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    for (const [key, count] of sorted) {
      const [y, m] = key.split('-').map(Number);
      months.push({ month: key, year: y, count, label: `${monthNames[m - 1]} ${y}` });
    }
    return months;
  });

  /** Recent polls (last 5) for admin. */
  readonly recentPolls = computed(() => this.polls().slice().sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  }).slice(0, 5));

  /** Max count for month bars scale. */
  readonly maxMonthCount = computed(() => {
    const data = this.pollsByMonthData();
    return Math.max(1, ...data.map((d) => d.count));
  });

  /** Conic gradient for donut chart (e.g. "conic-gradient(#10b981 0deg 120deg, #f59e0b 120deg 240deg)"). */
  donutConicGradient(): string {
    const segments = this.statusDonutData();
    if (segments.length === 0) return 'conic-gradient(#e2e8f0 0deg 360deg)';
    const parts = segments.map((s) => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`);
    return `conic-gradient(${parts.join(', ')})`;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    const isAdmin = this.user()?.role === 'ADMIN';

    if (isAdmin) {
      this.pollService.listAllForAdmin().subscribe({
        next: (pollRes) => {
          const polls = pollRes?.success && pollRes?.data ? pollRes.data : [];
          this.polls.set(polls);
          this.userService.listAllForAdmin().subscribe({
            next: (userRes) => {
              const users = userRes?.success && userRes?.data ? userRes.data : [];
              this.stats.set(this.computeStats(polls, users.length));
              this.loading.set(false);
            },
            error: () => {
              this.stats.set(this.computeStats(polls, 0));
              this.loading.set(false);
            },
          });
        },
        error: () => {
          this.error.set('Failed to load dashboard.');
          this.loading.set(false);
        },
      });
    } else {
      this.pollService.listActive().subscribe({
        next: (res) => {
          const polls = res?.success && res?.data ? res.data : [];
          this.polls.set(polls);
          this.stats.set(this.computeStats(polls, 0));
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load dashboard.');
          this.loading.set(false);
        },
      });
    }
  }

  getPollStatus(p: PollDto): 'active' | 'ended' | 'not_started' {
    const now = new Date();
    const start = p.startsAt ? new Date(p.startsAt) : null;
    const end = p.endsAt ? new Date(p.endsAt) : null;
    const isActive = p.isActive ?? false;
    if (start && start > now) return 'not_started';
    if (end && end < now) return 'ended';
    if (isActive && (!start || start <= now) && (!end || end >= now)) return 'active';
    if (isActive && !start && !end) return 'active';
    return 'ended';
  }

  private computeStats(polls: PollDto[], userCount: number): DashboardStats {
    const now = new Date();
    let active = 0;
    let ended = 0;
    let notStarted = 0;

    for (const p of polls) {
      const start = p.startsAt ? new Date(p.startsAt) : null;
      const end = p.endsAt ? new Date(p.endsAt) : null;
      const isActive = p.isActive ?? false;
      if (start && start > now) {
        notStarted++;
      } else if (end && end < now) {
        ended++;
      } else if (isActive && (!start || start <= now) && (!end || end >= now)) {
        active++;
      } else if (isActive && !start && !end) {
        active++;
      } else {
        ended++;
      }
    }

    return {
      totalPolls: polls.length,
      activePolls: active,
      endedPolls: ended,
      notStartedPolls: notStarted,
      totalUsers: userCount,
    };
  }
}
