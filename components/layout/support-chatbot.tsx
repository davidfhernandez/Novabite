"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircleMore, SendHorizontal, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { METODOS_PAGO, NEGOCIO, RECOMPENSAS_LEALTAD } from "@/lib/constants";
import { initialProducts } from "@/lib/seed";
import { formatCurrency } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const QUICK_QUESTIONS = [
  "¿Qué recomiendas del menú?",
  "Métodos de pago",
  "Tiempos de entrega",
  "PQRS",
  "Puntos y recompensas",
  "Factura y soporte",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildRadicado() {
  return `PQRS-${Date.now().toString().slice(-6)}`;
}

export function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Soy NovaBot. Te ayudo con menú, pagos, entregas, puntos, facturas y PQRS usando la información dummy actual de NovaBite.",
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const featuredProducts = useMemo(
    () => initialProducts.filter((product) => product.destacado).slice(0, 3),
    [],
  );

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  function getAssistantReply(question: string) {
    const normalized = normalizeText(question);
    const matchedProduct = initialProducts.find((product) => {
      const name = normalizeText(product.nombre);
      const slug = normalizeText(product.nombre.replace(/\s+/g, "-"));
      return normalized.includes(name) || normalized.includes(slug);
    });

    if (matchedProduct) {
      return `${matchedProduct.nombre} está en ${matchedProduct.categoria}, cuesta ${formatCurrency(
        matchedProduct.precio,
      )}, y destaca por ${matchedProduct.descripcion.toLowerCase()}`;
    }

    if (
      normalized.includes("pqrs") ||
      normalized.includes("queja") ||
      normalized.includes("reclamo") ||
      normalized.includes("peticion") ||
      normalized.includes("sugerencia")
    ) {
      return `Puedes radicar una PQRS al correo ${NEGOCIO.correo} o al WhatsApp ${NEGOCIO.telefono}. Para esta demo te dejo un radicado automático: ${buildRadicado()}. Tiempo estimado de respuesta: 1 día hábil.`;
    }

    if (
      normalized.includes("pago") ||
      normalized.includes("nequi") ||
      normalized.includes("daviplata") ||
      normalized.includes("tarjeta")
    ) {
      return `Aceptamos ${METODOS_PAGO.join(", ")}. El cupón dummy activo es NOVA10 y aplica 10% sobre el subtotal.`;
    }

    if (
      normalized.includes("envio") ||
      normalized.includes("domicilio") ||
      normalized.includes("entrega") ||
      normalized.includes("cuanto demora") ||
      normalized.includes("tiempo")
    ) {
      return `En esta demo manejamos entregas en Bogotá D.C. desde ${NEGOCIO.direccion}. La promesa operativa es de 30 a 45 minutos, con validación final en checkout.`;
    }

    if (
      normalized.includes("pedido") ||
      normalized.includes("orden") ||
      normalized.includes("estado")
    ) {
      return "Puedes seguir tu pedido desde la pantalla de confirmación justo después del checkout, o desde Mi cuenta cuando ya existe un historial asociado a tu documento.";
    }

    if (
      normalized.includes("puntos") ||
      normalized.includes("recompensa") ||
      normalized.includes("lealtad")
    ) {
      return `Nova Puntos te permite canjear ${RECOMPENSAS_LEALTAD.map((reward) => reward.nombre).join(
        ", ",
      )}. Los puntos se acumulan automáticamente al pagar y se redimen dentro del checkout.`;
    }

    if (
      normalized.includes("factura") ||
      normalized.includes("comprobante") ||
      normalized.includes("soporte")
    ) {
      return `Cada compra genera un PDF descargable desde la confirmación de pedido y también desde el panel admin. Si necesitas soporte, escríbenos a ${NEGOCIO.correo}.`;
    }

    if (
      normalized.includes("menu") ||
      normalized.includes("recomienda") ||
      normalized.includes("hamburguesa") ||
      normalized.includes("sushi") ||
      normalized.includes("vegano") ||
      normalized.includes("bebida")
    ) {
      return `Hoy te recomiendo ${featuredProducts
        .map((product) => `${product.nombre} (${formatCurrency(product.precio)})`)
        .join(", ")}.`;
    }

    if (
      normalized.includes("hola") ||
      normalized.includes("buenas") ||
      normalized.includes("ayuda")
    ) {
      return "Puedo ayudarte con productos del menú, pagos, envíos, puntos, factura o PQRS. Si quieres, pregúntame por un producto específico.";
    }

    return `Puedo ayudarte con menú, checkout, puntos, facturas, tiempos de entrega y PQRS. También puedes escribirnos a ${NEGOCIO.correo} o al ${NEGOCIO.telefono}.`;
  }

  function pushAssistantReply(question: string) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text: cleanQuestion },
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: getAssistantReply(cleanQuestion),
      },
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushAssistantReply(input);
  }

  return (
    <>
      <button
        type="button"
        className="button-secondary fixed bottom-5 left-4 z-30 h-12 w-12 rounded-full border-white/20 bg-black/55 p-0 backdrop-blur-xl"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircleMore className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="panel-strong fixed bottom-22 left-4 right-4 z-40 flex max-h-[72vh] flex-col overflow-hidden rounded-[30px] sm:right-auto sm:w-[390px]"
          >
            <div className="border-b border-white/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">NovaBot</p>
                    <p className="text-sm text-[var(--muted)]">
                      Asistente dummy de soporte y ventas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="button-secondary h-10 w-10 rounded-full"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={listRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "assistant"
                      ? "mr-8 rounded-[22px] bg-white/6 p-4 text-sm"
                      : "ml-8 rounded-[22px] bg-violet-500/18 p-4 text-sm"
                  }
                >
                  {message.text}
                </div>
              ))}

              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--muted)] transition hover:text-white"
                    onClick={() => pushAssistantReply(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/4 p-4 text-xs text-[var(--muted)]">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  Respuestas basadas en la información actual del proyecto.
                </div>
                <p className="mt-2">
                  Contacto demo: {NEGOCIO.telefono} · {NEGOCIO.correo}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <input
                  className="input-shell"
                  placeholder="Pregunta por menú, pagos, puntos o PQRS..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <button type="submit" className="button-primary h-12 w-12 rounded-full p-0">
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
