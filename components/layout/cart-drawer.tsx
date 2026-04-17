"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { getItemUnitPrice } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

export function CartDrawer() {
  const {
    items,
    open,
    coupon,
    setOpen,
    updateQuantity,
    removeItem,
    setCoupon,
    getSummary,
  } = useCartStore();

  const summary = getSummary();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="panel-strong scrollbar-thin fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col overflow-y-auto border-l p-5"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
                  Pedido activo
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Tu carrito NovaBite</h2>
              </div>
              <button
                type="button"
                className="button-secondary h-11 w-11 rounded-full"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="panel flex flex-1 flex-col items-center justify-center rounded-[28px] p-8 text-center">
                <ShoppingBag className="mb-4 h-10 w-10 text-[var(--primary)]" />
                <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
                <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                  Explora el menú, agrega tus favoritos y vuelve aquí para completar el pedido.
                </p>
                <Link
                  href="/menu"
                  onClick={() => setOpen(false)}
                  className="button-primary mt-5"
                >
                  Ver menú
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="panel flex gap-3 rounded-[24px] p-3"
                    >
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{item.nombre}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {item.personalizacionesSeleccionadas.length > 0
                                ? item.personalizacionesSeleccionadas
                                    .map((option) => option.opcionNombre)
                                    .join(", ")
                                : "Preparación estándar"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[var(--muted)] transition hover:text-red-400"
                            aria-label={`Eliminar ${item.nombre}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="button-secondary h-9 w-9 rounded-full"
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-6 text-center text-sm font-semibold">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              className="button-secondary h-9 w-9 rounded-full"
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(getItemUnitPrice(item) * item.cantidad)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel mt-6 rounded-[28px] p-5">
                  <label className="mb-2 block text-sm text-[var(--muted)]" htmlFor="coupon">
                    Cupón
                  </label>
                  <input
                    id="coupon"
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value)}
                    placeholder="Ejemplo: NOVA10"
                    className="input-shell"
                  />
                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Subtotal</span>
                      <span>{formatCurrency(summary.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Descuento</span>
                      <span>{formatCurrency(summary.descuento)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">IVA 19%</span>
                      <span>{formatCurrency(summary.iva)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(summary.total)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="button-primary mt-5 w-full"
                  >
                    Ir al checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
