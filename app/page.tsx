import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Testimonials } from "@/components/shared/testimonials";
import { ProductCard } from "@/components/shared/product-card";
import { CATEGORIAS } from "@/lib/constants";
import { getProductos } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProductos();
  const hasProducts = products.length > 0;
  const featured = products.filter((product) => product.destacado).slice(0, 3);
  const productOfDay = hasProducts ? products[new Date().getDate() % products.length] : null;

  if (!hasProducts) {
    return (
      <section className="section-shell py-16">
        <div className="panel-strong mx-auto max-w-3xl rounded-[36px] p-8 text-center sm:p-10">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Catálogo vacío
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Aún no hay productos publicados.
          </h1>
          <p className="mt-4 text-[var(--muted)]">
            Crea el primer producto desde el panel admin para activar la tienda y el menú.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/productos" className="button-primary">
              Ir a productos
            </Link>
            <Link href="/menu" className="button-secondary">
              Ver menú vacío
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          <div className="grid-hero absolute inset-0 -z-10 rounded-[40px]" />
          <div className="panel-strong rounded-[40px] p-8 sm:p-12">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">
              Delivery gourmet del futuro
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight sm:text-6xl">
              Cocina premium, checkout real y una experiencia <span className="gradient-text">lista para vender.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
              NovaBite combina catálogo dinámico, carrito persistente, órdenes en MongoDB y facturación colombiana en PDF dentro de una interfaz audaz y mobile-first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className="button-primary">
                Ordenar ahora
              </Link>
              <Link href="#destacados" className="button-secondary">
                Ver menú
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Clock3, title: "Entrega ágil", text: "Rutas pensadas para pedidos rápidos y repetición." },
                { icon: ShieldCheck, title: "Flujo confiable", text: "Checkout, orden y PDF conectados de punta a punta." },
                { icon: Zap, title: "Diseño que vende", text: "Visual futurista con foco total en conversión." },
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <item.icon className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-4 font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-8 hidden h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl lg:block" />
          <div className="absolute -right-6 bottom-8 hidden h-32 w-32 rounded-full bg-violet-500/20 blur-3xl lg:block" />
          <div className="relative overflow-hidden rounded-[36px] border border-white/10">
            <Image
              src={productOfDay!.imagenes[0]}
              alt={productOfDay!.nombre}
              width={900}
              height={1100}
              className="h-full min-h-[520px] w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white">
                Producto del día
              </span>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{productOfDay!.nombre}</h2>
              <p className="mt-3 max-w-md text-sm text-white/75">{productOfDay!.descripcion}</p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/60">Desde</p>
                  <p className="text-2xl font-semibold">{formatCurrency(productOfDay!.precio)}</p>
                </div>
                <Link href={`/productos/${productOfDay!.slug}`} className="button-primary">
                  Ver detalle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="destacados" className="section-shell py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Destacados
            </p>
            <h2 className="mt-2 text-4xl font-semibold">Pedidos favoritos de la semana</h2>
          </div>
          <Link href="/menu" className="button-secondary">
            Ver todo el menú
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Categorías
          </p>
          <h2 className="mt-2 text-4xl font-semibold">Una carta corta, precisa y pensada para convertir.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORIAS.map((category, index) => (
            <div key={category.id} className="panel relative overflow-hidden rounded-[30px] p-6">
              <div className="absolute right-4 top-4 text-5xl font-semibold text-white/8">
                0{index + 1}
              </div>
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-5 text-2xl font-semibold">{category.nombre}</h3>
              <p className="mt-3 text-sm text-[var(--muted)]">{category.descripcion}</p>
              <Link href={`/menu?categoria=${category.id}`} className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)]">
                Explorar
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </>
  );
}
