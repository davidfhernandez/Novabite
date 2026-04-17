"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { Producto } from "@/types";

export function ProductCard({ product }: { product: Producto }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6 }}
      className="panel group overflow-hidden rounded-[30px]"
    >
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.imagenes[0]}
            alt={product.nombre}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
              {product.categoria}
            </span>
            {product.stock <= 5 ? (
              <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-slate-950">
                Bajo stock
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/productos/${product.slug}`}>
              <h3 className="text-xl font-semibold">{product.nombre}</h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
              {product.descripcion}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            {product.rating.toFixed(1)}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">Desde</p>
            <p className="text-2xl font-semibold">{formatCurrency(product.precio)}</p>
          </div>
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              addItem(product, 1, []);
              toast.success(`${product.nombre} agregado al carrito`);
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>
    </motion.article>
  );
}
