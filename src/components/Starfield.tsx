"use client";

import { useEffect, useRef } from "react";

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect reduced motion preference — show static stars only
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let lastFrameTime = 0;
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const stars: { x: number; y: number; r: number; speed: number; opacity: number; twinkleSpeed: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createStars() {
      stars.length = 0;
      const count = Math.floor((canvas!.width * canvas!.height) / 4000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.15 + 0.02,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.008 + 0.002,
        });
      }
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const star of stars) {
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(232, 224, 240, ${star.opacity * 0.8})`;
        ctx!.fill();
      }
    }

    function draw(timestamp: number) {
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const star of stars) {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0.1) {
          star.twinkleSpeed *= -1;
        }
        star.y -= star.speed;
        if (star.y < -2) {
          star.y = canvas!.height + 2;
          star.x = Math.random() * canvas!.width;
        }

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(232, 224, 240, ${star.opacity * 0.8})`;
        ctx!.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    createStars();

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      animationId = requestAnimationFrame(draw);
    }

    const handleResize = () => {
      resize();
      createStars();
      if (prefersReducedMotion) drawStatic();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="starfield" aria-hidden="true" />;
}
