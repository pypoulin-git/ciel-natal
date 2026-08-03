# Backlog Natalune

Idées en attente de pondération / désign / chiffrage.

---

## Révolution Solaire — refonte complète

**Statut** : section désactivée le 2026-06-01 (voir feedback PY).
La page `/revolution-solaire` ne renvoie plus qu'un placeholder « Bientôt »
et les liens depuis SiteFooter, /premium et la FAQ home ont été retirés.
L'entrée du sitemap aussi.

**Raison de la désactivation** : « très pauvre comme page, trop semblable
à la carte du ciel, on n'en comprend pas trop les différences ». La V1
livrait essentiellement une deuxième roue zodiacale + une liste de
positions planétaires, sans véritable lecture annuelle distincte du
portrait natal.

**Pistes pour la refonte** :

- **Différencier visuellement de la carte natale** : palette différente
  (or/cuivre vs lavande/rose), layout vertical timeline plutôt que roue,
  ou roue superposée natale + SR pour montrer les déplacements.
- **Lecture annuelle vs vie entière** : reformuler tout le contenu autour
  de « ton année », pas « ta vie ». Verbes au futur proche, langage
  d'opportunité et de saison.
- **Graphes comparatifs natal / SR** : pour chaque planète, montrer
  l'écart de maison et l'écart de signe avec une métaphore simple
  (« cette année ta Lune travaille en Maison X au lieu de ta Y natale »).
- **Maisons cuspales SR** : actuellement absentes — c'est pourtant le
  cœur de la lecture annuelle traditionnelle. Mettre en avant l'AS SR,
  le MC SR, et les planètes angulaires.
- **Période de validité** : afficher le créneau exact (du prochain
  anniversaire au suivant) avec un compte à rebours.
- **Lieu actuel vs lieu de naissance** : permettre à l'utilisateur de
  saisir où il vit au moment de la révolution (les maisons changent
  selon la latitude/longitude du lieu où on se trouve, pas du lieu de
  naissance).
- **AI prompt dédié** : le prompt de `/api/solar-return` doit être
  spécialisé « lecture annuelle », pas un copier-coller du portrait
  natal. Court, prospectif, structuré par trimestre ou par grand thème.
- **Cache + partage** : réutiliser le `interpretation_cache` Supabase
  comme on a fait pour le portrait et la synastrie.
- **Audio narration** : section optionnelle, comme Portrait / Maisons /
  Aspects / Transits — réutiliser AudioPlayer.

**Récupération du code V1** : l'ancienne implémentation est dans l'historique
git, fichier `src/app/revolution-solaire/page.tsx` avant le commit du
2026-06-01. La logique de calcul de l'instant exact de retour solaire
(`calculateNatalChart` itéré sur 5 jours x 24h puis raffiné à la minute)
reste valide — c'est l'UI et le contenu qui doivent être repensés.

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
