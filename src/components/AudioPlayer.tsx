"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";

interface Props {
  /** The narrative text to convert to speech */
  narrativeText: string;
  /** Chart parameters for cache key */
  chartParams: Record<string, unknown>;
}

export default function AudioPlayer({ narrativeText, chartParams }: Props) {
  const { user, isPremium } = useAuth();
  const { locale } = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = async () => {
    if (!user?.id || !isPremium || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          text: narrativeText,
          chartParams,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate audio");
      }

      const data = await res.json();
      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!isPremium) return null;

  // Not yet generated — show generate button
  if (!audioUrl) {
    return (
      <div className="glass p-5 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 flex items-center justify-center">
          <svg width="18" height="18" fill="none" stroke="var(--color-accent-rose)" strokeWidth="1.5" viewBox="0 0 24 24">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-primary)] mb-1 font-medium">
          {locale === "fr" ? "Ecoute ton portrait cosmique" : "Listen to your cosmic portrait"}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          {locale === "fr" ? "Une narration audio douce de ton theme natal." : "A gentle audio narration of your natal chart."}
        </p>
        <button
          onClick={generateAudio}
          disabled={loading}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              {locale === "fr" ? "Generation en cours..." : "Generating..."}
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {locale === "fr" ? "Generer la narration" : "Generate narration"}
            </>
          )}
        </button>
        {error && (
          <p className="text-xs text-red-400/70 mt-3">{error}</p>
        )}
      </div>
    );
  }

  // Audio player
  return (
    <div className="glass p-4">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition"
          style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
        >
          {playing ? (
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Progress */}
        <div className="flex-1">
          <div
            className="h-1.5 rounded-full bg-white/[0.06] cursor-pointer overflow-hidden"
            onClick={seekTo}
          >
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--color-accent-rose), #a06080)" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              {formatTime(audioRef.current?.currentTime || 0)}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[var(--color-text-secondary)] opacity-50 mt-2 text-center">
        {locale === "fr" ? "Portrait cosmique — narration IA" : "Cosmic portrait — AI narration"}
      </p>
    </div>
  );
}
