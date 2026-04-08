"use client";

import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";
import SignesContent from "./SignesContent";

export default function SignesIndex() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell title={fr ? "Les 12 signes du zodiaque" : "The 12 Zodiac Signs"}>
      <SignesContent />
    </PageShell>
  );
}
