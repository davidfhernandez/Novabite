import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-shell flex min-h-[calc(100vh-12rem)] items-center justify-center py-14">
      <div className="panel-strong w-full max-w-3xl rounded-[36px] p-8 text-center sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Esta página ya no está disponible.
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Puede que el producto, pedido o sección que buscabas haya cambiado o ya no exista.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="button-primary">
            Ir al inicio
          </Link>
          <Link href="/menu" className="button-secondary">
            Ver menú
          </Link>
          <Link href="/cuenta" className="button-secondary">
            Mi cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}
