"use client";

import { motion } from "framer-motion";
import { Gamepad2, TimerReset, Trophy, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  MINI_JUEGO_PUNTOS_MAXIMOS,
  MINI_JUEGO_PUNTOS_POR_ACIERTO,
} from "@/lib/constants";
import { ClientePerfil, EstadoMiniJuego, MiniJuegoResultado } from "@/types";

const BOARD_SIZE = 6;
const BOARD_CELLS = Array.from({ length: BOARD_SIZE }, (_, index) => index);

function pickCell(previous: number | null = null) {
  let next = Math.floor(Math.random() * BOARD_SIZE);

  if (previous === null) {
    return next;
  }

  while (next === previous) {
    next = Math.floor(Math.random() * BOARD_SIZE);
  }

  return next;
}

function formatClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function LoyaltyMiniGame({
  customerId,
  game,
  onProfileUpdate,
}: {
  customerId: string;
  game: EstadoMiniJuego;
  onProfileUpdate: (profile: ClientePerfil) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(game.duracionSegundos * 1000);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Inicia una ronda y toca el botón brillante lo más rápido posible.",
  );
  const scoreRef = useRef(0);
  const finishingRef = useRef(false);
  const durationMs = game.duracionSegundos * 1000;
  const progress = Math.max(0, Math.min(100, (timeLeftMs / durationMs) * 100));
  const canPlay = Boolean(customerId) && !playing && !submitting;

  const finishRound = useCallback(
    async (elapsedMs: number) => {
      if (finishingRef.current) {
        return;
      }

      finishingRef.current = true;
      setPlaying(false);
      setActiveCell(null);
      setSubmitting(true);
      setStatusMessage(`Ronda terminada. Guardando ${scoreRef.current * MINI_JUEGO_PUNTOS_POR_ACIERTO} puntos potenciales...`);

      try {
        const response = await fetch(`/api/cuenta/${customerId}/minijuego`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: scoreRef.current,
            elapsedMs,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "No pudimos guardar la partida.");
        }

        const result: MiniJuegoResultado = await response.json();
        onProfileUpdate(result.perfil);
        setStatusMessage(
          `Ronda guardada. Lograste ${scoreRef.current} aciertos y ganaste ${result.puntosGanados} Nova Puntos.`,
        );
        toast.success(`Ganaste ${result.puntosGanados} Nova Puntos en esta ronda.`);
      } catch (error) {
        setStatusMessage("La partida terminó, pero no pudimos registrar los puntos.");
        toast.error(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        setSubmitting(false);
      }
    },
    [customerId, onProfileUpdate],
  );

  useEffect(() => {
    if (!playing) {
      return;
    }

    finishingRef.current = false;
    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextTimeLeft = Math.max(0, durationMs - elapsed);
      setTimeLeftMs(nextTimeLeft);

      if (nextTimeLeft <= 0) {
        window.clearInterval(interval);
        void finishRound(elapsed);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [durationMs, finishRound, playing]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveCell((current) => pickCell(current));
    }, 900);

    return () => window.clearInterval(interval);
  }, [playing]);

  function startRound() {
    if (!canPlay) {
      return;
    }

    scoreRef.current = 0;
    setScore(0);
    setTimeLeftMs(durationMs);
    setActiveCell(pickCell());
    setPlaying(true);
    setStatusMessage(
      "Partida iniciada. Toca el botón brillante en la cuadrícula para sumar puntos.",
    );
  }

  function handleCellPress(index: number) {
    if (!playing) {
      return;
    }

    if (index !== activeCell) {
      setStatusMessage("Ese no era. Busca el botón brillante.");
      return;
    }

    setScore((current) => {
      const next = current + 1;
      scoreRef.current = next;
      return next;
    });
    setActiveCell((current) => pickCell(current));
    setStatusMessage("Buen acierto. Sigue así.");
  }

  if (!customerId) {
    return (
      <div className="panel-strong rounded-[32px] p-6">
        <p className="text-sm text-[var(--muted)]">
          Inicia sesión para desbloquear el minijuego de Nova Puntos.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-strong rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold">Nova Grid</h2>
          </div>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Juego exclusivo para cuentas activas. Toca el botón iluminado dentro del tiempo y
            convierte tus aciertos en Nova Puntos.
          </p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Estado</p>
          <p className="mt-2 text-lg font-semibold">
            {submitting ? "Guardando..." : playing ? "En juego" : "Listo"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-[var(--muted)]">Mejor puntaje</p>
          <p className="mt-2 text-3xl font-semibold">{game.mejorPuntaje}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-[var(--muted)]">Última ronda</p>
          <p className="mt-2 text-3xl font-semibold">{game.ultimoPuntaje}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-[var(--muted)]">Partidas</p>
          <p className="mt-2 text-3xl font-semibold">{game.partidasJugadas}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 rounded-full bg-black/20 px-4 py-2 text-sm">
            <TimerReset className="h-4 w-4 text-[var(--accent)]" />
            <span>{formatClock(timeLeftMs)}</span>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-black/20 px-4 py-2 text-sm">
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>{score} aciertos</span>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-black/20 px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-violet-300" />
            <span>Hasta {MINI_JUEGO_PUNTOS_MAXIMOS} pts</span>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div
            className="mb-4 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]"
            aria-live="polite"
          >
            {statusMessage}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BOARD_CELLS.map((cell) => {
              const active = playing && activeCell === cell;

              return (
                <button
                  key={cell}
                  type="button"
                  onClick={() => handleCellPress(cell)}
                  disabled={!playing || submitting}
                  aria-pressed={active}
                  aria-label={active ? `Objetivo activo ${cell + 1}` : `Casilla ${cell + 1}`}
                  className={
                    active
                      ? "min-h-24 rounded-[22px] border border-cyan-300/50 bg-cyan-300/20 p-4 text-white shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:bg-cyan-300/25"
                      : "min-h-24 rounded-[22px] border border-white/10 bg-white/5 p-4 text-[var(--muted)] transition"
                  }
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <span className="text-xs uppercase tracking-[0.24em]">
                      Casilla {cell + 1}
                    </span>
                    <span className="text-lg font-semibold">
                      {active ? "TOCA AQUI" : playing ? "Busca la activa" : "Espera la ronda"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              Cada acierto suma {MINI_JUEGO_PUNTOS_POR_ACIERTO} puntos. Puedes jugar solo con
              tu sesión activa.
            </p>
            <button
              type="button"
              className="button-primary"
              onClick={startRound}
              disabled={!canPlay}
            >
              {submitting ? "Guardando puntos..." : playing ? "Partida en curso" : "Jugar ahora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
