import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

/**
 * Upload images to Cloudinary (unsigned upload with preset).
 * Configure cloudName and uploadPreset in environment.
 * @see https://cloudinary.com/documentation/angular_integration
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly cloudName = environment.cloudinary?.cloudName ?? '';
  private readonly uploadPreset = environment.cloudinary?.uploadPreset ?? '';
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  get isConfigured(): boolean {
    return !!this.cloudName && !!this.uploadPreset;
  }

  /**
   * Upload a file to Cloudinary. Returns the secure URL of the uploaded image.
   */
  uploadImage(file: File): Observable<CloudinaryUploadResponse> {
    if (!this.isConfigured) {
      return throwError(
        () =>
          new Error('Cloudinary is not configured. Set cloudName and uploadPreset in environment.')
      );
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    return this.http.post<CloudinaryUploadResponse>(this.uploadUrl, formData);
  }

  /**
   * Return a Cloudinary URL with optional transformations (e.g. thumbnail for polls).
   */
  imageUrl(
    secureUrl: string,
    options?: { width?: number; height?: number; crop?: string }
  ): string {
    if (!secureUrl) return secureUrl;
    if (!options?.width && !options?.height) return secureUrl;
    try {
      const u = new URL(secureUrl);
      if (!u.hostname.includes('cloudinary.com')) return secureUrl;
      const sep = '/upload/';
      const idx = secureUrl.indexOf(sep);
      if (idx === -1) return secureUrl;
      const w = options.width ?? 'auto';
      const h = options.height ?? 'auto';
      const c = options.crop ?? 'fill';
      const transform = `w_${w},h_${h},c_${c}/`;
      return secureUrl.slice(0, idx + sep.length) + transform + secureUrl.slice(idx + sep.length);
    } catch {
      return secureUrl;
    }
  }
}
