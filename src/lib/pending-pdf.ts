/**
 * Pending PDF handoff — anonymous → signup flow.
 *
 * Uses IndexedDB (via idb-keyval) instead of sessionStorage because PDF
 * base64 data URLs routinely exceed the 5 MB sessionStorage quota, which
 * caused `processPendingPdf` to fail with `TypeError: Failed to fetch`.
 *
 * Storing the native Blob avoids base64 overhead (~33 %) and removes the
 * round-trip through `fetch(dataUrl)` entirely.
 */

import { get, set, del } from "idb-keyval";

const KEY = "cielnatal.pendingPdf";

export interface PendingPdf {
  blob: Blob;
  label: string;
  formData: Record<string, unknown>;
  chartData: Record<string, unknown> | null;
}

export async function stashPendingPdf(p: PendingPdf): Promise<void> {
  await set(KEY, p);
}

export async function readPendingPdf(): Promise<PendingPdf | undefined> {
  return get<PendingPdf>(KEY);
}

export async function hasPendingPdf(): Promise<boolean> {
  const v = await get(KEY);
  return !!v;
}

export async function clearPendingPdf(): Promise<void> {
  await del(KEY);
}
