"use client";

import Link from "next/link";
import { Rocket } from "lucide-react";

import { useCartStore } from "@/store/use-cart-store";

export function FloatingOrderButton() {
  const items = useCartStore((state) => state.items);

  return (
    <Link
      href={items.length > 0 ? "/checkout" : "/menu"}
      className="button-primary fixed bottom-5 right-4 z-20 rounded-full px-5 py-3 shadow-2xl lg:bottom-8 lg:right-8"
    >
      <Rocket className="mr-2 h-4 w-4" />
      {items.length > 0 ? "Finalizar pedido" : "Ordenar rápido"}
    </Link>
  );
}
