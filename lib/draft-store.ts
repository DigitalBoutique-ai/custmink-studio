"use client";

/**
 * External store for locally created tech-pack drafts.
 *
 * Phase 1A has no database, so the create wizard writes here and the workspace
 * reads back through `useSyncExternalStore`. That keeps the snapshot reference
 * stable (no setState-in-effect, no hydration mismatch) and gives Phase 1B a
 * single call site to replace with a server action.
 */

import type { Product } from "@/types/techpack";

const STORAGE_KEY = "custmink-drafts";
const EMPTY: Product[] = [];

let snapshot: Product[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): Product[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Product[]) : EMPTY;
  } catch {
    // Private mode or blocked site data — drafts stay in memory only.
    return EMPTY;
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeToDrafts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDraftsSnapshot(): Product[] {
  // First read happens lazily on the client, after hydration has already
  // matched the server's empty snapshot.
  if (!hydrated) {
    hydrated = true;
    snapshot = read();
  }
  return snapshot;
}

export function getDraftsServerSnapshot(): Product[] {
  return EMPTY;
}

export function addDraft(product: Product): void {
  snapshot = [product, ...getDraftsSnapshot()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Persistence is best-effort; the draft still lives in this session.
  }
  emit();
}
