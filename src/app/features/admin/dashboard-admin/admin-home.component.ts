import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BannerService } from '../../../core/services/banner.service';
import { FaqService } from '../../../core/services/faq.service';
import { BannerLista } from '../../../core/models/banner-lista';
import { FaqLista } from '../../../core/models/faq-lista';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-home.html'
})
export class AdminHomeComponent implements OnInit {
  private bannerService = inject(BannerService);
  private faqService = inject(FaqService);
  private confirmService = inject(ConfirmService);
  private fb = inject(FormBuilder);

  activeSubTab = signal<'banners' | 'faqs'>('banners');

  // Banners
  banners = signal<BannerLista[]>([]);
  isLoadingBanners = signal<boolean>(true);
  
  // Faqs
  faqs = signal<FaqLista[]>([]);
  isLoadingFaqs = signal<boolean>(true);
  
  // Modals state
  isBannerModalOpen = signal<boolean>(false);
  isFaqModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  
  editingBannerId = signal<number | null>(null);
  editingFaqId = signal<number | null>(null);
  selectedFile = signal<File | null>(null);

  bannerForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    displayOrder: [0, [Validators.required, Validators.min(0)]]
  });

  faqForm: FormGroup = this.fb.group({
    question: ['', [Validators.required]],
    answer: ['', [Validators.required]],
    displayOrder: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadBanners();
    this.loadFaqs();
  }

  setSubTab(tab: 'banners' | 'faqs') {
    this.activeSubTab.set(tab);
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    return url.startsWith('/') ? environment.apiUrl.replace('/api', '') + url : url;
  }

  // --- BANNERS LOGIC ---

  loadBanners() {
    this.isLoadingBanners.set(true);
    this.bannerService.getBanners().subscribe({
      next: (res) => {
        this.banners.set(res);
        this.isLoadingBanners.set(false);
      },
      error: () => this.isLoadingBanners.set(false)
    });
  }

  openBannerCreateModal() {
    this.isEditing.set(false);
    this.editingBannerId.set(null);
    this.selectedFile.set(null);
    this.bannerForm.reset({ displayOrder: 0 });
    this.isBannerModalOpen.set(true);
  }

  openBannerEditModal(banner: BannerLista) {
    this.isEditing.set(true);
    this.editingBannerId.set(banner.id);
    this.selectedFile.set(null);
    this.bannerForm.patchValue({
      title: banner.title,
      displayOrder: banner.displayOrder
    });
    this.isBannerModalOpen.set(true);
  }

  closeBannerModal() {
    this.isBannerModalOpen.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  saveBanner() {
    if (this.bannerForm.invalid) return;

    this.isSaving.set(true);
    const formData = new FormData();
    formData.append('title', this.bannerForm.value.title);
    formData.append('displayOrder', this.bannerForm.value.displayOrder.toString());
    
    if (this.selectedFile()) {
      formData.append('file', this.selectedFile() as Blob);
    }

    if (this.isEditing() && this.editingBannerId()) {
      this.bannerService.updateBanner(this.editingBannerId()!, formData).subscribe({
        next: () => {
          this.loadBanners();
          this.closeBannerModal();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.bannerService.createBanner(formData).subscribe({
        next: () => {
          this.loadBanners();
          this.closeBannerModal();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  async deleteBanner(id: number) {
    const confirmed = await this.confirmService.confirm('¿Estás seguro de que deseas eliminar este banner?');
    if (confirmed) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => this.loadBanners(),
        error: (err: any) => console.error(err)
      });
    }
  }

  // --- FAQS LOGIC ---

  loadFaqs() {
    this.isLoadingFaqs.set(true);
    this.faqService.getFaqs().subscribe({
      next: (res) => {
        this.faqs.set(res);
        this.isLoadingFaqs.set(false);
      },
      error: () => this.isLoadingFaqs.set(false)
    });
  }

  openFaqCreateModal() {
    this.isEditing.set(false);
    this.editingFaqId.set(null);
    this.faqForm.reset({ displayOrder: 0 });
    this.isFaqModalOpen.set(true);
  }

  openFaqEditModal(faq: FaqLista) {
    this.isEditing.set(true);
    this.editingFaqId.set(faq.id);
    this.faqForm.patchValue({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder
    });
    this.isFaqModalOpen.set(true);
  }

  closeFaqModal() {
    this.isFaqModalOpen.set(false);
  }

  saveFaq() {
    if (this.faqForm.invalid) return;

    this.isSaving.set(true);
    const dto = this.faqForm.value;

    if (this.isEditing() && this.editingFaqId()) {
      this.faqService.updateFaq(this.editingFaqId()!, dto).subscribe({
        next: () => {
          this.loadFaqs();
          this.closeFaqModal();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.faqService.createFaq(dto).subscribe({
        next: () => {
          this.loadFaqs();
          this.closeFaqModal();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  async deleteFaq(id: number) {
    const confirmed = await this.confirmService.confirm('¿Estás seguro de que deseas eliminar esta pregunta frecuente?');
    if (confirmed) {
      this.faqService.deleteFaq(id).subscribe({
        next: () => this.loadFaqs(),
        error: (err: any) => console.error(err)
      });
    }
  }
}
