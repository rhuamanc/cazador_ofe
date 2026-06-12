export interface Oferta {
  _id: string;
  nombre: string;
  tienda: string;
  categoria: string;
  paginaOrigen?: number;
  precio: number;
  precioOriginal: number;
  descuentoPorcentaje: number;
  pulgadas?: number;
  url: string;
  precioPorPulgada: number;
  puntaje: number;
  fechaConsulta: string;
}

export type SortField =
  | "puntaje"
  | "precio"
  | "descuentoPorcentaje"
  | "precioPorPulgada";

export type SortDir = "asc" | "desc";
