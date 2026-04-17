"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { calculateSummary } from "@/lib/calculations";
import { ItemCarrito, PersonalizacionSeleccionada, Producto } from "@/types";

interface CartState {
  items: ItemCarrito[];
  coupon: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (
    product: Producto,
    cantidad?: number,
    personalizacionesSeleccionadas?: PersonalizacionSeleccionada[],
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  setCoupon: (coupon: string) => void;
  clearCart: () => void;
  getSummary: () => ReturnType<typeof calculateSummary>;
  getRecommendations: (products: Producto[]) => Producto[];
}

function buildLineId(productId: string, options: PersonalizacionSeleccionada[]) {
  const fingerprint = options
    .map((option) => `${option.grupoId}:${option.opcionId}`)
    .sort()
    .join("|");
  return `${productId}::${fingerprint}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: "",
      open: false,
      setOpen: (open) => set({ open }),
      addItem: (product, cantidad = 1, personalizacionesSeleccionadas = []) =>
        set((state) => {
          const id = buildLineId(product._id, personalizacionesSeleccionadas);
          const existing = state.items.find((item) => item.id === id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item,
              ),
              open: true,
            };
          }

          return {
            items: [
              ...state.items,
              {
                id,
                productoId: product._id,
                slug: product.slug,
                nombre: product.nombre,
                imagen: product.imagenes[0],
                categoria: product.categoria,
                precioBase: product.precio,
                cantidad,
                personalizacionesSeleccionadas,
              },
            ],
            open: true,
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, cantidad } : item,
                ),
        })),
      setCoupon: (coupon) => set({ coupon }),
      clearCart: () => set({ items: [], coupon: "", open: false }),
      getSummary: () => calculateSummary(get().items, get().coupon),
      getRecommendations: (products) => {
        const categories = new Set(get().items.map((item) => item.categoria));
        return products
          .filter(
            (product) =>
              !get().items.some((item) => item.productoId === product._id) &&
              (categories.size === 0 || categories.has(product.categoria)),
          )
          .slice(0, 3);
      },
    }),
    {
      name: "novabite-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    },
  ),
);
