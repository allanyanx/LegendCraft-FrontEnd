import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ArticleCreateRequest, ArticleListResponse, PagedResult } from '../models/article';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Articles`;

  getArticles(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<ArticleListResponse>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<ArticleListResponse>>(this.apiUrl, { params });
  }

  createArticle(data: ArticleCreateRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  uploadArticleImages(articleId: number, images: File[]): Observable<any> {
    const formData = new FormData();
    // Le pasamos explicitly el nombre al formData.append para que el navegador no envíe "blob" sin extensión
    images.forEach((img, index) => formData.append('files', img, img.name || `image_${index}.webp`));
    return this.http.post<any>(`${this.apiUrl}/${articleId}/images`, formData);
  }

  getArticleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateArticle(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { responseType: 'text' });
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  deleteImage(articleId: number, imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${articleId}/images/${imageId}`, { responseType: 'text' });
  }

  setMainImage(articleId: number, imageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${articleId}/images/${imageId}/set-main`, {}, { responseType: 'text' });
  }
}
