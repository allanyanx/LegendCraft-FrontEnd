import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderResponse } from '../../../core/models/order-response';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html'
})
export class AdminOrdersComponent implements OnInit {
  adminOrderService = inject(AdminOrderService);
  toastService = inject(ToastService);

  orders = signal<OrderResponse[]>([]);
  loading = signal(false);
  expandedOrderId = signal<number | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.adminOrderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.show('Error al cargar órdenes', 'error');
        this.loading.set(false);
      }
    });
  }

  toggleRow(id: number) {
    this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
  }

  updateStatus(order: OrderResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatusStr = select.value;
    
    const statusMap: { [key: string]: number } = {
      'Pending': 0,
      'Processing': 1,
      'Shipped': 2,
      'Delivered': 3,
      'Cancelled': 4
    };

    const statusInt = statusMap[newStatusStr];
    
    if (statusInt === undefined) {
      this.toastService.show('Estado no válido', 'error');
      return;
    }

    this.adminOrderService.updateOrderStatus(order.id, statusInt).subscribe({
      next: () => {
        order.status = newStatusStr;
        this.toastService.show(`Estado de la orden #${order.id} actualizado a ${newStatusStr}`, 'success');
      },
      error: (err) => {
        this.toastService.show('Error al actualizar estado', 'error');
        // Revert select back to original value
        select.value = order.status;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Processing': return 'bg-blue-500/20 text-blue-400';
      case 'Shipped': return 'bg-purple-500/20 text-purple-400';
      case 'Delivered': return 'bg-green-500/20 text-green-400';
      case 'Cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }
}
