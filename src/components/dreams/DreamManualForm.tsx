'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { createDream, updateDream, DreamApiError } from '@/lib/dreamClient'
import { EMOTIONS, EMOTION_KEYS, emotionLabel, type Dream, type EmotionKey } from '@/lib/dreams'

/**
 * The hand-written half of the journal — free for any signed-in member.
 *
 * No model is called here: you pick your own emotions, write your own title.
 * Premium adds the AI on top (structuring, the three readings, the imagery),
 * but the record itself is never behind the paywall. A journal you can't
 * write in isn't a journal.
 *
 * Doubles as the edit form on a dream's page, so a detail remembered at noon
 * can still be added to a dream written at 6am.
 */
export default function DreamManualForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Dream
  onSaved: (dream: Dream) => void
  onCancel?: () => void
}) {
  const { getAccessToken } = useAuth()
  const { locale } = useLocale()
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)
  const isEdit = Boolean(initial)

  const [dreamDate, setDreamDate] = useState(
    initial?.dream_date ?? new Date().toISOString().slice(0, 10),
  )
  const [title, setTitle] = useState(initial?.title ?? '')
  const [rawText, setRawText] = useState(initial?.raw_text ?? '')
  const [emotions, setEmotions] = useState<EmotionKey[]>(initial?.emotions ?? [])
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '))
  const [intensity, setIntensity] = useState(initial?.emotional_intensity ?? 5)
  const [lucidity, setLucidity] = useState(initial?.lucidity_level ?? 1)
  const [sleepQuality, setSleepQuality] = useState(initial?.sleep_quality ?? 3)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggleEmotion = (key: EmotionKey) =>
    setEmotions((prev) => (prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]))

  const submit = async () => {
    const text = rawText.trim()
    if (!text) return
    setBusy(true)
    setError('')

    const payload = {
      rawText: text,
      title: title.trim(),
      dreamDate,
      emotions,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      emotionalIntensity: intensity,
      lucidityLevel: lucidity,
      sleepQuality,
    }

    try {
      const result = initial
        ? await updateDream(initial.id, payload, getAccessToken)
        : await createDream(payload, getAccessToken)
      onSaved(result.dream as Dream)
      if (!isEdit) {
        setRawText('')
        setTitle('')
        setEmotions([])
        setTags('')
      }
    } catch (err) {
      setError(
        err instanceof DreamApiError && err.code === 'LIMIT_REACHED'
          ? label(
              'Ton journal a atteint sa taille maximale. Écris-nous.',
              'Your journal has reached its maximum size. Get in touch.',
            )
          : label("L'enregistrement a échoué. Réessaie.", 'Saving failed. Try again.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="font-cinzel mb-1 text-lg text-[var(--color-text-primary)]">
        {isEdit
          ? label('Corriger ce rêve', 'Correct this dream')
          : label('Noter un rêve', 'Note a dream')}
      </h2>
      {!isEdit && (
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          {label(
            'Écris ce dont tu te souviens, choisis les émotions qui restent. Rien ne part vers une IA.',
            'Write what you remember, pick the emotions that linger. Nothing is sent to an AI.',
          )}
        </p>
      )}

      <div className="mb-3 grid gap-3 sm:grid-cols-[auto_1fr]">
        <div>
          <label htmlFor="m-date" className="mb-1 block text-xs text-[var(--color-text-muted)]">
            {label('Nuit du', 'Night of')}
          </label>
          <input
            id="m-date"
            type="date"
            value={dreamDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDreamDate(e.target.value)}
            className="glass-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m-title" className="mb-1 block text-xs text-[var(--color-text-muted)]">
            {label('Titre (optionnel)', 'Title (optional)')}
          </label>
          <input
            id="m-title"
            type="text"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={label('La maison aux escaliers', 'The house of stairs')}
            className="glass-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label htmlFor="m-text" className="mb-1 block text-xs text-[var(--color-text-muted)]">
        {label('Le rêve', 'The dream')}
      </label>
      <textarea
        id="m-text"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={7}
        maxLength={5000}
        placeholder={label("J'étais dans un endroit étrange…", 'I was in a strange place…')}
        className="glass-input w-full resize-y rounded-xl px-3 py-2.5 text-sm"
      />
      <div className="mt-1 mb-4 text-right text-[11px] text-[var(--color-text-muted)]">
        {rawText.length}/5000
      </div>

      <fieldset className="mb-4">
        <legend className="mb-2 text-xs text-[var(--color-text-muted)]">
          {label('Émotions ressenties', 'Emotions felt')}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_KEYS.map((key) => {
            const meta = EMOTIONS[key]
            const on = emotions.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleEmotion(key)}
                aria-pressed={on}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition"
                style={{
                  color: on ? meta.color : 'var(--color-text-muted)',
                  borderColor: on
                    ? `color-mix(in srgb, ${meta.color} 45%, transparent)`
                    : 'var(--color-glass-border)',
                  background: on
                    ? `color-mix(in srgb, ${meta.color} 14%, transparent)`
                    : 'transparent',
                }}
              >
                <span aria-hidden="true">{meta.icon}</span>
                {emotionLabel(key, locale)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mb-4">
        <label htmlFor="m-tags" className="mb-1 block text-xs text-[var(--color-text-muted)]">
          {label('Thèmes, séparés par des virgules', 'Themes, comma-separated')}
        </label>
        <input
          id="m-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={label('eau, chute, maison', 'water, falling, house')}
          className="glass-input w-full rounded-xl px-3 py-2 text-sm"
        />
      </div>

      <Slider
        id="m-intensity"
        label={label('Intensité émotionnelle', 'Emotional intensity')}
        value={intensity}
        min={1}
        max={10}
        onChange={setIntensity}
      />
      <Slider
        id="m-lucidity"
        label={label('Lucidité', 'Lucidity')}
        value={lucidity}
        min={1}
        max={5}
        onChange={setLucidity}
      />
      <Slider
        id="m-sleep"
        label={label('Qualité du sommeil', 'Sleep quality')}
        value={sleepQuality}
        min={1}
        max={5}
        onChange={setSleepQuality}
      />

      {error && <p className="mt-3 text-sm text-[var(--color-accent-rose)]">{error}</p>}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy || rawText.trim().length === 0}
          className="btn-primary flex-1 rounded-xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? label('Enregistrement…', 'Saving…')
            : isEdit
              ? label('Enregistrer', 'Save')
              : label('Consigner ce rêve', 'Record this dream')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost rounded-xl px-5 py-3 text-sm"
          >
            {label('Annuler', 'Cancel')}
          </button>
        )}
      </div>
    </div>
  )
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs text-[var(--color-text-muted)]">
          {label}
        </label>
        <span className="font-mono text-xs text-[var(--color-accent-lavender)]">
          {value}/{max}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent-lavender)]"
      />
    </div>
  )
}
