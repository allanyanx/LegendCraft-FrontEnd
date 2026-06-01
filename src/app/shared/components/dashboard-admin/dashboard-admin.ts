import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-admin',

  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin {
  seccionActiva: string = '';
  mostrarCrear() {
    this.seccionActiva = 'crear';
  }

  mostrarEditar() {
    this.seccionActiva = 'editar';
  }
}
