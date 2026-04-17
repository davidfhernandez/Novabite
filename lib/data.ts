import { startOfDay } from "date-fns";

import { calculateSummary } from "@/lib/calculations";
import { PUNTOS_POR_CADA_MIL, RECOMPENSAS_LEALTAD } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { initialProducts } from "@/lib/seed";
import { slugify, generateConsecutive } from "@/lib/utils";
import { CustomerModel } from "@/models/Customer";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import {
  ClienteCuenta,
  ClientePerfil,
  CreateOrdenResult,
  LoginClientePayload,
  MetricasAdmin,
  Orden,
  OrdenItem,
  OrdenPayload,
  Producto,
  ProductoPayload,
} from "@/types";

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
  clienteId?: unknown;
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
  puntosGanados?: unknown;
  puntosCanjeados?: unknown;
  recompensaCanjeada?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type RawCustomer = {
  _id: unknown;
  nombre?: unknown;
  correo?: unknown;
  telefono?: unknown;
  tipoDocumento?: unknown;
  numeroDocumento?: unknown;
  direccion?: unknown;
  ciudad?: unknown;
  referencia?: unknown;
  totalPedidos?: unknown;
  totalGastado?: unknown;
  puntosDisponibles?: unknown;
  puntosHistoricos?: unknown;
  ultimoPedidoAt?: unknown;
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
    clienteId: doc.clienteId ? String(doc.clienteId) : undefined,
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
    puntosGanados: Number(doc.puntosGanados ?? 0),
    puntosCanjeados: Number(doc.puntosCanjeados ?? 0),
    recompensaCanjeada: doc.recompensaCanjeada ? String(doc.recompensaCanjeada) : undefined,
    createdAt: new Date(String(doc.createdAt)).toISOString(),
    updatedAt: doc.updatedAt ? new Date(String(doc.updatedAt)).toISOString() : undefined,
  };
}

function serializeCustomer(doc: RawCustomer): ClienteCuenta {
  return {
    _id: String(doc._id),
    nombre: String(doc.nombre),
    correo: String(doc.correo),
    telefono: String(doc.telefono),
    tipoDocumento: doc.tipoDocumento as ClienteCuenta["tipoDocumento"],
    numeroDocumento: String(doc.numeroDocumento),
    direccion: String(doc.direccion),
    ciudad: String(doc.ciudad),
    referencia: doc.referencia ? String(doc.referencia) : undefined,
    totalPedidos: Number(doc.totalPedidos ?? 0),
    totalGastado: Number(doc.totalGastado ?? 0),
    puntosDisponibles: Number(doc.puntosDisponibles ?? 0),
    puntosHistoricos: Number(doc.puntosHistoricos ?? 0),
    ultimoPedidoAt: doc.ultimoPedidoAt
      ? new Date(String(doc.ultimoPedidoAt)).toISOString()
      : undefined,
    createdAt: doc.createdAt ? new Date(String(doc.createdAt)).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(String(doc.updatedAt)).toISOString() : undefined,
  };
}

function getRewardById(recompensaId?: string) {
  if (!recompensaId) {
    return null;
  }

  return RECOMPENSAS_LEALTAD.find((reward) => reward.id === recompensaId) ?? null;
}

function normalizeCustomerEmail(email: string) {
  return email.trim().toLowerCase();
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

export async function createOrden(payload: OrdenPayload): Promise<CreateOrdenResult> {
  await connectToDatabase();
  const normalizedEmail = normalizeCustomerEmail(payload.cliente.correo);
  let customer = await CustomerModel.findOne({
    correo: normalizedEmail,
    numeroDocumento: payload.cliente.numeroDocumento,
  });
  let cuentaCreada = false;

  if (!customer) {
    customer = await CustomerModel.create({
      ...payload.cliente,
      correo: normalizedEmail,
      totalPedidos: 0,
      totalGastado: 0,
      puntosDisponibles: 0,
      puntosHistoricos: 0,
    });
    cuentaCreada = true;
  } else {
    customer.nombre = payload.cliente.nombre;
    customer.telefono = payload.cliente.telefono;
    customer.tipoDocumento = payload.cliente.tipoDocumento;
    customer.numeroDocumento = payload.cliente.numeroDocumento;
    customer.direccion = payload.cliente.direccion;
    customer.ciudad = payload.cliente.ciudad;
    customer.referencia = payload.cliente.referencia;
    customer.correo = normalizedEmail;
  }

  const reward = getRewardById(payload.recompensaId);
  const freeRewardProduct = reward
    ? await ProductModel.findOne({ slug: reward.slugProducto }).lean()
    : null;

  if (reward && !freeRewardProduct) {
    throw new Error("La recompensa seleccionada no está disponible en este momento.");
  }

  if (reward && (customer.puntosDisponibles ?? 0) < reward.puntosNecesarios) {
    throw new Error("No tienes puntos suficientes para canjear esta recompensa.");
  }

  const rewardItem: OrdenItem[] =
    reward && freeRewardProduct
      ? [
          {
            productoId: String(freeRewardProduct._id),
            nombre: String(freeRewardProduct.nombre),
            slug: String(freeRewardProduct.slug),
            imagen: (freeRewardProduct.imagenes?.[0] as string) ?? "",
            categoria: freeRewardProduct.categoria as OrdenItem["categoria"],
            precioBase: 0,
            cantidad: 1,
            personalizacionesSeleccionadas: [],
          },
        ]
      : [];

  const items = [...payload.items, ...rewardItem];
  const resumen = calculateSummary(payload.items, payload.cupon);
  const puntosGanados = Math.floor(resumen.total / 1000) * PUNTOS_POR_CADA_MIL;
  const puntosCanjeados = reward?.puntosNecesarios ?? 0;

  const created = await OrderModel.create({
    ...payload,
    clienteId: customer._id,
    cliente: {
      ...payload.cliente,
      correo: normalizedEmail,
    },
    items,
    numeroOrden: generateConsecutive("ORD"),
    numeroFactura: generateConsecutive("FAC"),
    subtotal: resumen.subtotal,
    descuento: resumen.descuento,
    iva: resumen.iva,
    total: resumen.total,
    estado: "pendiente",
    puntosGanados,
    puntosCanjeados,
    recompensaCanjeada: reward?.nombre,
  });

  customer.pedidos.push(created._id);
  customer.totalPedidos += 1;
  customer.totalGastado += resumen.total;
  customer.puntosDisponibles = (customer.puntosDisponibles ?? 0) - puntosCanjeados + puntosGanados;
  customer.puntosHistoricos = (customer.puntosHistoricos ?? 0) + puntosGanados;
  customer.ultimoPedidoAt = new Date();
  await customer.save();

  return {
    orden: serializeOrder(created.toObject()),
    cliente: serializeCustomer(customer.toObject()),
    cuentaCreada,
  };
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

export async function loginCliente(payload: LoginClientePayload) {
  await connectToDatabase();
  const customer = await CustomerModel.findOne({
    correo: normalizeCustomerEmail(payload.correo),
    numeroDocumento: payload.numeroDocumento.trim(),
  }).lean();

  if (!customer) {
    return null;
  }

  return serializeCustomer(customer);
}

export async function getClientePerfil(id: string): Promise<ClientePerfil | null> {
  await connectToDatabase();
  const customer = await CustomerModel.findById(id).lean();

  if (!customer) {
    return null;
  }

  const orders = await OrderModel.find({ clienteId: id }).sort({ createdAt: -1 }).lean();
  const baseCustomer = serializeCustomer(customer);

  return {
    ...baseCustomer,
    pedidos: orders.map((order) => serializeOrder(order)),
    recompensasDisponibles: RECOMPENSAS_LEALTAD,
  };
}
