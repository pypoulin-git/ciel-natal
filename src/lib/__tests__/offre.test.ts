import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { prixAffiche } from "../offre";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "__tests__" || name === "node_modules") continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|json|html)$/.test(name)) out.push(p);
  }
  return out;
}

describe("offre", () => {
  it("formats the price per locale", () => {
    expect(prixAffiche("fr")).toBe("9,99 $");
    expect(prixAffiche("en")).toBe("$9.99");
  });

  // Every Premium feature has a cap (see offre.ts). Selling one as
  // « illimité » is the misleading claim the 2026-11 QA flagged.
  it("never sells anything as unlimited", () => {
    const offenders = [...walk("src"), ...walk("supabase/templates")]
      .filter((f) => !f.endsWith("offre.ts"))
      .filter((f) => /illimit|unlimited/i.test(readFileSync(f, "utf8").replace(/^\s*(\/\/|\*).*$/gm, "")));
    expect(offenders).toEqual([]);
  });
});
