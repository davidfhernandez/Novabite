import { MenuExplorer } from "@/components/menu/menu-explorer";
import { getProductos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const products = await getProductos();
  const { categoria } = await searchParams;

  return (
    <section className="section-shell py-12">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
          Menú vivo
        </p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
          Productos servidos desde MongoDB, listos para vender.
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Filtra, busca y agrega al carrito con una experiencia optimizada para móvil y desktop.
        </p>
      </div>
      <MenuExplorer products={products} initialCategory={categoria ?? "todas"} />
    </section>
  );
}
