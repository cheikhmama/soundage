import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import type { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  users: User[] = [];
  loading = true;
  error = '';

  search = '';
  role: string = 'all';

  readonly skeletonRowIndices = Array.from({ length: 5 }, (_, i) => i);

  ngOnInit(): void {
    this.route.queryParams.subscribe((qp) => {
      this.search = qp['search'] ?? '';
      this.role = qp['role'] ?? 'all';
      this.load();
    });
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.applyParams();
  }

  onRoleChange(value: string): void {
    this.role = value;
    this.applyParams();
  }

  private applyParams(): void {
    const q: Record<string, string> = {};
    if (this.search.trim()) q['search'] = this.search.trim();
    if (this.role && this.role !== 'all') q['role'] = this.role;
    this.router.navigate([], { queryParams: q, queryParamsHandling: '' });
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.userService
      .listAllForAdmin({
        search: this.search || undefined,
        role: this.role === 'all' ? undefined : this.role,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res?.success && Array.isArray(res.data)) {
            this.users = res.data;
          } else {
            this.error = res?.message ?? 'Failed to load users.';
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to load users.';
          this.cdr.detectChanges();
        },
      });
  }
}
