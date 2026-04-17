"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Minus, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { PersonalizacionSeleccionada, Producto } from "@/types";

export function ProductDetailClient({
  product,
  related,
}: {
  product: Producto;
  related: Producto[];
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const personalizacionesSeleccionadas = useMemo<PersonalizacionSeleccionada[]>(
    () =>
      product.personalizaciones
        .map((group) => {
          const optionId = selectedOptions[group.id];
          const option = group.opciones.find((item) => item.id === optionId);
          return option
            ? {
                grupoId: group.id,
                grupoNombre: group.nombre,
                opcionId: option.id,
                opcionNombre: option.nombre,
                precio: option.precio,
              }
            : null;
        })
        .filter((value): value is PersonalizacionSeleccionada => Boolean(value)),
    [product.personalizaciones, selectedOptions],
  );

  const unitTotal =
    product.precio +
    personalizacionesSeleccionadas.reduce((acc, option) => acc + option.precio, 0);

  return (
    <section className="section-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative h-[360px] overflow-hidden rounded-[32px] lg:h-[520px]">
            <Image
              src={product.imagenes[0]}
              alt={product.nombre}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.imagenes.slice(1).map((image, index) => (
              <div key={image} className="relative h-40 overflow-hidden rounded-[24px]">
                <Image
                  src={image}
                  alt={`${product.nombre} ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          className="panel-strong rounded-[32px] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {product.categoria}
            </span>
            {product.etiquetas.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/8 px-4 py-2 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{product.nombre}</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">{product.descripcionLarga}</p>

          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Ingredientes
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.ingredientes.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full bg-white/5 px-4 py-2 text-sm"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {product.personalizaciones.map((group) => (
              <div key={group.id} className="panel rounded-[24px] p-4">
                <p className="text-sm font-semibold">{group.nombre}</p>
                <div className="mt-3 grid gap-3">
                  {group.opciones.map((option) => {
                    const active = selectedOptions[group.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((current) => ({
                            ...current,
                            [group.id]: active ? "" : option.id,
                          }))
                        }
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                          active
                            ? "border-violet-400 bg-violet-500/15"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span>{option.nombre}</span>
                        <span>{option.precio > 0 ? `+ ${formatCurrency(option.precio)}` : "Incluido"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Precio final unitario</p>
              <p className="text-3xl font-semibold">{formatCurrency(unitTotal)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="button-secondary h-11 w-11 rounded-full"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                className="button-secondary h-11 w-11 rounded-full"
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="button-primary mt-6 w-full"
            onClick={() => {
              addItem(product, quantity, personalizacionesSeleccionadas);
              toast.success("Producto agregado al carrito");
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Agregar al carrito
          </button>
        </motion.div>
      </div>

      {related.length > 0 ? (
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Recomendaciones
              </p>
              <h2 className="mt-2 text-3xl font-semibold">También te puede gustar</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <div key={item._id}>
                <a href={`/productos/${item.slug}`} className="panel block rounded-[28px] p-5">
                  <p className="text-lg font-semibold">{item.nombre}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.descripcion}</p>
                  <p className="mt-4 font-semibold">{formatCurrency(item.precio)}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
