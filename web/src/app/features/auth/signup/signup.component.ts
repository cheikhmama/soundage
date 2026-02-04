import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import type { SignupRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  errorMessage = '';
  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER' as const],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.loading = true;
    const req: SignupRequest = this.form.getRawValue();
    this.auth.signup(req).subscribe({
      next: (res) => {
        if (res?.success) {
          this.router.navigate(['/login']);
        } else {
          this.loading = false;
          this.errorMessage = res?.message ?? 'Sign up failed.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        const body = err?.error;
        this.errorMessage =
          typeof body === 'object' && body !== null && typeof body.message === 'string'
            ? body.message
            : typeof body === 'string'
            ? body
            : 'Sign up failed. Email may already be in use.';
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
