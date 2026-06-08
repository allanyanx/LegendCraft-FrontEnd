export interface Articulo {
  id: number;
  idCategoria: number;
  nombre: string;
  precio: number;
  stock: number;
  atributos: Record<string, any> | null;
  urlImagen: [];
  estadoActivo: boolean;
  fechaCreacion: string;
}
