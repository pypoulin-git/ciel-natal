import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { consumeDictationQuota, quotaExceededResponse, requirePremium } from '@/lib/dreamGuard'
import { DICTATION_SAMPLE_RATE, DICTATION_SLICE_SECONDS } from '@/lib/audioWav'

// Voice dictation for the dream journal (Premium).
//
// The browser sends one ≤ 60 s slice of 16 kHz mono 16-bit WAV at a time
// (see lib/audioWav.ts). Nothing is stored: the bytes go to Gemini for
// transcription and are dropped with the request. Quota is counted from the
// audio length measured here, never from a duration the client claims.

export const runtime = 'nodejs'
export const maxDuration = 60

const HEADER = 44
const BYTES_PER_SECOND = DICTATION_SAMPLE_RATE * 2
// One slice plus a little slack for rounding.
const MAX_BYTES = HEADER + BYTES_PER_SECOND * (DICTATION_SLICE_SECONDS + 2)

/** Accept only the exact WAV the client produces: PCM, mono, 16 kHz, 16-bit. */
function wavSeconds(bytes: Uint8Array): number | null {
  if (bytes.length <= HEADER || bytes.length > MAX_BYTES) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const tag = (o: number) => String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3])
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE' || tag(12) !== 'fmt ' || tag(36) !== 'data') return null
  if (view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1) return null
  if (view.getUint32(24, true) !== DICTATION_SAMPLE_RATE || view.getUint16(34, true) !== 16) return null
  return (bytes.length - HEADER) / BYTES_PER_SECOND
}

function system(locale: 'fr' | 'en'): string {
  return locale === 'en'
    ? 'You transcribe a person describing a dream they just woke up from. Write down exactly what they say, in their language, with normal punctuation. Do not summarise, interpret, translate or add anything. Drop filler sounds (uh, um) but keep every detail. If nothing intelligible is said, return an empty string. Output the transcript only.'
    : "Tu transcris une personne qui raconte le rêve dont elle vient de se réveiller. Écris exactement ce qu'elle dit, dans sa langue, avec une ponctuation normale. Ne résume pas, n'interprète pas, ne traduis pas, n'ajoute rien. Retire les hésitations (euh, hum) mais garde chaque détail. Si rien d'intelligible n'est dit, renvoie une chaîne vide. Renvoie uniquement la transcription."
}

export async function POST(req: NextRequest) {
  const guard = await requirePremium(req)
  if (!guard.ok) return guard.response

  try {
    const form = await req.formData()
    const locale: 'fr' | 'en' = form.get('locale') === 'en' ? 'en' : 'fr'
    const audio = form.get('audio')
    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: 'Missing audio' }, { status: 400 })
    }

    const bytes = new Uint8Array(await audio.arrayBuffer())
    const seconds = wavSeconds(bytes)
    if (seconds == null) {
      return NextResponse.json({ error: 'INVALID_AUDIO' }, { status: 400 })
    }
    if (seconds < 0.5) return NextResponse.json({ text: '' })

    const quota = await consumeDictationQuota(guard.userId, Math.ceil(seconds / 60))
    if (!quota.allowed) return quotaExceededResponse(quota, locale, 'dictation')

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: system(locale),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: locale === 'en' ? 'Transcribe this recording.' : 'Transcris cet enregistrement.' },
            { type: 'file', data: bytes, mediaType: 'audio/wav' },
          ],
        },
      ],
      maxOutputTokens: 2000,
      temperature: 0,
      // Plain transcription: no thinking budget (it can eat the output, see dream-structure).
      providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
      experimental_telemetry: { isEnabled: true, functionId: 'dream-transcribe' },
    })

    return NextResponse.json({ text: text.trim().slice(0, 5000), remainingMinutes: quota.remaining })
  } catch (err) {
    console.error('/api/dream-transcribe error:', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
