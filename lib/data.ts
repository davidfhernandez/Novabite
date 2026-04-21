import { startOfDay } from "date-fns";

import { calculateSummary } from "@/lib/calculations";
import {
  MINI_JUEGO_COOLDOWN_HORAS,
  MINI_JUEGO_DURACION_SEGUNDOS,
  MINI_JUEGO_PUNTAJE_MAXIMO_VALIDO,
  MINI_JUEGO_PUNTOS_MAXIMOS,
  MINI_JUEGO_PUNTOS_POR_ACIERTO,
  PUNTOS_POR_CADA_MIL,
  RECOMPENSAS_LEALTAD,
} from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { initialProducts } from "@/lib/seed";
import { slugify, generateConsecutive } from "@/lib/utils";
import { AppStateModel } from "@/models/AppState";
import { CustomerModel } from "@/models/Customer";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import {
  ClienteFacturacion,
  ClienteCuenta,
  ClientePerfil,
  CreateOrdenResult,
  LoginClientePayload,
  MetricasAdmin,
  MiniJuegoPayload,
  MiniJuegoResultado,
  Orden,
  OrdenItem,
  OrdenPayload,
  Producto,
  ProductoPayload,
} from "@/types";

const CATALOG_SEED_KEY = "catalog-seeded";

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
  miniJuegoUltimoIntentoAt?: unknown;
  miniJuegoUltimoPuntaje?: unknown;
  miniJuegoMejorPuntaje?: unknown;
  miniJuegoPartidas?: unknown;
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

function buildMiniGameStatus(doc: RawCustomer): ClientePerfil["minijuego"] {
  const cooldownMs = MINI_JUEGO_COOLDOWN_HORAS * 60 * 60 * 1000;
  const lastAttempt = doc.miniJuegoUltimoIntentoAt
    ? new Date(String(doc.miniJuegoUltimoIntentoAt))
    : null;
  const availableAt = lastAttempt ? new Date(lastAttempt.getTime() + cooldownMs) : null;
  const available = !availableAt || availableAt.getTime() <= Date.now();

  return {
    disponible: available,
    duracionSegundos: MINI_JUEGO_DURACION_SEGUNDOS,
    cooldownHoras: MINI_JUEGO_COOLDOWN_HORAS,
    disponibleDesde: !available && availableAt ? availableAt.toISOString() : undefined,
    ultimoIntentoAt: lastAttempt?.toISOString(),
    ultimoPuntaje: Number(doc.miniJuegoUltimoPuntaje ?? 0),
    mejorPuntaje: Number(doc.miniJuegoMejorPuntaje ?? 0),
    partidasJugadas: Number(doc.miniJuegoPartidas ?? 0),
  };
}

async function markCatalogSeeded() {
  await AppStateModel.updateOne(
    { key: CATALOG_SEED_KEY },
    { key: CATALOG_SEED_KEY, value: "true" },
    { upsert: true },
  );
}

function aggregateItemQuantities(items: Array<Pick<OrdenItem, "productoId" | "cantidad">>) {
  return items.reduce((acc, item) => {
    acc.set(item.productoId, (acc.get(item.productoId) ?? 0) + item.cantidad);
    return acc;
  }, new Map<string, number>());
}

function normalizeCustomizationSelection(
  product: Producto,
  item: OrdenItem,
): OrdenItem["personalizacionesSeleccionadas"] {
  return item.personalizacionesSeleccionadas.map((selection) => {
    const group = product.personalizaciones.find((current) => current.id === selection.grupoId);
    const option = group?.opciones.find((current) => current.id === selection.opcionId);

    if (!group || !option) {
      throw new Error(
        `La personalización seleccionada para ${product.nombre} ya no está disponible.`,
      );
    }

    return {
      grupoId: group.id,
      grupoNombre: group.nombre,
      opcionId: option.id,
      opcionNombre: option.nombre,
      precio: option.precio,
    };
  });
}

async function resolveOrderItems(
  payloadItems: OrdenPayload["items"],
  reward?: NonNullable<ReturnType<typeof getRewardById>>,
) {
  const rewardProduct = reward
    ? await ProductModel.findOne({ slug: reward.slugProducto }).lean()
    : null;

  if (reward && !rewardProduct) {
    throw new Error("La recompensa seleccionada no está disponible en este momento.");
  }

  const requestedIds = Array.from(
    new Set([
      ...payloadItems.map((item) => item.productoId),
      ...(rewardProduct ? [String(rewardProduct._id)] : []),
    ]),
  );

  const rawProducts = requestedIds.length
    ? await ProductModel.find({ _id: { $in: requestedIds } }).lean()
    : [];
  const productsById = new Map(
    rawProducts.map((product) => {
      const serialized = serializeProduct(product);
      return [serialized._id, serialized] as const;
    }),
  );

  const normalizedPaidItems = payloadItems.map<OrdenItem>((item) => {
    const product = productsById.get(item.productoId);

    if (!product) {
      throw new Error("Uno de los productos del carrito ya no existe.");
    }

    return {
      productoId: product._id,
      nombre: product.nombre,
      slug: product.slug,
      imagen: product.imagenes[0],
      categoria: product.categoria,
      precioBase: product.precio,
      cantidad: item.cantidad,
      personalizacionesSeleccionadas: normalizeCustomizationSelection(product, item),
    };
  });

  const rewardItem =
    reward && rewardProduct
      ? {
          productoId: String(rewardProduct._id),
          nombre: String(rewardProduct.nombre),
          slug: String(rewardProduct.slug),
          imagen: (rewardProduct.imagenes?.[0] as string) ?? "",
          categoria: rewardProduct.categoria as OrdenItem["categoria"],
          precioBase: 0,
          cantidad: 1,
          personalizacionesSeleccionadas: [],
        }
      : null;

  const normalizedItems = rewardItem ? [...normalizedPaidItems, rewardItem] : normalizedPaidItems;
  const requestedQuantities = aggregateItemQuantities(normalizedItems);

  for (const [productId, requestedQuantity] of requestedQuantities.entries()) {
    const product = productsById.get(productId);

    if (!product) {
      throw new Error("Uno de los productos del pedido ya no está disponible.");
    }

    if (!product.disponible || product.stock <= 0) {
      throw new Error(`${product.nombre} no está disponible en este momento.`);
    }

    if (product.stock < requestedQuantity) {
      throw new Error(
        `${product.nombre} solo tiene ${product.stock} unidad(es) disponibles en este momento.`,
      );
    }
  }

  return {
    items: normalizedItems,
    paidItems: normalizedPaidItems,
    requestedQuantities,
  };
}

async function adjustProductStock(
  quantities: Map<string, number>,
  direction: "reserve" | "restore",
) {
  for (const [productId, quantity] of quantities.entries()) {
    const filter =
      direction === "reserve"
        ? { _id: productId, disponible: true, stock: { $gte: quantity } }
        : { _id: productId };
    const update = { $inc: { stock: direction === "reserve" ? -quantity : quantity } };
    const result = await ProductModel.updateOne(filter, update);

    if (result.modifiedCount !== 1) {
      throw new Error(
        direction === "reserve"
          ? "El inventario cambió mientras estabas pagando. Revisa el carrito e intenta de nuevo."
          : "No fue posible restaurar el inventario de la orden.",
      );
    }
  }
}

export async function ensureSeedData() {
  await connectToDatabase();
  const [count, seedState] = await Promise.all([
    ProductModel.countDocuments(),
    AppStateModel.findOne({ key: CATALOG_SEED_KEY }).lean(),
  ]);

  if (count > 0) {
    if (!seedState) {
      await markCatalogSeeded();
    }
    return;
  }

  if (seedState?.value === "true") {
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
  await markCatalogSeeded();
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
  if (reward && (customer.puntosDisponibles ?? 0) < reward.puntosNecesarios) {
    throw new Error("No tienes puntos suficientes para canjear esta recompensa.");
  }

  const { items, paidItems, requestedQuantities } = await resolveOrderItems(
    payload.items,
    reward ?? undefined,
  );
  const resumen = calculateSummary(paidItems, payload.cupon);
  const puntosGanados = Math.floor(resumen.total / 1000) * PUNTOS_POR_CADA_MIL;
  const puntosCanjeados = reward?.puntosNecesarios ?? 0;

  await adjustProductStock(requestedQuantities, "reserve");

  try {
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
    customer.puntosDisponibles =
      (customer.puntosDisponibles ?? 0) - puntosCanjeados + puntosGanados;
    customer.puntosHistoricos = (customer.puntosHistoricos ?? 0) + puntosGanados;
    customer.ultimoPedidoAt = new Date();
    await customer.save();

    return {
      orden: serializeOrder(created.toObject()),
      cliente: serializeCustomer(customer.toObject()),
      cuentaCreada,
    };
  } catch (error) {
    await adjustProductStock(requestedQuantities, "restore");
    throw error;
  }
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

export async function updateClientePerfil(id: string, payload: ClienteFacturacion) {
  await connectToDatabase();
  const customer = await CustomerModel.findById(id);

  if (!customer) {
    return null;
  }

  customer.nombre = payload.nombre;
  customer.correo = normalizeCustomerEmail(payload.correo);
  customer.telefono = payload.telefono;
  customer.tipoDocumento = payload.tipoDocumento;
  customer.numeroDocumento = payload.numeroDocumento.trim();
  customer.direccion = payload.direccion;
  customer.ciudad = payload.ciudad;
  customer.referencia = payload.referencia;
  await customer.save();

  return serializeCustomer(customer.toObject());
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
    minijuego: buildMiniGameStatus(customer),
  };
}

export async function reclamarPuntosMiniJuego(
  id: string,
  payload: MiniJuegoPayload,
): Promise<MiniJuegoResultado | null> {
  await connectToDatabase();
  const customer = await CustomerModel.findById(id);

  if (!customer) {
    return null;
  }

  const now = new Date();
  const cooldownMs = MINI_JUEGO_COOLDOWN_HORAS * 60 * 60 * 1000;
  const nextAvailableAt = customer.miniJuegoUltimoIntentoAt
    ? new Date(customer.miniJuegoUltimoIntentoAt.getTime() + cooldownMs)
    : null;

  if (nextAvailableAt && nextAvailableAt.getTime() > now.getTime()) {
    throw new Error("Ya jugaste tu ronda reciente. Espera al próximo reinicio para volver a ganar puntos.");
  }

  if (payload.elapsedMs > MINI_JUEGO_DURACION_SEGUNDOS * 1000 + 1_500) {
    throw new Error("La partida expiró. Inicia una nueva ronda para reclamar puntos.");
  }

  const score = Math.min(payload.score, MINI_JUEGO_PUNTAJE_MAXIMO_VALIDO);
  const puntosGanados = Math.min(
    MINI_JUEGO_PUNTOS_MAXIMOS,
    score * MINI_JUEGO_PUNTOS_POR_ACIERTO,
  );

  customer.puntosDisponibles = (customer.puntosDisponibles ?? 0) + puntosGanados;
  customer.puntosHistoricos = (customer.puntosHistoricos ?? 0) + puntosGanados;
  customer.miniJuegoUltimoIntentoAt = now;
  customer.miniJuegoUltimoPuntaje = score;
  customer.miniJuegoMejorPuntaje = Math.max(customer.miniJuegoMejorPuntaje ?? 0, score);
  customer.miniJuegoPartidas = (customer.miniJuegoPartidas ?? 0) + 1;
  await customer.save();

  const profile = await getClientePerfil(id);

  if (!profile) {
    throw new Error("No fue posible sincronizar tu cuenta después del juego.");
  }

  return {
    puntosGanados,
    perfil: profile,
  };
}

export async function deleteOrden(id: string) {
  await connectToDatabase();
  const order = await OrderModel.findById(id).lean();

  if (!order) {
    return null;
  }

  const serializedOrder = serializeOrder(order);
  const productQuantities = aggregateItemQuantities(serializedOrder.items);
  const customer = serializedOrder.clienteId
    ? await CustomerModel.findById(serializedOrder.clienteId)
    : null;
  const previousCustomerState = customer ? customer.toObject() : null;
  let inventoryRestored = false;

  try {
    await adjustProductStock(productQuantities, "restore");
    inventoryRestored = true;

    if (customer) {
      customer.pedidos = customer.pedidos.filter((pedidoId) => String(pedidoId) !== id);
      customer.totalPedidos = Math.max(0, (customer.totalPedidos ?? 0) - 1);
      customer.totalGastado = Math.max(0, (customer.totalGastado ?? 0) - serializedOrder.total);
      customer.puntosDisponibles = Math.max(
        0,
        (customer.puntosDisponibles ?? 0) -
          (serializedOrder.puntosGanados ?? 0) +
          (serializedOrder.puntosCanjeados ?? 0),
      );
      customer.puntosHistoricos = Math.max(
        0,
        (customer.puntosHistoricos ?? 0) - (serializedOrder.puntosGanados ?? 0),
      );

      const ultimoPedido = (await OrderModel.findOne({
        clienteId: serializedOrder.clienteId,
        _id: { $ne: id },
      })
        .sort({ createdAt: -1 })
        .select({ createdAt: 1 })
        .lean()) as { createdAt?: Date } | null;

      customer.ultimoPedidoAt = ultimoPedido?.createdAt
        ? new Date(String(ultimoPedido.createdAt))
        : undefined;
      await customer.save();
    }

    await OrderModel.findByIdAndDelete(id);
    return serializedOrder;
  } catch (error) {
    if (customer && previousCustomerState) {
      await CustomerModel.findByIdAndUpdate(customer._id, {
        nombre: previousCustomerState.nombre,
        correo: previousCustomerState.correo,
        telefono: previousCustomerState.telefono,
        tipoDocumento: previousCustomerState.tipoDocumento,
        numeroDocumento: previousCustomerState.numeroDocumento,
        direccion: previousCustomerState.direccion,
        ciudad: previousCustomerState.ciudad,
        referencia: previousCustomerState.referencia,
        pedidos: previousCustomerState.pedidos,
        totalPedidos: previousCustomerState.totalPedidos,
        totalGastado: previousCustomerState.totalGastado,
        puntosDisponibles: previousCustomerState.puntosDisponibles,
        puntosHistoricos: previousCustomerState.puntosHistoricos,
        ultimoPedidoAt: previousCustomerState.ultimoPedidoAt,
      });
    }

    if (inventoryRestored) {
      await adjustProductStock(productQuantities, "reserve").catch(() => undefined);
    }

    throw error;
  }
}
