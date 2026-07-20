// Shared helpers to (re)open a saved chart via the home page's ?c= format.
//
// Saved `form_data` rows evolve over time — older charts may lack fields the
// current app expects (voice, genre, hasTime…), and text fields can contain
// characters outside Latin-1 (typographic apostrophes, "œ"…) that make the
// native btoa() throw. Everything here is defensive: missing fields get
// defaults, exotic characters get transliterated, and failures return null
// instead of crashing the page.

const LATIN1_MAP: Record<string, string> = {
  "’": "'", // ’
  "‘": "'", // ‘
  "“": '"', // “
  "”": '"', // ”
  "—": "-", // —
  "–": "-", // –
  "œ": "oe", // œ
  "Œ": "OE", // Œ
  "…": "...", // …
  " ": " ", // nbsp (déjà latin1 mais normalisons)
};

/** btoa qui n'explose jamais : translittère le hors-Latin-1 au besoin. */
export function encodeChartPayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  try {
    return btoa(json);
  } catch {
    const safe = json.replace(/[\u0100-\uffff]/g, (ch) => LATIN1_MAP[ch] ?? "?");
    try {
      return btoa(safe);
    } catch {
      return "";
    }
  }
}

export interface ChartLinks {
  /** Rouvre la carte à l'identique. */
  open: string;
  /** Idem + saut direct au bouton « Obtenir mon PDF » (régénération). */
  pdf: string;
}

/**
 * Construit les liens ?c= à partir d'un form_data sauvegardé (schéma libre —
 * les vieux enregistrements peuvent manquer de champs). null si les champs
 * indispensables au calcul manquent vraiment.
 */
export function chartLinksFromFormData(raw: unknown): ChartLinks | null {
  const f = raw as Record<string, unknown> | null;
  if (!f || typeof f !== "object") return null;
  if (!f.jour || !f.mois || !f.annee || f.latitude == null || f.longitude == null) return null;
  const payload = {
    n: typeof f.prenom === "string" ? f.prenom : "",
    g: f.genre ?? "femme",
    j: Number(f.jour),
    m: Number(f.mois),
    a: Number(f.annee),
    h: f.heure != null ? Number(f.heure) : 12,
    mn: f.minute != null ? Number(f.minute) : 0,
    ht: f.hasTime === false ? 0 : 1,
    l: typeof f.lieu === "string" ? f.lieu : "",
    la: Number(f.latitude),
    lo: Number(f.longitude),
    v: f.voice ?? "sensible",
  };
  const c = encodeChartPayload(payload);
  if (!c) return null;
  const enc = encodeURIComponent(c);
  return { open: `/?c=${enc}`, pdf: `/?c=${enc}#pdf` };
}
