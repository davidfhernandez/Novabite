"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartDrawer } from "@/components/layout/cart-drawer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/checkout", label: "Checkout" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const { items, setOpen } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">
                Gourmet futurista
              </p>
              <p className="text-xl font-semibold">NovaBite</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 lg:flex">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition",
                    active ? "bg-white/10 text-white" : "text-[var(--muted)] hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              className="button-secondary relative h-11 rounded-full px-4"
              onClick={() => setOpen(true)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Carrito
              {totalItems > 0 ? (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white"
                >
                  {totalItems}
                </motion.span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
