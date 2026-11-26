# Backlog Natalune

Idées en attente de pondération / désign / chiffrage.

---

## Journal de rêves — réécouter sa dictée

**Statut** : non fait, volontairement (2026-11-26).

La dictée est livrée (Premium, transcription Gemini, 180 min/mois, 3 min par
dictée) **sans conserver l'audio** : décision de PY, pour la vie privée et
pour n'avoir ni stockage ni purge à gérer. Si on veut un jour permettre de
réécouter sa voix au réveil : bucket privé `dream-audio`
(`{user_id}/{dream_id}/`), colonne `dreams.voice_audio_path`, purge
automatique (30 jours ?) et mise à jour de la politique de confidentialité.
