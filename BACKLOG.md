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
