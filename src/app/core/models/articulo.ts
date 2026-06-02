export interface Articulo {
  id: number;
  idCategoria: number;
  nombre: string;
  precio: number;
  stock: number;
  atributos: Record<string, any> | null;
  urlImagen: string;
  estadoActivo: boolean;
  fechaCreacion: string;
}
