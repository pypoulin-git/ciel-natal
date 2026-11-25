"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Twinkling, slowly rising star field behind every page.
 *
 * Same look as before, cheaper to run (QA 2026-11):
 * - one pre-rendered star sprite drawn with drawImage + globalAlpha, instead
 *   of a path, an arc and a new rgba() string per star per frame;
 * - star count capped (a 4K screen used to spawn ~2 000 stars);
 * - drawn statically first, animation started once the browser is idle, so
 *   the page's own content paints first;
 * - stops in background tabs, debounced resize, static under reduced motion.
 */
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const MAX_STARS = 420;
const SPRITE = 16; // sprite size in px; stars are drawn scaled down from it

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkle: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Star colour from the active theme (light stars on dark sky, dark on pale).
    const styles = getComputedStyle(document.documentElement);
    const starRgb = styles.getPropertyValue("--starfield-star").trim() || "232, 224, 240";
    const starMaxOpacity = parseFloat(styles.getPropertyValue("--starfield-opacity")) || 0.85;

    // Soft round sprite, rendered once.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SPRITE;
    const sctx = sprite.getContext("2d")!;
    const g = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
    g.addColorStop(0, `rgba(${starRgb}, 1)`);
    g.addColorStop(0.45, `rgba(${starRgb}, 0.9)`);
    g.addColorStop(1, `rgba(${starRgb}, 0)`);
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SPRITE, SPRITE);

    const stars: Star[] = [];
    let animationId = 0;
    let lastFrameTime = 0;
    let running = false;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createStars() {
      stars.length = 0;
      const count = Math.min(MAX_STARS, Math.floor((canvas!.width * canvas!.height) / 4000));
      for (let i = 0; i < count; i++) {
        const r = Math.random() * 1.5 + 0.3; // same radius range as before
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: r * 2.6, // sprite has a soft edge: draw a bit larger than the radius
          speed: Math.random() * 0.15 + 0.02,
          opacity: Math.random(),
          twinkle: Math.random() * 0.008 + 0.002,
        });
      }
    }

    function paint() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const s of stars) {
        ctx!.globalAlpha = Math.max(0, Math.min(1, s.opacity)) * starMaxOpacity;
        ctx!.drawImage(sprite, s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
      }
      ctx!.globalAlpha = 1;
    }

    function step(timestamp: number) {
      if (!running) return;
      const elapsed = timestamp - lastFrameTime;
      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);
        const h = canvas!.height;
        for (const s of stars) {
          s.opacity += s.twinkle;
          if (s.opacity > 1 || s.opacity < 0.1) s.twinkle *= -1;
          s.y -= s.speed;
          if (s.y < -2) {
            s.y = h + 2;
            s.x = Math.random() * canvas!.width;
          }
        }
        paint();
      }
      animationId = requestAnimationFrame(step);
    }

    function start() {
      if (running || prefersReducedMotion || document.hidden) return;
      running = true;
      animationId = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(animationId);
    }

    resize();
    createStars();
    paint(); // static frame right away

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    let idleHandle = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    if (w.requestIdleCallback) idleHandle = w.requestIdleCallback(start, { timeout: 2000 });
    else idleTimer = setTimeout(start, 800);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createStars();
        paint();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      if (idleHandle && w.cancelIdleCallback) w.cancelIdleCallback(idleHandle);
      clearTimeout(idleTimer);
      clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
    // Re-run when the theme flips so star colour/opacity are re-read.
  }, [theme]);

  return <canvas ref={canvasRef} id="starfield" aria-hidden="true" />;
}
