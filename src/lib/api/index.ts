import "server-only";
import { banners, posts, processStatus } from "@/lib/mocks/data";
import type { Banner, PostSummary, ProcessStatus } from "./types";

/*
 * Capa de datos del portal. Hoy devuelve datos de ejemplo; cuando exista plataforma-api,
 * estas funciones llamarán al BFF y las pantallas no cambian.
 */

/**
 * Retraso artificial para ver los skeletons con datos de ejemplo.
 * Solo en desarrollo: MOCK_DELAY_MS=1500 pnpm dev
 */
async function simularRed(factor = 1) {
  const ms = Number(process.env.MOCK_DELAY_MS ?? 0);
  if (process.env.NODE_ENV !== "production" && ms > 0) {
    await new Promise((r) => setTimeout(r, ms * factor));
  }
}

export async function getProcess(): Promise<ProcessStatus> {
  await simularRed(0.6);
  return processStatus;
}

export async function getBanners(): Promise<Banner[]> {
  await simularRed(1);
  return banners;
}

export async function getLatestPosts(limit = 3): Promise<PostSummary[]> {
  await simularRed(1.4);
  return [...posts].sort((a, b) => b.publicadoEl.localeCompare(a.publicadoEl)).slice(0, limit);
}

export type { Banner, PostSummary, ProcessStatus } from "./types";
