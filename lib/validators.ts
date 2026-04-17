import { z } from "zod";

const opcionSeleccionadaSchema = z.object({
  grupoId: z.string().min(1),
  grupoNombre: z.string().min(1),
  opcionId: z.string().min(1),
  opcionNombre: z.string().min(1),
  precio: z.number().min(0),
});

export const productSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().min(10),
  descripcionLarga: z.string().min(20),
  precio: z.number().min(1000),
  categoria: z.enum(["hamburguesas", "sushi", "vegano", "bebidas"]),
  imagenes: z.array(z.string().url()).min(1),
  rating: z.number().min(0).max(5),
  ingredientes: z.array(z.string().min(1)).min(1),
  destacado: z.boolean().optional(),
  stock: z.number().int().min(0),
  disponible: z.boolean().optional(),
  etiquetas: z.array(z.string()).optional(),
  personalizaciones: z
    .array(
      z.object({
        id: z.string().min(1),
        nombre: z.string().min(1),
        opciones: z.array(
          z.object({
            id: z.string().min(1),
            nombre: z.string().min(1),
            precio: z.number().min(0),
          }),
        ),
      }),
    )
    .optional(),
});

export const orderSchema = z.object({
  cliente: z.object({
    nombre: z.string().min(3),
    correo: z.email(),
    telefono: z.string().min(7),
    tipoDocumento: z.enum(["CC", "NIT", "CE"]),
    numeroDocumento: z.string().min(5),
    direccion: z.string().min(8),
    ciudad: z.string().min(3),
    referencia: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productoId: z.string().min(1),
        nombre: z.string().min(1),
        slug: z.string().min(1),
        imagen: z.string().url(),
        categoria: z.enum(["hamburguesas", "sushi", "vegano", "bebidas"]),
        precioBase: z.number().min(1000),
        cantidad: z.number().int().min(1),
        personalizacionesSeleccionadas: z.array(opcionSeleccionadaSchema),
      }),
    )
    .min(1),
  metodoPago: z.string().min(3),
  cupon: z.string().optional(),
  observaciones: z.string().optional(),
  recompensaId: z.string().optional(),
});

export const orderStatusSchema = z.object({
  estado: z.enum(["pendiente", "preparando", "entregado"]),
});

export const customerLoginSchema = z.object({
  correo: z.email(),
  numeroDocumento: z.string().min(5),
});
