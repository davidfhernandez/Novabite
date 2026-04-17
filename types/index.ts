export type CategoriaProducto =
  | "hamburguesas"
  | "sushi"
  | "vegano"
  | "bebidas";

export type EstadoOrden = "pendiente" | "preparando" | "entregado";

export type TipoDocumento = "CC" | "NIT" | "CE";

export interface OpcionPersonalizacion {
  id: string;
  nombre: string;
  precio: number;
}

export interface GrupoPersonalizacion {
  id: string;
  nombre: string;
  opciones: OpcionPersonalizacion[];
}

export interface Producto {
  _id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  descripcionLarga: string;
  precio: number;
  categoria: CategoriaProducto;
  imagenes: string[];
  rating: number;
  ingredientes: string[];
  destacado: boolean;
  stock: number;
  disponible: boolean;
  etiquetas: string[];
  personalizaciones: GrupoPersonalizacion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonalizacionSeleccionada {
  grupoId: string;
  grupoNombre: string;
  opcionId: string;
  opcionNombre: string;
  precio: number;
}

export interface ItemCarrito {
  id: string;
  productoId: string;
  slug: string;
  nombre: string;
  imagen: string;
  categoria: CategoriaProducto;
  precioBase: number;
  cantidad: number;
  personalizacionesSeleccionadas: PersonalizacionSeleccionada[];
}

export interface ResumenCarrito {
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
}

export interface ClienteFacturacion {
  nombre: string;
  correo: string;
  telefono: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  direccion: string;
  ciudad: string;
  referencia?: string;
}

export interface OrdenItem {
  productoId: string;
  nombre: string;
  slug: string;
  imagen: string;
  categoria: CategoriaProducto;
  precioBase: number;
  cantidad: number;
  personalizacionesSeleccionadas: PersonalizacionSeleccionada[];
}

export interface Orden {
  _id: string;
  numeroOrden: string;
  numeroFactura: string;
  cliente: ClienteFacturacion;
  items: OrdenItem[];
  metodoPago: string;
  cupon?: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: EstadoOrden;
  observaciones?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductoPayload {
  slug?: string;
  nombre: string;
  descripcion: string;
  descripcionLarga: string;
  precio: number;
  categoria: CategoriaProducto;
  imagenes: string[];
  rating: number;
  ingredientes: string[];
  destacado?: boolean;
  stock: number;
  disponible?: boolean;
  etiquetas?: string[];
  personalizaciones?: GrupoPersonalizacion[];
}

export interface OrdenPayload {
  cliente: ClienteFacturacion;
  items: OrdenItem[];
  metodoPago: string;
  cupon?: string;
  observaciones?: string;
}

export interface MetricasAdmin {
  totalOrdenes: number;
  ingresos: number;
  totalProductos: number;
  ordenesDelDia: number;
  ventasPorDia: Array<{ fecha: string; total: number }>;
  ordenesPorEstado: Array<{ estado: string; total: number }>;
}
