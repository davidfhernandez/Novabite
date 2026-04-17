import { startOfDay } from "date-fns";

import { calculateSummary } from "@/lib/calculations";
import { connectToDatabase } from "@/lib/mongodb";
import { initialProducts } from "@/lib/seed";
import { slugify, generateConsecutive } from "@/lib/utils";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { MetricasAdmin, Orden, OrdenPayload, Producto, ProductoPayload } from "@/types";

type RawProduct = {
  _id: unknown;
  slug?: unknown;
  nombre?: unknown;
  descripcion?: unknown;
  descripcionLarga?: unknown;
  precio?: unknown;
  categoria?: unknown;
  imagenes?: unknown;
  rating?: unknown;
  ingredientes?: unknown;
  destacado?: unknown;
  stock?: unknown;
  disponible?: unknown;
  etiquetas?: unknown;
  personalizaciones?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type RawOrder = {
  _id: unknown;
  numeroOrden?: unknown;
  numeroFactura?: unknown;
  cliente?: unknown;
  items?: unknown;
  metodoPago?: unknown;
  cupon?: unknown;
  subtotal?: unknown;
  descuento?: unknown;
  iva?: unknown;
  total?: unknown;
  estado?: unknown;
  observaciones?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function serializeProduct(doc: RawProduct): Producto {
  return {
    _id: String(doc._id),
    slug: String(doc.slug),
    nombre: String(doc.nombre),
    descripcion: String(doc.descripcion),
    descripcionLarga: String(doc.descripcionLarga),
    precio: Number(doc.precio),
    categoria: doc.categoria as Producto["categoria"],
    imagenes: (doc.imagenes as string[]) ?? [],
    rating: Number(doc.rating),
    ingredientes: (doc.ingredientes as string[]) ?? [],
    destacado: Boolean(doc.destacado),
    stock: Number(doc.stock),
    disponible: Boolean(doc.disponible),
    etiquetas: (doc.etiquetas as string[]) ?? [],
    personalizaciones: (doc.personalizaciones as Producto["personalizaciones"]) ?? [],
    createdAt: doc.createdAt ? new Date(String(doc.createdAt)).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(String(doc.updatedAt)).toISOString() : undefined,
  };
}

function serializeOrder(doc: RawOrder): Orden {
  return {
    _id: String(doc._id),
    numeroOrden: String(doc.numeroOrden),
    numeroFactura: String(doc.numeroFactura),
    cliente: doc.cliente as Orden["cliente"],
    items: (doc.items as Orden["items"]) ?? [],
    metodoPago: String(doc.metodoPago),
    cupon: doc.cupon ? String(doc.cupon) : undefined,
    subtotal: Number(doc.subtotal),
    descuento: Number(doc.descuento),
    iva: Number(doc.iva),
    total: Number(doc.total),
    estado: doc.estado as Orden["estado"],
    observaciones: doc.observaciones ? String(doc.observaciones) : undefined,
    createdAt: new Date(String(doc.createdAt)).toISOString(),
    updatedAt: doc.updatedAt ? new Date(String(doc.updatedAt)).toISOString() : undefined,
  };
}

export async function ensureSeedData() {
  await connectToDatabase();
  const count = await ProductModel.countDocuments();

  if (count > 0) {
    return;
  }

  await ProductModel.insertMany(
    initialProducts.map((product) => ({
      ...product,
      slug: slugify(product.nombre),
      destacado: product.destacado ?? false,
      disponible: product.disponible ?? true,
      etiquetas: product.etiquetas ?? [],
      personalizaciones: product.personalizaciones ?? [],
    })),
  );
}

export async function getProductos(categoria?: string) {
  await ensureSeedData();
  const query = categoria ? { categoria } : {};
  const products = await ProductModel.find(query).sort({ destacado: -1, createdAt: -1 }).lean();
  return products.map((product) => serializeProduct(product));
}

export async function getProductoPorSlug(slug: string) {
  await ensureSeedData();
  const product = await ProductModel.findOne({ slug }).lean();
  return product ? serializeProduct(product) : null;
}

export async function getProductoPorId(id: string) {
  await connectToDatabase();
  const product = await ProductModel.findById(id).lean();
  return product ? serializeProduct(product) : null;
}

export async function createProducto(payload: ProductoPayload) {
  await connectToDatabase();
  const created = await ProductModel.create({
    ...payload,
    slug: slugify(payload.slug || payload.nombre),
    destacado: payload.destacado ?? false,
    disponible: payload.disponible ?? true,
    etiquetas: payload.etiquetas ?? [],
    personalizaciones: payload.personalizaciones ?? [],
  });

  return serializeProduct(created.toObject());
}

export async function updateProducto(id: string, payload: Partial<ProductoPayload>) {
  await connectToDatabase();
  const updated = await ProductModel.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(payload.slug || payload.nombre
        ? { slug: slugify(payload.slug || payload.nombre || "") }
        : {}),
    },
    { new: true, runValidators: true },
  ).lean();

  return updated ? serializeProduct(updated) : null;
}

export async function deleteProducto(id: string) {
  await connectToDatabase();
  return ProductModel.findByIdAndDelete(id).lean();
}

export async function getOrdenes() {
  await connectToDatabase();
  const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
  return orders.map((order) => serializeOrder(order));
}

export async function getOrdenPorId(id: string) {
  await connectToDatabase();
  const order = await OrderModel.findById(id).lean();
  return order ? serializeOrder(order) : null;
}

export async function createOrden(payload: OrdenPayload) {
  await connectToDatabase();
  const resumen = calculateSummary(payload.items, payload.cupon);

  const created = await OrderModel.create({
    ...payload,
    numeroOrden: generateConsecutive("ORD"),
    numeroFactura: generateConsecutive("FAC"),
    subtotal: resumen.subtotal,
    descuento: resumen.descuento,
    iva: resumen.iva,
    total: resumen.total,
    estado: "pendiente",
  });

  return serializeOrder(created.toObject());
}

export async function updateOrdenEstado(id: string, estado: Orden["estado"]) {
  await connectToDatabase();
  const updated = await OrderModel.findByIdAndUpdate(
    id,
    { estado },
    { new: true, runValidators: true },
  ).lean();

  return updated ? serializeOrder(updated) : null;
}

export async function getAdminMetrics(): Promise<MetricasAdmin> {
  await ensureSeedData();
  const [rawOrders, totalProductos] = await Promise.all([
    OrderModel.find().sort({ createdAt: -1 }).lean(),
    ProductModel.countDocuments(),
  ]);
  const orders = rawOrders as Array<{
    createdAt?: unknown;
    total?: unknown;
    estado?: unknown;
  }>;

  const inicioDia = startOfDay(new Date());
  const totalOrdenes = orders.length;
  const ingresos = orders.reduce((acc, order) => acc + Number(order.total), 0);
  const ordenesDelDia = orders.filter(
    (order) => new Date(String(order.createdAt)) >= inicioDia,
  ).length;

  const salesMap = new Map<string, number>();
  for (let days = 6; days >= 0; days -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const key = date.toISOString().split("T")[0];
    salesMap.set(key, 0);
  }

  orders.forEach((order) => {
    const key = new Date(String(order.createdAt)).toISOString().split("T")[0];
    if (salesMap.has(key)) {
      salesMap.set(key, (salesMap.get(key) ?? 0) + Number(order.total));
    }
  });

  const estados = ["pendiente", "preparando", "entregado"] as const;

  return {
    totalOrdenes,
    ingresos,
    totalProductos,
    ordenesDelDia,
    ventasPorDia: Array.from(salesMap.entries()).map(([fecha, total]) => ({
      fecha,
      total,
    })),
    ordenesPorEstado: estados.map((estado) => ({
      estado,
      total: orders.filter((order) => order.estado === estado).length,
    })),
  };
}
