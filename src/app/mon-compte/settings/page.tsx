"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// « Paramètres » a été fusionné dans « Mon compte ». On redirige les anciens
// liens / signets vers la page unifiée.
export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/mon-compte");
  }, [router]);
  return null;
}
