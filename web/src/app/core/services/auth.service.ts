import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api-response.model';
import type { User } from '../models/user.model';
import type {
  AuthResponse,
  SignupRequest,
  LoginRequest,
  RefreshTokenRequest,
} from '../models/auth.model';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/api/auth`;
  private readonly usersApi = `${environment.apiUrl}/api/users`;

  private accessToken = signal<string | null>(this.getStoredToken());
  private refreshToken = signal<string | null>(this.getStoredRefreshToken());
  private currentUser = signal<User | null>(this.getStoredUser());

  readonly isLoggedIn = computed(() => !!this.accessToken());
  readonly user = computed(() => this.currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  signup(req: SignupRequest): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.api}/signup`, req)
      .pipe(catchError((err) => this.handleError<User>(err)));
  }

  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, req).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setTokens(res.data.accessToken, res.data.refreshToken);
          this.fetchMe().subscribe();
        }
      }),
      catchError((err) => this.handleError<AuthResponse>(err))
    );
  }

  refresh(): Observable<ApiResponse<AuthResponse>> {
    const refresh = this.refreshToken();
    if (!refresh)
      return of({ success: false, message: 'No refresh token' } as ApiResponse<AuthResponse>);
    const body: RefreshTokenRequest = { refreshToken: refresh };
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/refresh`, body).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setTokens(res.data.accessToken, res.data.refreshToken);
        }
      }),
      catchError(() => {
        this.logout();
        return of({ success: false } as ApiResponse<AuthResponse>);
      })
    );
  }

  fetchMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.usersApi}/me`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          this.setStoredUser(res.data);
        }
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of({ success: false } as ApiResponse<User>);
      })
    );
  }

  logout(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  private setTokens(access: string, refresh: string): void {
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private setStoredUser(u: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  private handleError<T>(err: HttpErrorResponse): Observable<ApiResponse<T>> {
    const body = err?.error;
    const message =
      typeof body === 'object' && body !== null && typeof body.message === 'string'
        ? body.message
        : typeof body === 'string'
        ? body
        : 'Request failed.';
    return of({ success: false, message } as ApiResponse<T>);
  }
}
