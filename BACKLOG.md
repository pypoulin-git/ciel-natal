# Backlog Natalune

Idées en attente de pondération / désign / chiffrage.

---

## Journal de rêves — capture vocale

**Statut** : volontairement hors périmètre de la V1 (2026-08).

Dicter son rêve au réveil, les yeux encore fermés, est de loin le meilleur
moment pour le capturer — la fenêtre de rappel se referme en quelques
minutes, et taper au clavier la gaspille. C'est la fonctionnalité qui a le
plus de valeur produit parmi celles laissées de côté.

**Pourquoi elle n'est pas dans la V1** : le prototype Reverie la promettait
sur sa page d'accueil (« texte ou voix », « tapez ou dictez ») sans l'avoir
jamais implémentée — aucun bouton micro nulle part, `voice_audio_path`
toujours `null`, bucket `dream-audio` jamais créé. On a préféré ne pas
reconduire une promesse non tenue.

**Ce qui existe déjà et reste récupérable** : une Edge Function Deno
fonctionnelle appelant Deepgram `nova-2` en français, dans le dépôt archivé
`pypoulin-git/reverie` (`supabase/functions/transcribe-audio/index.ts`).
Elle prend l'audio en base64 et renvoie le transcript. C'est le seul actif
réel de ce chantier.

**Pistes** :

- **Provider** : à trancher entre reprendre Deepgram (nouveau vendor, nouvelle
  clé, ajout à la politique de confidentialité) et utiliser Gemini, qui
  accepte l'audio en entrée — cohérent avec le choix « un seul fournisseur »
  fait pour le reste de la fonctionnalité.
- **Capture navigateur** : `MediaRecorder` en webm/opus. Le header
  `Permissions-Policy` du `next.config.ts` devra autoriser `microphone=(self)`
  — il ne le fait pas aujourd'hui.
- **Stockage** : bucket `dream-audio` privé, même convention de chemin que
  `dream-images` (`{user_id}/{dream_id}/`). Prévoir une purge : l'audio est
  volumineux et n'a plus d'utilité une fois transcrit — à confirmer avec PY,
  certains voudront peut-être réécouter leur propre voix au réveil.
- **Colonne** : `dreams.voice_audio_path`, à ajouter (elle n'a volontairement
  pas été créée dans `007_dreams.sql` pour ne pas laisser une colonne morte).
- **Quota** : la transcription se facture à la minute — prévoir un compteur
  distinct de `dream_used`, sur le modèle de `dream_images_used`.

---
