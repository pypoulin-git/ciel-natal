'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { createDream, structureDream, DreamApiError } from '@/lib/dreamClient'
import { isEmotionKey, type DreamStructure } from '@/lib/dreams'
import EmotionChip from './EmotionChip'

type Step = 'input' | 'processing' | 'clarify' | 'metadata'

/**
 * Capture flow: raw account → AI structuring → optional clarification →
 * metadata sliders → saved.
 *
 * The clarification answers are appended to the raw text and re-sent, which
 * costs a second (cheap) structuring pass. They are deliberately NOT stored
 * in a table of their own — the prototype created one and never wrote a
 * single row to it.
 */
export default function DreamCapture({ onSaved }: { onSaved: (dreamId: string) => void }) {
  const { getAccessToken } = useAuth()
  const { locale } = useLocale()
  const router = useRouter()
  const fr = locale !== 'en'

  const [step, setStep] = useState<Step>('input')
  const [rawText, setRawText] = useState('')
  const [structure, setStructure] = useState<DreamStructure | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [dreamDate, setDreamDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [intensity, setIntensity] = useState(5)
  const [lucidity, setLucidity] = useState(1)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [error, setError] = useState('')

  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const handleError = (err: unknown) => {
    if (err instanceof DreamApiError) {
      if (err.code === 'PREMIUM_REQUIRED') {
        // Noter un rêve reste gratuit : seule l'analyse par l'IA est Premium.
        setError(
          label(
            "L'analyse par l'IA fait partie de Natalune Premium — mais tu peux noter ce rêve à la main dès maintenant.",
            'AI analysis is part of Natalune Premium — but you can note this dream by hand right now.',
          ),
        )
        return
      }
      if (err.code === 'QUOTA_EXCEEDED') {
        setError(err.message)
        return
      }
    }
    setError(
      label(
        "L'analyse a échoué. Réessaie dans un instant.",
        'The analysis failed. Try again in a moment.',
      ),
    )
  }

  const analyse = async (text: string) => {
    setError('')
    setStep('processing')
    try {
      const result = await structureDream(text, locale, getAccessToken)
      setStructure(result)
      setAnswers(new Array(result.clarification_questions.length).fill(''))
      setStep(result.clarification_questions.length > 0 ? 'clarify' : 'metadata')
    } catch (err) {
      handleError(err)
      setStep('input')
    }
  }

  const submitClarifications = async () => {
    if (!structure) return
    const extra = structure.clarification_questions
      .map((question, i) => (answers[i]?.trim() ? `${question} ${answers[i].trim()}` : ''))
      .filter(Boolean)
      .join('\n')
    if (!extra) {
      setStep('metadata')
      return
    }
    await analyse(`${rawText}\n\n${extra}`)
  }

  const save = async () => {
    if (!structure) return
    setError('')
    setStep('processing')
    try {
      const { dream } = await createDream(
        {
          rawText,
          title: structure.title,
          structuredText: structure.structured_text,
          dreamDate,
          emotionalIntensity: intensity,
          lucidityLevel: lucidity,
          sleepQuality,
          tags: structure.tags,
          emotions: structure.emotions,
          characters: structure.characters,
          places: structure.places,
        },
        getAccessToken,
      )
      onSaved(dream.id)
      router.push(`/reves/${dream.id}`)
    } catch (err) {
      handleError(err)
      setStep('metadata')
    }
  }

  // ── Processing ──
  if (step === 'processing') {
    return (
      <div className="glass rounded-2xl p-8 text-center" role="status" aria-live="polite">
        <div className="mb-3 text-2xl opacity-60">✦</div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {label('On explore ton rêve…', 'Exploring your dream…')}
        </p>
      </div>
    )
  }

  // ── Clarification ──
  if (step === 'clarify' && structure) {
    return (
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h2 className="font-cinzel mb-1 text-lg text-[var(--color-text-primary)]">
          {label('Deux précisions', 'Two small things')}
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          {label(
            'Le récit est un peu flou — réponds si ça te revient, sinon passe.',
            'The account is a little blurry — answer if it comes back to you, otherwise skip.',
          )}
        </p>

        {structure.clarification_questions.map((question, i) => (
          <div key={question} className="mb-3">
            <label
              htmlFor={`clarify-${i}`}
              className="mb-1 block text-sm text-[var(--color-text-secondary)]"
            >
              {question}
            </label>
            <input
              id={`clarify-${i}`}
              type="text"
              value={answers[i] ?? ''}
              onChange={(e) => {
                const next = [...answers]
                next[i] = e.target.value
                setAnswers(next)
              }}
              placeholder={label('(optionnel)', '(optional)')}
              className="glass-input w-full rounded-xl px-3 py-2 text-sm"
            />
          </div>
        ))}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={submitClarifications}
            className="btn-primary rounded-xl px-5 py-2.5 text-sm"
          >
            {label('Continuer', 'Continue')}
          </button>
          <button
            type="button"
            onClick={() => setStep('metadata')}
            className="btn-ghost rounded-xl px-5 py-2.5 text-sm"
          >
            {label('Passer', 'Skip')}
          </button>
        </div>
      </div>
    )
  }

  // ── Metadata ──
  if (step === 'metadata' && structure) {
    const emotions = structure.emotions.filter(isEmotionKey)
    return (
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
          {structure.title}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {structure.structured_text}
        </p>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {emotions.map((emotion) => (
            <EmotionChip key={emotion} emotion={emotion} locale={locale} compact />
          ))}
          {structure.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-glass-border)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="dream-date" className="mb-1 block text-xs text-[var(--color-text-muted)]">
            {label('Nuit du', 'Night of')}
          </label>
          <input
            id="dream-date"
            type="date"
            value={dreamDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDreamDate(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <Slider
          id="intensity"
          label={label('Intensité émotionnelle', 'Emotional intensity')}
          value={intensity}
          min={1}
          max={10}
          onChange={setIntensity}
        />
        <Slider
          id="lucidity"
          label={label('Lucidité', 'Lucidity')}
          value={lucidity}
          min={1}
          max={5}
          onChange={setLucidity}
        />
        <Slider
          id="sleep"
          label={label('Qualité du sommeil', 'Sleep quality')}
          value={sleepQuality}
          min={1}
          max={5}
          onChange={setSleepQuality}
        />

        {error && <p className="mt-3 text-sm text-[var(--color-accent-rose)]">{error}</p>}

        <button
          type="button"
          onClick={save}
          className="btn-primary mt-5 w-full rounded-xl px-5 py-3 text-sm"
        >
          {label('Consigner ce rêve ✦', 'Record this dream ✦')}
        </button>
      </div>
    )
  }

  // ── Input ──
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="font-cinzel mb-1 text-lg text-[var(--color-text-primary)]">
        {label('Raconte ton rêve', 'Tell your dream')}
      </h2>
      <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
        {label(
          "Pas besoin d'être précis ni ordonné. On s'occupe de le mettre au clair.",
          "No need to be precise or orderly. We'll make sense of it.",
        )}
      </p>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={8}
        maxLength={5000}
        placeholder={label("J'étais dans un endroit étrange…", 'I was in a strange place…')}
        className="glass-input w-full resize-y rounded-xl px-3 py-2.5 text-sm"
        aria-label={label('Récit du rêve', 'Dream account')}
      />

      <div className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">
        {rawText.length}/5000
      </div>

      {error && <p className="mt-2 text-sm text-[var(--color-accent-rose)]">{error}</p>}

      <button
        type="button"
        disabled={rawText.trim().length < 10}
        onClick={() => analyse(rawText.trim())}
        className="btn-primary mt-3 w-full rounded-xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label('Analyser mon rêve ✦', 'Analyse my dream ✦')}
      </button>
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
