"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/shared/product-card";
import { CATEGORIAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Producto } from "@/types";

export function MenuExplorer({
  products,
  initialCategory = "todas",
}: {
  products: Producto[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "todas" || product.categoria === category;
      const haystack = `${product.nombre} ${product.descripcion} ${product.ingredientes.join(" ")}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  return (
    <div className="space-y-8">
      <div className="panel rounded-[30px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="input-shell pl-11"
              placeholder="Busca hamburguesas, sushi, ingredientes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("todas")}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition",
                category === "todas"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white/5 text-[var(--muted)]",
              )}
            >
              Todas
            </button>
            {CATEGORIAS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  category === item.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-white/5 text-[var(--muted)]",
                )}
              >
                {item.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${category}-${query}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="panel rounded-[30px] p-8 text-center text-[var(--muted)]">
          No encontramos productos con ese filtro. Prueba otra categoría o cambia tu búsqueda.
        </div>
      ) : null}
    </div>
  );
}
