import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import type { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  errorMessage = '';
  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
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
    const req: LoginRequest = this.form.getRawValue();
    this.auth.login(req).subscribe({
      next: (res) => {
        if (res?.success) {
          this.router.navigate(['/']);
        } else {
          this.loading = false;
          this.errorMessage = res?.message ?? 'Login failed. Check email and password.';
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
            : 'Login failed. Check email and password.';
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
