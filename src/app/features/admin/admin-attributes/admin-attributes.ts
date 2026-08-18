import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttributeService } from '../../../core/services/attribute.service';
import { AttributeTypeResponse, AttributeValueResponse } from '../../../core/models/attribute';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-admin-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-attributes.html',
  styleUrls: ['./admin-attributes.css']
})
export class AdminAttributes implements OnInit {
  private attributeService = inject(AttributeService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  attributeTypes = signal<AttributeTypeResponse[]>([]);
  isLoading = signal<boolean>(false);

  newTypeName = signal<string>('');
  editingType = signal<AttributeTypeResponse | null>(null);

  newValueName = signal<string>('');
  addingValueToType = signal<number | null>(null);
  editingValue = signal<AttributeValueResponse | null>(null);

  ngOnInit() {
    this.loadAttributes();
  }

  loadAttributes() {
    this.isLoading.set(true);
    this.attributeService.getAllAttributes().subscribe({
      next: (data) => {
        this.attributeTypes.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.show('Error al cargar atributos', 'error');
        this.isLoading.set(false);
      }
    });
  }

  createType() {
    if (!this.newTypeName().trim()) return;
    this.attributeService.createAttributeType({ name: this.newTypeName().trim() }).subscribe({
      next: () => {
        this.toastService.show('Tipo de atributo creado', 'success');
        this.newTypeName.set('');
        this.loadAttributes();
      },
      error: () => this.toastService.show('Error al crear tipo de atributo', 'error')
    });
  }

  startEditType(type: AttributeTypeResponse) {
    this.editingType.set({ ...type });
  }

  cancelEditType() {
    this.editingType.set(null);
  }

  updateType() {
    const type = this.editingType();
    if (!type || !type.name.trim()) return;
    this.attributeService.updateAttributeType(type.id, { name: type.name.trim() }).subscribe({
      next: () => {
        this.toastService.show('Tipo de atributo actualizado', 'success');
        this.editingType.set(null);
        this.loadAttributes();
      },
      error: () => this.toastService.show('Error al actualizar tipo de atributo', 'error')
    });
  }

  async deleteType(id: number) {
    const confirmed = await this.confirmService.confirm('¿Estás seguro de eliminar este tipo de atributo? Se eliminarán todos sus valores.');
    if (confirmed) {
      this.attributeService.deleteAttributeType(id).subscribe({
        next: () => {
          this.toastService.success('Tipo eliminado');
          this.loadAttributes();
        },
        error: () => this.toastService.error('Error al eliminar tipo')
      });
    }
  }

  startAddValue(typeId: number) {
    this.addingValueToType.set(typeId);
    this.newValueName.set('');
  }

  cancelAddValue() {
    this.addingValueToType.set(null);
    this.newValueName.set('');
  }

  createValue(typeId: number) {
    if (!this.newValueName().trim()) return;
    this.attributeService.createAttributeValue(typeId, { attributeTypeId: typeId, value: this.newValueName().trim() }).subscribe({
      next: () => {
        this.toastService.success('Valor agregado');
        this.cancelAddValue();
        this.loadAttributes();
      },
      error: () => this.toastService.error('Error al agregar valor')
    });
  }

  startEditValue(val: AttributeValueResponse, typeId: number) {
    this.editingValue.set({ ...val });
  }

  cancelEditValue() {
    this.editingValue.set(null);
  }

  updateValue(typeId: number) {
    const val = this.editingValue();
    if (!val || !val.value.trim()) return;
    this.attributeService.updateAttributeValue(val.id, { attributeTypeId: typeId, value: val.value.trim() }).subscribe({
      next: () => {
        this.toastService.success('Valor actualizado');
        this.editingValue.set(null);
        this.loadAttributes();
      },
      error: () => this.toastService.error('Error al actualizar valor')
    });
  }

  async deleteValue(id: number) {
    const confirmed = await this.confirmService.confirm('¿Estás seguro de eliminar este valor?');
    if (confirmed) {
      this.attributeService.deleteAttributeValue(id).subscribe({
        next: () => {
          this.toastService.success('Valor eliminado');
          this.loadAttributes();
        },
        error: () => this.toastService.error('Error al eliminar valor')
      });
    }
  }
}
