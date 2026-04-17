import mongoose, { Model, Schema } from "mongoose";

interface OrderDocument {
  numeroOrden: string;
  numeroFactura: string;
  cliente: {
    nombre: string;
    correo: string;
    telefono: string;
    tipoDocumento: "CC" | "NIT" | "CE";
    numeroDocumento: string;
    direccion: string;
    ciudad: string;
    referencia?: string;
  };
  items: Array<{
    productoId: string;
    nombre: string;
    slug: string;
    imagen: string;
    categoria: "hamburguesas" | "sushi" | "vegano" | "bebidas";
    precioBase: number;
    cantidad: number;
    personalizacionesSeleccionadas: Array<{
      grupoId: string;
      grupoNombre: string;
      opcionId: string;
      opcionNombre: string;
      precio: number;
    }>;
  }>;
  metodoPago: string;
  cupon?: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: "pendiente" | "preparando" | "entregado";
  observaciones?: string;
}

const orderSchema = new Schema<OrderDocument>(
  {
    numeroOrden: { type: String, required: true, unique: true },
    numeroFactura: { type: String, required: true, unique: true },
    cliente: {
      nombre: { type: String, required: true },
      correo: { type: String, required: true },
      telefono: { type: String, required: true },
      tipoDocumento: {
        type: String,
        required: true,
        enum: ["CC", "NIT", "CE"],
      },
      numeroDocumento: { type: String, required: true },
      direccion: { type: String, required: true },
      ciudad: { type: String, required: true },
      referencia: { type: String },
    },
    items: {
      type: [
        {
          productoId: { type: String, required: true },
          nombre: { type: String, required: true },
          slug: { type: String, required: true },
          imagen: { type: String, required: true },
          categoria: {
            type: String,
            required: true,
            enum: ["hamburguesas", "sushi", "vegano", "bebidas"],
          },
          precioBase: { type: Number, required: true },
          cantidad: { type: Number, required: true },
          personalizacionesSeleccionadas: {
            type: [
              {
                grupoId: { type: String, required: true },
                grupoNombre: { type: String, required: true },
                opcionId: { type: String, required: true },
                opcionNombre: { type: String, required: true },
                precio: { type: Number, required: true },
              },
            ],
            default: [],
          },
        },
      ],
      required: true,
    },
    metodoPago: { type: String, required: true },
    cupon: { type: String },
    subtotal: { type: Number, required: true },
    descuento: { type: Number, required: true, default: 0 },
    iva: { type: Number, required: true },
    total: { type: Number, required: true },
    estado: {
      type: String,
      required: true,
      default: "pendiente",
      enum: ["pendiente", "preparando", "entregado"],
    },
    observaciones: { type: String },
  },
  { timestamps: true },
);

export const OrderModel =
  (mongoose.models.Order as Model<OrderDocument>) ||
  mongoose.model<OrderDocument>("Order", orderSchema);
