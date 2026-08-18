import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BannerLista } from '../models/banner-lista';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/banners`;

  getBanners(): Observable<BannerLista[]> {
    return this.http.get<BannerLista[]>(this.apiUrl);
  }

  getBannerById(id: number): Observable<BannerLista> {
    return this.http.get<BannerLista>(`${this.apiUrl}/${id}`);
  }

  createBanner(formData: FormData): Observable<BannerLista> {
    return this.http.post<BannerLista>(this.apiUrl, formData);
  }

  updateBanner(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
