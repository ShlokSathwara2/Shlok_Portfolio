"use client";

import { useRef, useEffect, useCallback } from "react";

interface NodeParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  layer: number; // 0 = micro star, 1 = constellation node, 2 = hero luminous node
  color: string;
  glowColor: string;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export default function ParticleNetwork({ scrollY = 0 }: { scrollY?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<NodeParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });
  const scrollRef = useRef(0);
  const prevScrollRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const wavePulseRef = useRef({ radius: 0, active: true, startTime: 0 });

  useEffect(() => {
    scrollVelocityRef.current = (scrollY - prevScrollRef.current) * 0.4;
    prevScrollRef.current = scrollY;
    scrollRef.current = scrollY;
  }, [scrollY]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const isMobile = w < 768;
    // Balanced particle count for silky 60+ FPS on any screen
    const count = isMobile
      ? Math.min(Math.floor((w * h) / 24000), 38)
      : Math.min(Math.floor((w * h) / 13000), 96);

    const particles: NodeParticle[] = [];

    // Colors matching Shlok's cyber developer palette
    const colors = [
      { fill: "#38bdf8", glow: "rgba(56, 189, 248, 0.45)" }, // Cyan / Sky Blue
      { fill: "#818cf8", glow: "rgba(129, 140, 248, 0.40)" }, // Indigo
      { fill: "#c084fc", glow: "rgba(192, 132, 252, 0.40)" }, // Violet
      { fill: "#34d399", glow: "rgba(52, 211, 153, 0.35)" },  // Mint Emerald
    ];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const layer = i % 5 === 0 ? 2 : i % 3 === 0 ? 0 : 1;
      const col = colors[i % colors.length];

      let radius = 1.6;
      let baseAlpha = 0.5;
      if (layer === 0) {
        radius = Math.random() * 0.8 + 0.6; // Fine micro stardust
        baseAlpha = Math.random() * 0.35 + 0.2;
      } else if (layer === 2) {
        radius = Math.random() * 1.4 + 2.4; // Hero luminous node
        baseAlpha = Math.random() * 0.35 + 0.65;
      } else {
        radius = Math.random() * 1.0 + 1.2; // Constellation node
        baseAlpha = Math.random() * 0.3 + 0.45;
      }

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * (layer === 0 ? 0.18 : 0.35),
        vy: (Math.random() - 0.5) * (layer === 0 ? 0.18 : 0.35),
        radius,
        layer,
        color: col.fill,
        glowColor: col.glow,
        baseAlpha,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
      });
    }

    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    init();
    const onResize = () => init();
    window.addEventListener("resize", onResize, { passive: true });

    const onPointerMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [init]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const maxLinkDist = 135;
    const maxLinkDistSq = maxLinkDist * maxLinkDist;
    const mouseRadius = 170;
    const mouseRadiusSq = mouseRadius * mouseRadius;

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      time += 0.018;

      // Mouse position lerping
      const mouse = mouseRef.current;
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.14;
        mouse.y += (mouse.targetY - mouse.y) * 0.14;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Smooth scroll velocity decay
      scrollVelocityRef.current *= 0.88;
      const scrollDrift = scrollVelocityRef.current * 0.25;

      const particles = particlesRef.current;

      // Harmonic energy wave pulse triggered every 8 seconds
      const now = performance.now();
      if (now - wavePulseRef.current.startTime > 7500) {
        wavePulseRef.current.startTime = now;
        wavePulseRef.current.radius = 0;
        wavePulseRef.current.active = true;
      }
      if (wavePulseRef.current.active) {
        wavePulseRef.current.radius += 7;
        if (wavePulseRef.current.radius > Math.max(w, h) * 1.2) {
          wavePulseRef.current.active = false;
        }
      }
      const waveRadius = wavePulseRef.current.radius;
      const waveCenter = {
        x: mouse.active ? mouse.x : w * 0.5,
        y: mouse.active ? mouse.y : h * 0.45,
      };

      // 1. UPDATE AND DRAW PARTICLES
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Intrinsic drift
        p.x += p.vx;
        p.y += p.vy + scrollDrift * (p.layer === 0 ? 0.3 : p.layer === 2 ? 1.2 : 0.7);

        // Screen wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Interactive mouse gravity & deflection field
        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDistSq = mdx * mdx + mdy * mdy;

          if (mDistSq < mouseRadiusSq && mDistSq > 1) {
            const mDist = Math.sqrt(mDistSq);
            const force = (1 - mDist / mouseRadius) * 2.8;
            // Subtle magnetic pull + swirling orbit around cursor
            p.x += (mdx / mDist) * force + (mdy / mDist) * 0.4;
            p.y += (mdy / mDist) * force - (mdx / mDist) * 0.4;
          }
        }

        // Pulse breathing
        p.pulsePhase += p.pulseSpeed;
        const pulse = Math.sin(p.pulsePhase) * 0.25;
        let alpha = Math.max(0.08, Math.min(1, p.baseAlpha + pulse));

        // Wave pulse excitation
        if (wavePulseRef.current.active) {
          const wdx = p.x - waveCenter.x;
          const wdy = p.y - waveCenter.y;
          const distToWave = Math.abs(Math.sqrt(wdx * wdx + wdy * wdy) - waveRadius);
          if (distToWave < 60) {
            alpha = Math.min(1, alpha + (1 - distToWave / 60) * 0.45);
          }
        }

        // Draw particle
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = alpha;
        ctx!.fill();

        // Hero nodes get radiant bloom
        if (p.layer === 2) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
          ctx!.fillStyle = p.glowColor;
          ctx!.globalAlpha = alpha * 0.35;
          ctx!.fill();
        }
      }

      // 2. DRAW CONSTELLATION ENERGY LINKS
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.layer === 0) continue; // Micro stars don't connect

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.layer === 0) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxLinkDistSq) {
            const dist = Math.sqrt(distSq);
            let linkAlpha = (1 - dist / maxLinkDist) * 0.22;

            // Brighten links near cursor
            if (mouse.active) {
              const midX = (p1.x + p2.x) * 0.5;
              const midY = (p1.y + p2.y) * 0.5;
              const mdx = mouse.x - midX;
              const mdy = mouse.y - midY;
              if (mdx * mdx + mdy * mdy < mouseRadiusSq) {
                linkAlpha *= 2.2;
              }
            }

            ctx!.beginPath();
            ctx!.moveTo(p1.x, p1.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.strokeStyle = p1.color;
            ctx!.globalAlpha = Math.min(0.65, linkAlpha);
            ctx!.lineWidth = 0.75;
            ctx!.stroke();
          }
        }
      }

      ctx!.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
