import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FaqService } from '../../../core/services/faq.service';
import { FaqLista } from '../../../core/models/faq-lista';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html'
})
export class Faq implements OnInit {
  faqs: FaqLista[] = [];
  faqService = inject(FaqService);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);
  loading: boolean = true;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.faqService.getFaqs().subscribe({
        next: (data: FaqLista[]) => {
          setTimeout(() => {
            if (Array.isArray(data)) {
              this.faqs = data.sort((a: FaqLista, b: FaqLista) => a.displayOrder - b.displayOrder);
            } else {
              this.faqs = [];
            }
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
        error: (err: any) => {
          setTimeout(() => {
            console.error('Error fetching faqs', err);
            this.loading = false;
            this.cdr.markForCheck();
          });
        }
      });
    } else {
      this.loading = false;
    }
  }

  openIndex: number | null = null;
  
  toggleFaq(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
