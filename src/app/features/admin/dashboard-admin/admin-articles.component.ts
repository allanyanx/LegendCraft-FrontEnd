import { Component, inject, ChangeDetectorRef, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ArticleService } from '../../../core/services/article.service';
import { AttributeService } from '../../../core/services/attribute.service';
import { ArticleListResponse } from '../../../core/models/article';
import { AttributeTypeResponse } from '../../../core/models/attribute';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import imageCompression from 'browser-image-compression';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-articles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ImageCropperComponent],
  templateUrl: './admin-articles.html'
})
export class AdminArticlesComponent {
  private articleService = inject(ArticleService);
  private attributeService = inject(AttributeService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  // Lista
  articles: ArticleListResponse[] = [];
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';
  
  // Estado
  isCreating = false;
  isEditing = false;
  editingArticleId: number | null = null;
  isSaving = false;
  isLoading = true; // Inicia en true para mostrar spinner durante SSR
  isAttributesLoading = true;

  // Formulario
  articleForm: FormGroup;
  availableAttributes: AttributeTypeResponse[] = [];
  selectedAttributeIds: Set<number> = new Set();

  // Imágenes
  imageChangedEvent: any = '';
  rawSelectedFile: File | null = null;
  croppedImage: Blob | null | undefined = null;
  finalImages: File[] = [];
  finalImagesUrls: string[] = [];
  existingImages: any[] = [];
  isProcessingImage = false;

  constructor() {
    this.articleForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isPrintOnDemand: [true],
      printTimeDays: [3],
      highlights: this.fb.array([this.fb.control('')])
    });

    // afterNextRender garantiza que el código se ejecute SOLO en el navegador (cliente)
    // y DESPUÉS de que Angular termine de hidratar la página. 
    // Esto previene los errores de "Hydration Mismatch" que congelan la vista.
    afterNextRender(() => {
      this.loadArticles(1);
      this.loadAttributes();
    });
  }

  get highlights() {
    return this.articleForm.get('highlights') as FormArray;
  }

  addHighlight() {
    this.highlights.push(this.fb.control(''));
  }

  removeHighlight(index: number) {
    this.highlights.removeAt(index);
  }

  loadArticles(page: number) {
    this.isLoading = true;
    this.articleService.getArticles(page, 10, this.searchTerm).subscribe({
      next: (res) => {
        this.articles = res.items;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(path: string): string {
    if (!path) return '/assets/placeholder.png';
    // El backend devuelve /imagenes/..., apiUrl es .../api
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  }

  loadAttributes() {
    this.isAttributesLoading = true;
    this.attributeService.getAllAttributes().subscribe({
      next: (res) => {
        this.availableAttributes = res ? [...res] : [];
        this.isAttributesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isAttributesLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleCreate() {
    this.isCreating = !this.isCreating;
    this.isEditing = false;
    this.editingArticleId = null;
    if (!this.isCreating) {
      this.resetForm();
    }
  }

  toggleAttribute(id: number, event: any) {
    if (event.target.checked) {
      this.selectedAttributeIds.add(id);
    } else {
      this.selectedAttributeIds.delete(id);
    }
  }

  // Modales
  showTypeModal = false;
  newTypeName = '';
  showValueModal = false;
  newValueName = '';
  valueModalTypeId: number | null = null;
  isSavingAttribute = false;

  openTypeModal() {
    this.newTypeName = '';
    this.showTypeModal = true;
    this.isSavingAttribute = false;
  }

  closeTypeModal() {
    this.showTypeModal = false;
    this.isSavingAttribute = false;
  }

  saveTypeModal() {
    if (this.newTypeName && this.newTypeName.trim() && !this.isSavingAttribute) {
      this.isSavingAttribute = true;
      this.cdr.detectChanges();
      
      this.attributeService.createAttributeType({ name: this.newTypeName.trim() })
      .pipe(
        finalize(() => {
          this.isSavingAttribute = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.closeTypeModal();
          this.loadAttributes();
        },
        error: (err) => {
          console.error('Error al guardar el tipo', err);
          alert('Error al crear el tipo de atributo. Verifica tu conexión.');
        }
      });
    }
  }

  openValueModal(typeId: number) {
    this.newValueName = '';
    this.valueModalTypeId = typeId;
    this.showValueModal = true;
    this.isSavingAttribute = false;
  }

  closeValueModal() {
    this.showValueModal = false;
    this.valueModalTypeId = null;
    this.isSavingAttribute = false;
  }

  saveValueModal() {
    if (this.newValueName && this.newValueName.trim() && this.valueModalTypeId && !this.isSavingAttribute) {
      this.isSavingAttribute = true;
      this.cdr.detectChanges();

      this.attributeService.createAttributeValue(this.valueModalTypeId, { attributeTypeId: this.valueModalTypeId, value: this.newValueName.trim() })
      .pipe(
        finalize(() => {
          this.isSavingAttribute = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.closeValueModal();
          this.loadAttributes();
        },
        error: (err) => {
          console.error('Error al guardar el valor', err);
          alert('Error al crear el valor. Verifica tu conexión.');
        }
      });
    }
  }

  onFileSelected(event: any, inputElement: HTMLInputElement): void {
    if (event.target.files && event.target.files.length > 0) {
      this.rawSelectedFile = event.target.files[0];
      this.imageChangedEvent = event;
      
      // IMPORTANTE: No podemos hacer inputElement.value = '' aquí de forma síncrona.
      // Si lo hacemos, borramos el archivo del input antes de que ngx-image-cropper
      // tenga tiempo de leerlo, causando que la imagen no se muestre.
      // Lo limpiamos con un timeout para que Angular procese el evento primero.
      setTimeout(() => {
        inputElement.value = '';
      }, 500);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
  }

  async saveCroppedImage() {
    if (!this.croppedImage) return;
    this.isProcessingImage = true;
    this.cdr.detectChanges();

    try {
      // Optimización con browser-image-compression
      const file = new File([this.croppedImage], `img_${Date.now()}.webp`, { type: 'image/webp' });
      await this.optimizeAndAddFile(file);
    } catch (error) {
      console.error('Error comprimiendo imagen recortada', error);
      alert('Error comprimiendo imagen. Intenta con otra.');
    } finally {
      this.isProcessingImage = false;
      this.cancelCrop();
      this.cdr.detectChanges();
    }
  }

  async skipCrop() {
    if (!this.rawSelectedFile) return;
    this.isProcessingImage = true;
    this.cdr.detectChanges();

    try {
      await this.optimizeAndAddFile(this.rawSelectedFile);
    } catch (error) {
      console.error('Error comprimiendo imagen original', error);
      alert('Error comprimiendo imagen original. Intenta con otra.');
    } finally {
      this.isProcessingImage = false;
      this.cancelCrop();
      this.cdr.detectChanges();
    }
  }

  private async optimizeAndAddFile(file: File) {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1080,
      useWebWorker: false, // Desactivado: los web workers a veces se cuelgan en Angular/Vite y causan que la promesa nunca se resuelva
      fileType: 'image/webp'
    };
    
    const compressedFile = await imageCompression(file, options);
    this.finalImages.push(compressedFile);
    
    // Crear URL temporal para previsualización
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.finalImagesUrls.push(e.target.result);
        resolve();
      };
      reader.readAsDataURL(compressedFile);
    });
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.rawSelectedFile = null;
    this.croppedImage = null;
  }

  removeImage(index: number) {
    this.finalImages.splice(index, 1);
    this.finalImagesUrls.splice(index, 1);
  }

  setMainImage(index: number) {
    if (index === 0) return; // Ya es la principal
    
    // Extraemos la imagen y url de su posición actual
    const file = this.finalImages.splice(index, 1)[0];
    const url = this.finalImagesUrls.splice(index, 1)[0];
    
    // Las insertamos en la posición 0 (Principal)
    this.finalImages.unshift(file);
    this.finalImagesUrls.unshift(url);
  }

  resetForm() {
    this.articleForm.reset({
      price: 0,
      stock: 0,
      isPrintOnDemand: true,
      printTimeDays: 3
    });
    this.highlights.clear();
    this.addHighlight(); // Uno vacío por defecto
    this.selectedAttributeIds.clear();
    this.finalImages = [];
    this.finalImagesUrls = [];
    this.existingImages = [];
    this.cancelCrop();
  }

  editArticle(id: number) {
    this.isLoading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.isCreating = true;
        this.isEditing = true;
        this.editingArticleId = id;
        
        this.articleForm.patchValue({
          name: article.name,
          price: article.price,
          stock: article.stock,
          isPrintOnDemand: article.isPrintOnDemand,
          printTimeDays: article.printTimeDays
        });
        
        this.highlights.clear();
        if (article.highlights && article.highlights.length > 0) {
          article.highlights.forEach((h: string) => this.highlights.push(this.fb.control(h)));
        } else {
          this.addHighlight();
        }
        
        this.selectedAttributeIds.clear();
        if (article.attributes) {
          for (const typeName in article.attributes) {
            const valName = article.attributes[typeName];
            const attrType = this.availableAttributes.find(a => a.name === typeName);
            if (attrType && attrType.values) {
              const attrVal = attrType.values.find((v: any) => v.value === valName);
              if (attrVal) {
                this.selectedAttributeIds.add(attrVal.id);
              }
            }
          }
        }
        
        this.existingImages = article.images || [];
        this.finalImages = [];
        this.finalImagesUrls = [];
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Error al cargar el artículo.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteArticle(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles(1);
        },
        error: () => {
          alert('Error al eliminar el artículo.');
        }
      });
    }
  }

  deleteExistingImage(imageId: number) {
    if (!this.editingArticleId) return;
    if (confirm('¿Eliminar esta imagen?')) {
      this.articleService.deleteImage(this.editingArticleId, imageId).subscribe({
        next: () => {
          this.existingImages = this.existingImages.filter(img => img.id !== imageId);
          this.cdr.detectChanges();
        },
        error: () => alert('Error al eliminar imagen.')
      });
    }
  }

  setExistingMainImage(imageId: number) {
    if (!this.editingArticleId) return;
    this.articleService.setMainImage(this.editingArticleId, imageId).subscribe({
      next: () => {
        this.existingImages.forEach(img => img.isMain = img.id === imageId);
        this.cdr.detectChanges();
      },
      error: () => alert('Error al establecer imagen principal.')
    });
  }

  onSubmit() {
    if (this.articleForm.invalid) return;

    this.isSaving = true;
    const formValue = this.articleForm.value;
    
    // Filtrar highlights vacíos
    const cleanHighlights = formValue.highlights.filter((h: string) => h && h.trim() !== '');

    const request = {
      name: formValue.name,
      price: formValue.price,
      stock: formValue.stock,
      isPrintOnDemand: formValue.isPrintOnDemand,
      printTimeDays: formValue.printTimeDays,
      highlights: cleanHighlights,
      attributeValueIds: Array.from(this.selectedAttributeIds)
    };

    if (this.isEditing && this.editingArticleId) {
      this.articleService.updateArticle(this.editingArticleId, request).subscribe({
        next: () => {
          if (this.finalImages.length > 0) {
            this.articleService.uploadArticleImages(this.editingArticleId!, this.finalImages).subscribe({
              next: () => this.finalizeCreation(),
              error: () => {
                alert('Artículo actualizado, pero falló la subida de nuevas imágenes.');
                this.finalizeCreation();
              }
            });
          } else {
            this.finalizeCreation();
          }
        },
        error: () => {
          alert('Error al actualizar el artículo.');
          this.isSaving = false;
        }
      });
    } else {
      this.articleService.createArticle(request).subscribe({
        next: (res) => {
          // El backend de C# devuelve { ArticleId: 123 }, que en Angular se lee como res.articleId (camelCase automático)
          const articleId = res.articleId; 
          
          // Si hay imágenes, subirlas
          if (this.finalImages.length > 0 && articleId) {
            this.articleService.uploadArticleImages(articleId, this.finalImages).subscribe({
              next: () => this.finalizeCreation(),
              error: () => {
                alert('Artículo creado, pero falló la subida de imágenes. Tendrás que subirlas luego.');
                this.finalizeCreation();
              }
            });
          } else {
            this.finalizeCreation();
          }
        },
        error: (err) => {
          alert('Error al crear el artículo. Verifica la conexión.');
          this.isSaving = false;
        }
      });
    }
  }

  private finalizeCreation() {
    this.isSaving = false;
    this.toggleCreate();
    this.loadArticles(1); // Recargar lista
  }
}
