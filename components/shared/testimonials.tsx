import { TESTIMONIOS } from "@/lib/constants";

export function Testimonials() {
  return (
    <section className="section-shell py-20">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
          Confianza real
        </p>
        <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Clientes que repiten por experiencia, no solo por antojo.
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {TESTIMONIOS.map((item) => (
          <article key={item.nombre} className="panel rounded-[28px] p-6">
            <p className="text-lg leading-8 text-[var(--foreground)]">
              “{item.comentario}”
            </p>
            <div className="mt-6">
              <p className="font-semibold">{item.nombre}</p>
              <p className="text-sm text-[var(--muted)]">{item.cargo}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
