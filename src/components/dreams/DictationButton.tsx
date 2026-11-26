'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { recordingToWavSlices } from '@/lib/audioWav'
import { DreamApiError, transcribeSlice } from '@/lib/dreamClient'
import { DREAM_DICTATION_MAX_SECONDS } from '@/lib/dreamLimits'

type State = 'idle' | 'recording' | 'transcribing'

/**
 * Dictate a dream instead of typing it (Premium).
 *
 * Records with MediaRecorder, converts to 16 kHz WAV slices in the browser,
 * sends each slice for transcription and hands the joined text back to the
 * parent. Nothing is kept: the recording only lives in memory until the text
 * comes back. Hidden entirely where the browser can't record.
 */
export default function DictationButton({
  locale,
  onText,
  disabled = false,
}: {
  locale: string
  onText: (text: string) => void
  disabled?: boolean
}) {
  const { getAccessToken } = useAuth()
  const fr = locale !== 'en'
  const label = (a: string, b: string) => (fr ? a : b)

  const [supported, setSupported] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(0)
  const [error, setError] = useState('')

  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const stream = useRef<MediaStream | null>(null)
  const cancelled = useRef(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const raf = useRef(0)
  const audioCtx = useRef<AudioContext | null>(null)

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof window.MediaRecorder !== 'undefined',
    )
    return () => cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cleanup() {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    cancelAnimationFrame(raf.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    void audioCtx.current?.close().catch(() => {})
    audioCtx.current = null
    setLevel(0)
  }

  async function start() {
    setError('')
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
      stream.current = media
      chunks.current = []
      cancelled.current = false

      const rec = new MediaRecorder(media)
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }
      rec.onstop = () => void finish(rec.mimeType)
      recorder.current = rec
      rec.start(1000)

      // Live input level, so people can see the mic is hearing them.
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtx.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(media).connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let peak = 0
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128))
        setLevel(Math.min(1, peak / 64))
        raf.current = requestAnimationFrame(tick)
      }
      tick()

      const started = Date.now()
      setElapsed(0)
      timer.current = setInterval(() => {
        const s = Math.floor((Date.now() - started) / 1000)
        setElapsed(s)
        if (s >= DREAM_DICTATION_MAX_SECONDS) stop()
      }, 250)
      setState('recording')
    } catch (err) {
      cleanup()
      const name = (err as DOMException)?.name
      setError(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? label(
              "Le micro est bloqué. Autorise-le pour ce site dans ton navigateur, puis réessaie.",
              'The microphone is blocked. Allow it for this site in your browser, then try again.',
            )
          : name === 'NotFoundError'
            ? label('Aucun micro trouvé sur cet appareil.', 'No microphone found on this device.')
            : label("Impossible de démarrer l'enregistrement.", 'Could not start recording.'),
      )
    }
  }

  function stop() {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
  }

  function cancel() {
    cancelled.current = true
    stop()
  }

  async function finish(mimeType: string) {
    cleanup()
    if (cancelled.current || chunks.current.length === 0) {
      setState('idle')
      return
    }
    setState('transcribing')
    try {
      const blob = new Blob(chunks.current, { type: mimeType || 'audio/webm' })
      chunks.current = []
      const { slices } = await recordingToWavSlices(blob)
      const parts = await Promise.all(slices.map((s) => transcribeSlice(s, locale, getAccessToken)))
      const text = parts
        .map((p) => p.text.trim())
        .filter(Boolean)
        .join(' ')
      if (text) onText(text)
      else setError(label("On n'a rien entendu de clair. Rapproche-toi du micro et réessaie.", "We couldn't hear anything clear. Move closer to the mic and try again."))
    } catch (err) {
      if (err instanceof DreamApiError && err.code === 'QUOTA_EXCEEDED') setError(err.message)
      else if (err instanceof DreamApiError && err.code === 'PREMIUM_REQUIRED')
        setError(label('La dictée fait partie de Natalune Premium.', 'Dictation is part of Natalune Premium.'))
      else setError(label('La transcription a échoué. Réessaie, ou tape ton rêve.', 'Transcription failed. Try again, or type your dream.'))
    } finally {
      setState('idle')
    }
  }

  if (!supported) return null

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="mt-3">
      {state === 'idle' && (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className="btn-ghost inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm disabled:opacity-40"
        >
          <MicIcon />
          {label('Dicter mon rêve', 'Dictate my dream')}
        </button>
      )}

      {state === 'recording' && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-accent-rose)]/30 bg-[var(--color-accent-rose)]/5 px-4 py-3">
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-rose)] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--color-accent-rose)]" />
          </span>
          <span className="text-sm tabular-nums text-[var(--color-text-primary)]" aria-live="off">
            {mmss(elapsed)} <span className="text-[var(--color-text-muted)]">/ {mmss(DREAM_DICTATION_MAX_SECONDS)}</span>
          </span>
          {/* Input level */}
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--color-glass-border)]" aria-hidden="true">
            <span
              className="block h-full rounded-full bg-[var(--color-accent-rose)] transition-[width] duration-75"
              style={{ width: `${Math.round(level * 100)}%` }}
            />
          </span>
          <span className="sr-only" role="status">
            {label('Enregistrement en cours', 'Recording')}
          </span>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={cancel} className="btn-ghost min-h-11 rounded-full px-4 text-sm">
              {label('Annuler', 'Cancel')}
            </button>
            <button type="button" onClick={stop} className="btn-primary min-h-11 rounded-full px-4 text-sm">
              {label('Terminer', 'Done')}
            </button>
          </div>
        </div>
      )}

      {state === 'transcribing' && (
        <p className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--color-text-secondary)]" role="status">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)]" />
          {label('Transcription…', 'Transcribing…')}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--color-accent-rose)]">
          {error}
        </p>
      )}

      {state === 'idle' && !error && (
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          {label(
            "Jusqu'à 3 minutes. L'enregistrement n'est pas conservé : seul le texte reste, et tu peux le corriger.",
            'Up to 3 minutes. The recording is not kept: only the text remains, and you can edit it.',
          )}
        </p>
      )}
    </div>
  )
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" />
    </svg>
  )
}
