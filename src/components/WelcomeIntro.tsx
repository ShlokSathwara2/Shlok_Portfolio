"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, Code2, Sparkles, Terminal } from "lucide-react";

export default function WelcomeIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  const opacity = useTransform(smooth, [0, 0.7, 0.98], [1, 1, 0]);
  const scale = useTransform(smooth, [0, 0.98], [1, 0.92]);
  const y = useTransform(smooth, [0, 0.98], [0, -50]);
  const hintOpacity = useTransform(smooth, [0, 0.18], [1, 0]);

  // Next-Level Visuals: Interactive Cosmic Cyber Nebula Canvas
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const onPointerMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / width;
      mouseRef.current.targetY = e.clientY / height;
    };
    window.addEventListener("mousemove", onPointerMove);

    // Particle nodes for cosmic quantum mesh
    const count = window.innerWidth < 768 ? 55 : 110;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.6 + 0.3,
      color: Math.random() > 0.4 ? "#38bdf8" : Math.random() > 0.5 ? "#818cf8" : "#22d3ee",
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const render = () => {
      time += 0.016;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // 1. Volumetric Celestial Nebula Glows
      const mx = mouseRef.current.x * width;
      const my = mouseRef.current.y * height;

      const grad1 = ctx.createRadialGradient(
        mx,
        my,
        20,
        mx,
        my,
        Math.max(width, height) * 0.55
      );
      grad1.addColorStop(0, "rgba(56, 189, 248, 0.18)");
      grad1.addColorStop(0.35, "rgba(99, 102, 241, 0.08)");
      grad1.addColorStop(0.7, "rgba(14, 165, 233, 0.03)");
      grad1.addColorStop(1, "transparent");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Secondary floating ambient aurora pulse
      const ax = width * (0.5 + Math.sin(time * 0.4) * 0.18);
      const ay = height * (0.45 + Math.cos(time * 0.35) * 0.14);
      const grad2 = ctx.createRadialGradient(ax, ay, 40, ax, ay, width * 0.45);
      grad2.addColorStop(0, "rgba(168, 85, 247, 0.12)");
      grad2.addColorStop(0.5, "rgba(56, 189, 248, 0.05)");
      grad2.addColorStop(1, "transparent");

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Quantum Nodes & Constellation Lines
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(time + p.phase) * 0.15;
        p.y += p.vy + Math.cos(time + p.phase) * 0.15;

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gravity attraction toward cursor
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const force = (220 - dist) / 220;
          p.x += (dx / dist) * force * 0.6;
          p.y += (dy / dist) * force * 0.6;
        }

        // Draw connections
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - dist2 / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle node with additive glow
        const pulse = 1 + Math.sin(time * 2 + p.phase) * 0.35;
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 3.5;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
    };
  }, [reduced]);

  return (
    <section
      id="welcome"
      ref={rootRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050506]"
      aria-label="Welcome to Shlok Sathwara's world"
    >
      {/* Living Interactive Cosmic Cyber Nebula */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden
      />

      {/* Cybernetic geometric scanline grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 30%, transparent 80%)",
        }}
        aria-hidden
      />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <motion.div
          style={reduced ? undefined : { opacity, scale, y }}
          className="flex flex-col items-center"
        >
          {/* Wow-Factor Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-sky-400/35 bg-sky-950/40 backdrop-blur-xl shadow-[0_0_35px_rgba(56,189,248,0.25)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400 shadow-[0_0_12px_#38bdf8]" />
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-sky-200">
              Welcome to my world
            </span>
            <span className="w-px h-3.5 bg-sky-400/30" />
            <span className="text-[11px] sm:text-xs font-mono text-sky-400 font-medium tracking-wider">
              2026 EDITION
            </span>
          </motion.div>

          {/* Monumental Name Typography with Shimmer Holographic Gradient */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-[0.92] tracking-[-0.04em] select-none">
              Shlok{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 drop-shadow-[0_0_40px_rgba(56,189,248,0.45)]">
                Sathwara
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-clip-text text-transparent pointer-events-none animate-shimmer"
                  aria-hidden
                />
              </span>
            </h1>
          </motion.div>

          {/* Magnetic Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-200 text-lg sm:text-xl md:text-2xl max-w-2xl font-light leading-relaxed mb-10"
          >
            Software Engineer &amp; AI Developer crafting{" "}
            <span className="text-sky-300 font-normal underline decoration-sky-400/40 underline-offset-4">
              intelligent systems
            </span>{" "}
            and cinematic digital experiences.
          </motion.p>

          {/* Live Capability Pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {[
              { icon: Code2, label: "Full-Stack Web & Next.js" },
              { icon: Terminal, label: "FastAPI & Python AI" },
              { icon: Sparkles, label: "9.44 CGPA • SRMIST" },
            ].map((pill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-xs sm:text-sm text-gray-300 hover:border-sky-400/40 hover:text-sky-200 transition-colors"
              >
                <pill.icon className="w-3.5 h-3.5 text-sky-400" />
                {pill.label}
              </span>
            ))}
          </motion.div>

          {/* Scroll Cue with Glowing Line */}
          <motion.div
            style={reduced ? undefined : { opacity: hintOpacity }}
            className="flex flex-col items-center gap-3 text-sky-400 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-[11px] uppercase tracking-[0.26em] font-mono font-medium text-gray-400">
              Scroll down to explore
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-sky-400/30 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
