"use client";

import { useMemo, useState } from "react";
import { Download, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { downloadInvoicePdf } from "@/lib/pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Orden } from "@/types";

export function OrdersManager({ initialOrders }: { initialOrders: Orden[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((order) =>
      `${order.numeroOrden} ${order.numeroFactura} ${order.cliente.nombre} ${order.cliente.numeroDocumento}`
        .toLowerCase()
        .includes(q),
    );
  }, [orders, query]);

  async function updateStatus(id: string, estado: Orden["estado"]) {
    try {
      const response = await fetch(`/api/ordenes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      const updated = await response.json();
      setOrders((current) =>
        current.map((order) => (order._id === id ? updated : order)),
      );
      setSelectedOrder((current) => (current?._id === id ? updated : current));
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "¿Eliminar esta orden? Se restaurará el inventario y se revertirán los puntos del cliente.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/ordenes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No se pudo eliminar la orden");
      }

      setOrders((current) => current.filter((order) => order._id !== id));
      setSelectedOrder((current) => (current?._id === id ? null : current));
      toast.success("Orden eliminada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel rounded-[28px] p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="input-shell pl-11"
            placeholder="Buscar por cliente, orden, factura o documento"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="panel-strong overflow-hidden rounded-[30px]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Gestión de órdenes
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Pedidos y facturas</h1>
          </div>
          <a href="/api/exportar/ordenes" className="button-secondary w-full justify-center sm:w-auto">
            Exportar CSV
          </a>
        </div>

        <div className="space-y-4 p-4 md:hidden">
          {filtered.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
              No encontramos órdenes con ese filtro.
            </div>
          ) : (
            filtered.map((order) => (
              <article
                key={order._id}
                className="rounded-[24px] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.numeroOrden}</p>
                    <p className="text-xs text-[var(--muted)]">{order.numeroFactura}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                  <p>{order.cliente.nombre}</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div className="mt-4">
                  <select
                    className="input-shell"
                    value={order.estado}
                    onChange={(event) =>
                      updateStatus(order._id, event.target.value as Orden["estado"])
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="preparando">Preparando</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    className="button-secondary w-full justify-center"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    className="button-primary w-full justify-center"
                    onClick={() => downloadInvoicePdf(order)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Factura
                  </button>
                  <button
                    type="button"
                    className="button-secondary w-full justify-center text-red-300"
                    onClick={() => handleDelete(order._id)}
                    disabled={deletingId === order._id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === order._id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--muted)]">
                    No encontramos órdenes con ese filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id} className="border-t border-white/10">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{order.numeroOrden}</p>
                        <p className="text-xs text-[var(--muted)]">{order.numeroFactura}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{order.cliente.nombre}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {order.cliente.tipoDocumento} {order.cliente.numeroDocumento}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <select
                        className="input-shell min-w-36"
                        value={order.estado}
                        onChange={(event) =>
                          updateStatus(order._id, event.target.value as Orden["estado"])
                        }
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="preparando">Preparando</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Ver detalle
                        </button>
                        <button
                          type="button"
                          className="button-primary"
                          onClick={() => downloadInvoicePdf(order)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Factura
                        </button>
                        <button
                          type="button"
                          className="button-secondary text-red-300"
                          onClick={() => handleDelete(order._id)}
                          disabled={deletingId === order._id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === order._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="panel-strong scrollbar-thin max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                  Detalle de orden
                </p>
                <h2 className="mt-2 text-3xl font-semibold">{selectedOrder.numeroOrden}</h2>
              </div>
              <button
                type="button"
                className="button-secondary h-11 w-11 rounded-full"
                onClick={() => setSelectedOrder(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="panel rounded-[24px] p-5 text-sm">
                <p className="font-semibold">Cliente</p>
                <div className="mt-3 space-y-2 text-[var(--muted)]">
                  <p>{selectedOrder.cliente.nombre}</p>
                  <p>
                    {selectedOrder.cliente.tipoDocumento}{" "}
                    {selectedOrder.cliente.numeroDocumento}
                  </p>
                  <p>{selectedOrder.cliente.telefono}</p>
                  <p>{selectedOrder.cliente.direccion}</p>
                </div>
              </div>
              <div className="panel rounded-[24px] p-5 text-sm">
                <p className="font-semibold">Totales</p>
                <div className="mt-3 space-y-2 text-[var(--muted)]">
                  <p>Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
                  <p>IVA: {formatCurrency(selectedOrder.iva)}</p>
                  <p>Descuento: {formatCurrency(selectedOrder.descuento)}</p>
                  <p className="font-semibold text-white">
                    Total: {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 panel rounded-[24px] p-5">
              <p className="font-semibold">Productos</p>
              <div className="mt-4 space-y-4">
                {selectedOrder.items.map((item) => (
                  <div
                    key={`${item.productoId}-${item.nombre}`}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{item.nombre}</p>
                      <p className="text-[var(--muted)]">
                        {item.cantidad} unidad(es)
                        {item.personalizacionesSeleccionadas.length > 0
                          ? ` · ${item.personalizacionesSeleccionadas
                              .map((option) => option.opcionNombre)
                              .join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <span>{formatCurrency(item.precioBase * item.cantidad)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
