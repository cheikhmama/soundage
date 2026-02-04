import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api-response.model';
import type { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/api/users`;
  private readonly adminApi = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  listAllForAdmin(params?: { search?: string; role?: string }): Observable<ApiResponse<User[]>> {
    let url = this.adminApi;
    if (params) {
      const q = new URLSearchParams();
      if (params.search != null && params.search.trim() !== '')
        q.set('search', params.search.trim());
      if (params.role != null && params.role !== '' && params.role !== 'all')
        q.set('role', params.role);
      const qs = q.toString();
      if (qs) url += '?' + qs;
    }
    return this.http
      .get<ApiResponse<User[]>>(url)
      .pipe(catchError(() => of({ success: false, data: [] } as ApiResponse<User[]>)));
  }
}
