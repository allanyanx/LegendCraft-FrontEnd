import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl">
      <h2 class="text-2xl font-bold text-white mb-6 pb-2 border-b border-neutral-800">Gestión de Órdenes</h2>
      <div class="bg-[#1A1A1A] p-6 rounded-xl border border-[#2B2B2B]">
         <p class="text-neutral-400 text-sm">Aquí irá la tabla de órdenes (pedidos) cuando se conecte al backend.</p>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  ngOnInit() {}
}
