import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FaqLista } from '../models/faq-lista';

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/faqs`;

  getFaqs(): Observable<FaqLista[]> {
    return this.http.get<FaqLista[]>(this.apiUrl);
  }

  getFaqById(id: number): Observable<FaqLista> {
    return this.http.get<FaqLista>(`${this.apiUrl}/${id}`);
  }

  createFaq(faq: any): Observable<FaqLista> {
    return this.http.post<FaqLista>(this.apiUrl, faq);
  }

  updateFaq(id: number, faq: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, faq);
  }

  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
