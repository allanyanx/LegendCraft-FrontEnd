import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
  imports: [FormsModule],
})
export class DashboardAdmin {
  seccionActiva: string = '';

  // datos del formulario
  nuevoArticulo = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    idCategoria: null,
    urlImagen: '',
    estadoActivo: true,
  };

  // atributos dinámicos
  atributos: { clave: string; valor: string }[] = [];

  // categorías (después vendrán del backend)
  categorias = [
    { id: 1, nombre: 'Cosplay & Props' },
    { id: 2, nombre: 'Figuras & Dioramas' },
    { id: 3, nombre: 'Máscaras' },
    { id: 4, nombre: 'Llaveros & Miniaturas' },
    { id: 5, nombre: 'Accesorios Gamer' },
  ];

  mostrarCrear() {
    this.seccionActiva = 'crear';
  }
  mostrarEditar() {
    this.seccionActiva = 'editar';
  }

  agregarAtributo() {
    this.atributos.push({ clave: '', valor: '' });
  }

  eliminarAtributo(index: number) {
    this.atributos.splice(index, 1);
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      // por ahora solo guardamos el nombre
      this.nuevoArticulo.urlImagen = input.files[0].name;
    }
  }

  crearArticulo() {
    const atributosJSON = this.atributos.reduce(
      (obj, atributo) => {
        obj[atributo.clave] = atributo.valor;
        return obj;
      },
      {} as Record<string, string>,
    );

    const payload = {
      ...this.nuevoArticulo,
      atributos: atributosJSON,
    };

    console.log('Artículo a enviar:', payload);
    // aquí después llamarás a tu servicio HTTP
  }
}
