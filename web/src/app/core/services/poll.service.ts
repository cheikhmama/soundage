import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api-response.model';
import type {
  PollDto,
  PollDetailDto,
  PollResultsDto,
  CreatePollRequest,
  UpdatePollRequest,
  SubmitVoteRequest,
  SubmitVoteResponse,
} from '../models/poll.model';

@Injectable({ providedIn: 'root' })
export class PollService {
  private readonly api = `${environment.apiUrl}/api/polls`;
  private readonly adminApi = `${environment.apiUrl}/api/admin/polls`;

  constructor(private http: HttpClient) {}

  /** List active polls (public). */
  listActive(): Observable<ApiResponse<PollDto[]>> {
    return this.http
      .get<ApiResponse<PollDto[]>>(this.api)
      .pipe(catchError((err) => this.handleError<PollDto[]>(err)));
  }

  /** Get poll by id with questions (public). Pass anonymousId when not logged in so hasVoted is accurate. */
  getById(id: string, anonymousId?: string): Observable<ApiResponse<PollDetailDto>> {
    const url =
      anonymousId != null && anonymousId !== ''
        ? `${this.api}/${id}?anonymousId=${encodeURIComponent(anonymousId)}`
        : `${this.api}/${id}`;
    return this.http
      .get<ApiResponse<PollDetailDto>>(url)
      .pipe(catchError((err) => this.handleError<PollDetailDto>(err)));
  }

  /** Submit vote. */
  submitVote(
    pollId: string,
    request: SubmitVoteRequest
  ): Observable<ApiResponse<SubmitVoteResponse>> {
    return this.http
      .post<ApiResponse<SubmitVoteResponse>>(`${this.api}/${pollId}/responses`, request)
      .pipe(catchError((err) => this.handleError<SubmitVoteResponse>(err)));
  }

  /** Admin: list all polls with optional search and filters. */
  listAllForAdmin(params?: {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<PollDto[]>> {
    let url = this.adminApi;
    if (params) {
      const q = new URLSearchParams();
      if (params.search != null && params.search.trim() !== '')
        q.set('search', params.search.trim());
      if (params.status === 'active') q.set('status', 'true');
      if (params.status === 'inactive') q.set('status', 'false');
      if (params.startDate) q.set('startDate', params.startDate);
      if (params.endDate) q.set('endDate', params.endDate);
      const qs = q.toString();
      if (qs) url += '?' + qs;
    }
    return this.http
      .get<ApiResponse<PollDto[]>>(url)
      .pipe(catchError((err) => this.handleError<PollDto[]>(err)));
  }

  /** Admin: get poll by id. */
  getByIdForAdmin(id: string): Observable<ApiResponse<PollDetailDto>> {
    return this.http
      .get<ApiResponse<PollDetailDto>>(`${this.adminApi}/${id}`)
      .pipe(catchError((err) => this.handleError<PollDetailDto>(err)));
  }

  /** Admin: get poll results (stats for charts). */
  getResults(pollId: string): Observable<ApiResponse<PollResultsDto>> {
    return this.http
      .get<ApiResponse<PollResultsDto>>(`${this.adminApi}/${pollId}/results`)
      .pipe(catchError((err) => this.handleError<PollResultsDto>(err)));
  }

  /** Admin: create poll. */
  create(request: CreatePollRequest): Observable<ApiResponse<PollDetailDto>> {
    return this.http
      .post<ApiResponse<PollDetailDto>>(this.adminApi, request)
      .pipe(catchError((err) => this.handleError<PollDetailDto>(err)));
  }

  /** Admin: update poll. */
  update(id: string, request: UpdatePollRequest): Observable<ApiResponse<PollDetailDto>> {
    return this.http
      .put<ApiResponse<PollDetailDto>>(`${this.adminApi}/${id}`, request)
      .pipe(catchError((err) => this.handleError<PollDetailDto>(err)));
  }

  /** Admin: delete poll. */
  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.adminApi}/${id}`);
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
