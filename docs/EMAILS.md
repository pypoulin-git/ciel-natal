# Emails transactionnels — runbook

## Architecture

| Email | Déclencheur | Expéditeur | Où c'est configuré |
|---|---|---|---|
| Confirmation d'inscription | `supabase.auth.signUp()` | Supabase (SMTP Supabase ou custom) | Dashboard Supabase → Authentication → Email Templates |
| Welcome | 1ʳᵉ connexion après confirmation (`/auth/callback`) | Resend (`RESEND_FROM`) | `src/app/api/email/welcome/route.ts` |
| Confirmation d'achat Premium | Webhook Stripe `checkout.session.completed` | Resend (`RESEND_FROM`) | `src/app/api/email/premium/route.ts` |
| Carte du ciel PDF | Sauvegarde d'une lecture avec option email | Resend (`RESEND_FROM`) | `src/app/api/pdf/save/route.ts` |
| Formulaire de contact | Soumission `/contact` | Resend (`RESEND_FROM`) → `CONTACT_EMAIL` | `src/app/api/contact/route.ts` |

Si le welcome email échoue, `profiles.welcome_sent_at` reste NULL et un nouvel
essai a lieu à la prochaine connexion — rien n'est perdu.

## Checklist après un changement de domaine (ex. rebrand → natalune.com)

1. **Resend → [Domains](https://resend.com/domains)** : ajouter `natalune.com`,
   choisir la région, puis créer chez le registrar les enregistrements DNS
   affichés (TXT DKIM `resend._domainkey`, MX + TXT SPF sur `send.natalune.com`).
   Attendre le statut **Verified** (quelques minutes après propagation DNS).
2. **Vercel → Environment Variables** :
   - `RESEND_FROM` = `Natalune <noreply@natalune.com>` — le domaine doit être
     **exactement** celui vérifié sur Resend.
   - `RESEND_API_KEY` présent (resend.com/api-keys).
   - ⚠️ **Redéployer** après tout changement de variable — les valeurs ne sont
     lues qu'au déploiement.
3. **Supabase (recommandé)** : par défaut les emails d'auth partent du SMTP
   intégré de Supabase (expéditeur générique, limité à ~2-4 emails/heure).
   Pour qu'ils partent aussi de `@natalune.com` :
   Dashboard → Project Settings → Authentication → **SMTP Settings** :
   - Host : `smtp.resend.com`, Port : `465`
   - Username : `resend`, Password : ta clé API Resend
   - Sender : `noreply@natalune.com`, Sender name : `Natalune`
4. **Templates Supabase** : coller `supabase/templates/confirm-signup.html` et
   `supabase/templates/reset-password.html` dans Dashboard → Authentication →
   Email Templates (sujet suggéré en commentaire en tête de chaque fichier).
5. **Supabase → Authentication → URL Configuration** : Site URL =
   `https://natalune.com`, et `https://natalune.com/auth/callback` dans les
   Redirect URLs (sinon le lien de confirmation renvoie vers l'ancien domaine).

## Tester

Les deux endpoints de diag exigent le header `x-internal-secret`
(valeur de `INTERNAL_API_SECRET` sur Vercel).

```bash
S="<INTERNAL_API_SECRET>"

# 1. Les variables sont-elles présentes dans le runtime ?
curl -s -H "x-internal-secret: $S" https://natalune.com/api/diag/env | jq '{requiredOk, optionalMissing}'

# 2. Resend accepte-t-il un envoi ? (réponse brute de Resend + hint)
curl -s -H "x-internal-secret: $S" "https://natalune.com/api/diag/email?to=tonadresse@example.com" | jq
```

Test bout-en-bout (sans toucher à une vraie boîte) :

1. S'inscrire sur https://natalune.com/inscription avec
   `nataltest<random>@mailinator.com`.
2. Ouvrir l'inbox publique :
   `https://www.mailinator.com/v4/public/inboxes.jsp?to=nataltest<random>`
   → email de confirmation → cliquer le lien.
3. Après redirection vers natalune.com, re-vérifier l'inbox : le welcome
   email expédié par `RESEND_FROM` doit arriver sous ~1 minute.
4. Dashboard Resend → **Emails** : statut `delivered` (ou `bounced` avec la
   raison).

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `diag/email` → 403 « domain is not verified » | Domaine pas (ou plus) vérifié sur resend.com/domains, ou `RESEND_FROM` utilise un autre domaine |
| `diag/email` → 401 | `RESEND_API_KEY` invalide ou révoquée |
| `diag/env` → `RESEND_FROM` dans `optionalMissing` | Variable absente du runtime → l'ajouter sur Vercel **et redéployer** |
| Resend accepte mais rien n'arrive | Voir Resend → Emails : `bounced` (adresse invalide) ou spam côté destinataire |
| Email de confirmation Supabase n'arrive pas | Rate limit du SMTP intégré Supabase (~2-4/h) → configurer le SMTP custom (étape 3) |
| Lien de confirmation pointe vers le mauvais domaine | Site URL / Redirect URLs pas à jour dans Supabase (étape 5) |
