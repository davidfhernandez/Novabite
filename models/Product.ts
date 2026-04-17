import mongoose, { Model, Schema } from "mongoose";

interface ProductDocument {
  slug: string;
  nombre: string;
  descripcion: string;
  descripcionLarga: string;
  precio: number;
  categoria: "hamburguesas" | "sushi" | "vegano" | "bebidas";
  imagenes: string[];
  rating: number;
  ingredientes: string[];
  destacado: boolean;
  stock: number;
  disponible: boolean;
  etiquetas: string[];
  personalizaciones: Array<{
    id: string;
    nombre: string;
    opciones: Array<{
      id: string;
      nombre: string;
      precio: number;
    }>;
  }>;
}

const productSchema = new Schema<ProductDocument>(
  {
    slug: { type: String, required: true, unique: true },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    descripcionLarga: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: {
      type: String,
      required: true,
      enum: ["hamburguesas", "sushi", "vegano", "bebidas"],
    },
    imagenes: { type: [String], required: true },
    rating: { type: Number, required: true, default: 4.8 },
    ingredientes: { type: [String], required: true },
    destacado: { type: Boolean, default: false },
    stock: { type: Number, default: 20 },
    disponible: { type: Boolean, default: true },
    etiquetas: { type: [String], default: [] },
    personalizaciones: {
      type: [
        {
          id: { type: String, required: true },
          nombre: { type: String, required: true },
          opciones: {
            type: [
              {
                id: { type: String, required: true },
                nombre: { type: String, required: true },
                precio: { type: Number, required: true },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const ProductModel =
  (mongoose.models.Product as Model<ProductDocument>) ||
  mongoose.model<ProductDocument>("Product", productSchema);
