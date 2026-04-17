"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";

import { downloadInvoicePdf } from "@/lib/pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Orden } from "@/types";

export function OrderConfirmationClient({ order }: { order: Orden }) {
  useEffect(() => {
    const timer = window.setTimeout(() => downloadInvoicePdf(order), 600);
    return () => window.clearTimeout(timer);
  }, [order]);

  return (
    <section className="section-shell py-14">
      <div className="panel-strong mx-auto max-w-4xl rounded-[34px] p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Compra confirmada
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Tu pedido ya está en cocina</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              La factura PDF se descarga automáticamente y también queda disponible desde el panel administrativo.
            </p>
          </div>
          <button
            type="button"
            className="button-primary"
            onClick={() => downloadInvoicePdf(order)}
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar factura
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="panel rounded-[28px] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Datos de la orden
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Pedido</span>
                <span>{order.numeroOrden}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Factura</span>
                <span>{order.numeroFactura}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Estado</span>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-300">
                  {order.estado}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Fecha</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Total</span>
                <span className="text-lg font-semibold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="panel rounded-[28px] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Facturación colombiana
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="text-[var(--muted)]">Cliente:</span> {order.cliente.nombre}
              </p>
              <p>
                <span className="text-[var(--muted)]">Documento:</span>{" "}
                {order.cliente.tipoDocumento} {order.cliente.numeroDocumento}
              </p>
              <p>
                <span className="text-[var(--muted)]">Dirección:</span> {order.cliente.direccion}
              </p>
              <p>
                <span className="text-[var(--muted)]">Teléfono:</span> {order.cliente.telefono}
              </p>
              <p className="rounded-2xl bg-white/5 p-4 text-[var(--muted)]">
                Documento equivalente - no es factura electrónica DIAN (simulación).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 panel rounded-[28px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-xl font-semibold">Detalle del pedido</h2>
          </div>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={`${item.productoId}-${item.nombre}`}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4"
              >
                <div>
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-sm text-[var(--muted)]">
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
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/menu" className="button-secondary">
              Seguir comprando
            </Link>
            <Link href="/admin/ordenes" className="button-primary">
              Ver en admin
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
