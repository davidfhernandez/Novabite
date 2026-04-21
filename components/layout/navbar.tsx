"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingCart, Sparkles, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { CartDrawer } from "@/components/layout/cart-drawer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useCustomerAuthStore } from "@/store/use-customer-auth-store";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/checkout", label: "Checkout" },
  { href: "/cuenta", label: "Mi cuenta" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const { items, setOpen } = useCartStore();
  const customer = useCustomerAuthStore((state) => state.customer);
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const activeLabel = customer ? "Perfil" : "Ingresar";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="section-shell flex h-[4.5rem] min-w-0 items-center justify-between gap-2 sm:h-20 sm:gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20 sm:h-11 sm:w-11">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="hidden text-sm uppercase tracking-[0.35em] text-[var(--muted)] sm:block">
                Gourmet futurista
              </p>
              <p className="truncate text-base font-semibold sm:text-xl">NovaBite</p>
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

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href={customer ? "/cuenta" : "/cuenta/login"}
              className="button-secondary hidden h-11 rounded-full px-4 md:inline-flex"
              onClick={() => setMobileOpen(false)}
            >
              <UserRound className="mr-2 h-4 w-4" />
              {customer ? "Perfil" : "Ingresar"}
            </Link>
            {/* <Link
              href={customer ? "/cuenta" : "/cuenta/login"}
              className="button-secondary hidden h-10 w-10 rounded-full md:hidden sm:h-11 sm:w-11 min-[480px]:inline-flex"
              aria-label={customer ? "Ir a perfil" : "Ingresar"}
              onClick={() => setMobileOpen(false)}
            >
              <UserRound className="h-[1.15rem] w-[1.15rem] stroke-[2.3]" />
            </Link> */}
            <div className="hidden min-[480px]:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="button-secondary relative hidden h-10 items-center rounded-full px-3 md:inline-flex sm:h-11 sm:px-4"
              onClick={() => {
                setMobileOpen(false);
                setOpen(true);
              }}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-[1.15rem] w-[1.15rem] stroke-[2.3] sm:mr-2" />
              <span className="hidden md:inline">Carrito</span>
              {totalItems > 0 ? (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-2 -top-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white sm:static sm:ml-2"
                >
                  {totalItems}
                </motion.span>
              ) : null}
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition lg:hidden sm:h-11 sm:w-11",
                mobileOpen
                  ? "border-violet-400/50 bg-violet-500/20 text-white shadow-lg shadow-violet-500/15"
                  : "border-white/10 bg-white/5 text-[var(--foreground)]",
              )}
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? (
                <X className="h-[1.2rem] w-[1.2rem] stroke-[2.6]" />
              ) : (
                <Menu className="h-[1.2rem] w-[1.2rem] stroke-[2.6]" />
              )}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Cerrar menú"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="panel-strong fixed inset-x-4 top-20 z-50 rounded-[28px] p-4 sm:top-24 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    Accesos rápidos
                  </p>
                  <p className="truncate text-sm font-semibold text-white">
                    {customer ? customer.nombre : "Tu cuenta y pedidos"}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="h-[1.1rem] w-[1.1rem] stroke-[2.5]" />
                </button>
              </div>

              <div className="mb-4 grid gap-2 min-[420px]:grid-cols-2">
                <Link
                  href={customer ? "/cuenta" : "/cuenta/login"}
                  onClick={() => setMobileOpen(false)}
                  className="button-secondary justify-start rounded-2xl px-4 py-3"
                >
                  <UserRound className="mr-3 h-[1.05rem] w-[1.05rem] stroke-[2.3]" />
                  {activeLabel}
                </Link>
                <button
                  type="button"
                  className="button-secondary justify-start rounded-2xl px-4 py-3"
                  onClick={() => {
                    setMobileOpen(false);
                    setOpen(true);
                  }}
                >
                  <ShoppingCart className="mr-3 h-[1.05rem] w-[1.05rem] stroke-[2.3]" />
                  Carrito
                  {totalItems > 0 ? (
                    <span className="ml-3 inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white">
                      {totalItems}
                    </span>
                  ) : null}
                </button>
                <div className="min-[420px]:col-span-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Tema</p>
                    <p className="text-xs text-[var(--muted)]">
                      Cambia entre modo claro y oscuro
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <nav className="grid gap-2">
                {links.map((link) => {
                  const active =
                    link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm transition",
                        active
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-[var(--muted)] hover:text-white",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                {customer
                  ? `Sesión activa como ${customer.nombre}.`
                  : "Ingresa o crea tu cuenta automáticamente al finalizar tu primer pedido."}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
      <CartDrawer />
    </>
  );
}
