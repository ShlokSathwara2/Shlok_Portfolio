"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function ParticleNetwork({ scrollY = 0 }: { scrollY?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const scrollRef = useRef(0);

  scrollRef.current = scrollY;

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 80);
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  useEffect(() => {
    init();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [init]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    function draw() {
      ctx!.clearRect(0, 0, w(), h());
      const particles = particlesRef.current;
      const scroll = scrollRef.current;
      const scrollOffset = scroll * 0.15;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w();
        if (p.x > w()) p.x = 0;
        if (p.y < 0) p.y = h();
        if (p.y > h()) p.y = 0;

        const drawY = (p.y + scrollOffset) % h();

        ctx!.beginPath();
        ctx!.arc(p.x, drawY, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx!.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const drawY2 = (p2.y + scrollOffset) % h();
          const dx = p.x - p2.x;
          const dy = drawY - drawY2;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, drawY);
            ctx!.lineTo(p2.x, drawY2);
            ctx!.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 150)})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
