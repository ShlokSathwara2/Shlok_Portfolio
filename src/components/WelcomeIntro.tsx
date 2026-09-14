"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValue } from "framer-motion";

const SKILLS = [
  { label: "React", angle: 0 },
  { label: "Python", angle: 45 },
  { label: "Java", angle: 90 },
  { label: "Next.js", angle: 135 },
  { label: "AI/ML", angle: 180 },
  { label: "Node.js", angle: 225 },
  { label: "TypeScript", angle: 270 },
  { label: "SQL", angle: 315 },
];

const STATS = [
  { value: 9.44, label: "CGPA", decimals: 2 },
  { value: 10, label: "Projects", decimals: 0 },
  { value: 7, label: "Certifications", decimals: 0 },
  { value: 2, label: "Experiences", decimals: 0 },
];

const CODE_FRAGMENTS = [
  "const app = () => {}",
  "def train_model():",
  "SELECT * FROM users",
  "import React from 'react'",
  "async function fetch()",
  "class Engine:",
  "npm install framer",
  "<Component />",
  "export default",
  "for i in range(10):",
  "try { await }",
  "if (status === 200)",
  "git commit -m",
  "docker build .",
  "python main.py",
  "rs.render()",
  "function useAuth()",
  "type Props = {}",
  "<div className=''/>>",
  "return res.json()",
];

const BADGES = [
  { text: "Oracle Certified", delay: 0 },
  { text: "Linde Intern", delay: 0.03 },
  { text: "Topper — SRM", delay: 0.06 },
  { text: "CGPA 9.44", delay: 0.09 },
  { text: "AI Engineer", delay: 0.12 },
];

const RIFT_CRACKS = [
  "M 500 500 L 500 300 L 480 180 L 470 60 L 460 0",
  "M 500 500 L 500 300 L 530 170 L 540 50 L 550 0",
  "M 500 500 L 620 380 L 740 280 L 880 180 L 1000 100",
  "M 500 500 L 380 380 L 260 280 L 120 180 L 0 100",
  "M 500 500 L 700 500 L 850 480 L 1000 470",
  "M 500 500 L 300 500 L 150 520 L 0 530",
  "M 500 500 L 620 620 L 740 740 L 880 880 L 1000 1000",
  "M 500 500 L 380 620 L 260 740 L 120 880 L 0 1000",
  "M 500 500 L 500 700 L 480 850 L 470 1000",
  "M 500 500 L 500 700 L 530 850 L 550 1000",
  "M 500 500 L 680 420 L 820 350 L 960 260 L 1000 200",
  "M 500 500 L 320 420 L 180 350 L 40 260 L 0 200",
  "M 500 500 L 580 650 L 640 800 L 700 950 L 750 1000",
  "M 500 500 L 420 650 L 360 800 L 300 950 L 250 1000",
];

// ─── Scroll Velocity Hook ───────────────────────────────────────────────────
function useScrollVelocity(smooth: MotionValue<number>) {
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    let last = 0;
    let lastTime = performance.now();
    const unsub = smooth.on("change", (v) => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        setVelocity(Math.abs(v - last) / (dt / 16.67));
      }
      last = v;
      lastTime = now;
    });
    return unsub;
  }, [smooth]);

  return velocity;
}

// ─── Dimensional Rift ───────────────────────────────────────────────────────
function DimensionalRift({ progress }: { progress: MotionValue<number> }) {
  const riftOpacity = useTransform(progress, [0.28, 0.34, 0.48, 0.56], [0, 1, 1, 0]);
  const crackProgress = useTransform(progress, [0.28, 0.42], [0, 1]);
  const leftX = useTransform(progress, [0.32, 0.48], [0, -60]);
  const rightX = useTransform(progress, [0.32, 0.48], [0, 60]);
  const glowIntensity = useTransform(progress, [0.34, 0.4, 0.48], [0, 1, 0]);

  return (
    <motion.div className="absolute inset-0 z-[3] pointer-events-none" style={{ opacity: riftOpacity }}>
      <motion.svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="rift-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {RIFT_CRACKS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(99,102,241,0.7)"
            strokeWidth={i < 4 ? 3 : 2}
            filter="url(#rift-glow)"
            style={{
              pathLength: crackProgress,
              opacity: i < 4 ? 1 : 0.6,
            }}
          />
        ))}
      </motion.svg>
      {/* Left half slides left */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ x: leftX, clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent" />
      </motion.div>
      {/* Right half slides right */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ x: rightX, clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-indigo-500/5 to-transparent" />
      </motion.div>
      {/* Center glow */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-[4px] -translate-x-1/2"
        style={{
          opacity: glowIntensity,
          background: "linear-gradient(180deg, transparent 10%, rgba(99,102,241,0.8) 40%, rgba(14,165,233,1) 50%, rgba(99,102,241,0.8) 60%, transparent 90%)",
          boxShadow: "0 0 40px 10px rgba(99,102,241,0.4), 0 0 80px 20px rgba(14,165,233,0.2)",
        }}
      />
    </motion.div>
  );
}

// ─── Holographic Profile ────────────────────────────────────────────────────
function HolographicProfile({ progress }: { progress: MotionValue<number> }) {
  const flickerKeyframes = [1, 0.2, 1, 1, 0.4, 1, 1, 1, 0.6, 1, 1, 1, 1, 0.3, 1];
  const scanY = useTransform(progress, [0.38, 0.56], [0, 100]);
  const flickerPhase = useTransform(progress, (v) => {
    const t = v * 30;
    return flickerKeyframes[Math.floor(t) % flickerKeyframes.length];
  });

  return (
    <motion.div className="absolute inset-0 z-[6] pointer-events-none">
      {/* Scanlines */}
      <motion.div
        className="absolute left-0 right-0 h-full pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99,102,241,0.03) 2px, rgba(99,102,241,0.03) 4px)",
        }}
      />
      {/* Moving scan beam */}
      <motion.div
        className="absolute left-0 right-0 h-[60px] pointer-events-none"
        style={{
          top: `${scanY}%`,
          background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.08), transparent)",
        }}
      />
      {/* RGB shift flicker */}
      <motion.div
        className="absolute inset-0 mix-blend-screen pointer-events-none"
        style={{
          opacity: flickerPhase,
          background: "linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 30%, rgba(14,165,233,0.03) 70%, transparent 100%)",
        }}
      />
      {/* Projection cone from bottom */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] md:w-[280px] pointer-events-none"
        style={{
          height: "40%",
          opacity: useTransform(progress, [0.38, 0.45, 0.55], [0, 0.4, 0]),
          background: "linear-gradient(0deg, rgba(99,102,241,0.15) 0%, transparent 100%)",
          clipPath: "polygon(30% 100%, 70% 100%, 55% 0%, 45% 0%)",
        }}
      />
    </motion.div>
  );
}

// ─── Particle Dissolution Canvas ────────────────────────────────────────────
function ParticleDissolution({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; rotation: number; rotSpeed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Sample colors from the profile area
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2 - 30;
    const sampleW = Math.min(300, window.innerWidth * 0.7);
    const sampleH = Math.min(380, window.innerHeight * 0.7);

    const particles: typeof particlesRef.current = [];
    const cols = 40;
    const rows = 50;
    const colorPalette = [
      "rgba(99,102,241,0.8)", "rgba(99,102,241,0.6)", "rgba(99,102,241,0.4)",
      "rgba(14,165,233,0.7)", "rgba(14,165,233,0.5)", "rgba(14,165,233,0.3)",
      "rgba(168,85,247,0.6)", "rgba(168,85,247,0.4)", "rgba(255,255,255,0.3)",
    ];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const px = cx - sampleW / 2 + (i / cols) * sampleW;
        const py = cy - sampleH / 2 + (j / rows) * sampleH;
        const angle = Math.atan2(py - cy, px - cx);
        const speed = 1.5 + Math.random() * 5;
        particles.push({
          x: px, y: py,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2 - Math.random() * 2,
          size: 2 + Math.random() * 4,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          life: 1,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
        });
      }
    }
    particlesRef.current = particles;

    let frame: number;
    let dissolved = false;

    const animate = () => {
      const raw = progress.get();
      if (raw >= 0.58 && !dissolved) dissolved = true;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (dissolved) {
        let alive = false;
        for (const p of particles) {
          if (p.life <= 0) continue;
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.vy += 0.04;
          p.rotation += p.rotSpeed;
          p.life -= 0.012;

          ctx.save();
          ctx.globalAlpha = p.life * 0.7;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
        if (!alive) dissolved = false;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [progress]);

  const opacity = useTransform(progress, [0.55, 0.58, 0.72, 0.78], [0, 0.8, 0.8, 0]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 z-[6] pointer-events-none"
      style={{ opacity }}
    />
  );
}

// ─── Hyperspace Effect ──────────────────────────────────────────────────────
function HyperspaceEffect({ velocity }: { velocity: number }) {
  const [lines, setLines] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      angle: (i / 60) * Math.PI * 2 + Math.random() * 0.1,
      speed: 0.5 + Math.random() * 1.5,
      length: 20 + Math.random() * 80,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  );

  const intensity = Math.min(velocity * 3, 1);

  if (intensity < 0.15) return null;

  return (
    <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
      {/* Speed lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {lines.map((line, i) => {
          const cx = 50;
          const cy = 50;
          const innerR = 5 + Math.random() * 5;
          const outerR = innerR + line.length * intensity * 0.3;
          const x1 = cx + Math.cos(line.angle) * innerR;
          const y1 = cy + Math.sin(line.angle) * innerR;
          const x2 = cx + Math.cos(line.angle) * outerR;
          const y2 = cy + Math.sin(line.angle) * outerR;

          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgba(99,102,241,0.6)"
              strokeWidth="0.15"
              opacity={line.opacity * intensity}
            />
          );
        })}
      </svg>
      {/* Center flash */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: `${60 + intensity * 100}px`,
          height: `${60 + intensity * 100}px`,
          background: `radial-gradient(circle, rgba(99,102,241,${intensity * 0.3}) 0%, rgba(14,165,233,${intensity * 0.15}) 40%, transparent 70%)`,
        }}
      />
      {/* Vignette intensifies */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,${intensity * 0.4}) 100%)`,
        }}
      />
    </div>
  );
}

// ─── Typewriter Name ────────────────────────────────────────────────────────
function TypewriterName({ progress }: { progress: MotionValue<number> }) {
  const FULL_NAME = "Shlok Sathwara";
  const [charCount, setCharCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      const t = Math.max(0, Math.min((v - 0.84) / 0.1, 1));
      setCharCount(Math.floor(t * FULL_NAME.length));
    });
    return unsub;
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  const containerOpacity = useTransform(progress, [0.82, 0.86, 0.94, 1.0], [0, 1, 1, 0]);
  const containerY = useTransform(progress, [0.82, 0.88], [30, 0]);

  return (
    <motion.div
      className="absolute inset-0 z-[13] flex flex-col items-center justify-end pb-[15vh] text-center px-6 pointer-events-none"
      style={{ opacity: containerOpacity, y: containerY }}
    >
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1] tracking-[-0.02em] mb-3">
        <span>{FULL_NAME.slice(0, charCount)}</span>
        <span
          className="inline-block w-[3px] h-[0.85em] ml-1 align-middle"
          style={{
            backgroundColor: showCursor && charCount < FULL_NAME.length ? "rgba(99,102,241,0.9)" : "transparent",
            boxShadow: showCursor && charCount < FULL_NAME.length ? "0 0 10px rgba(99,102,241,0.5)" : "none",
          }}
        />
      </h2>
      <motion.p
        className="text-gray-400 text-base md:text-lg max-w-[440px] leading-relaxed"
        style={{ opacity: useTransform(progress, [0.9, 0.94], [0, 1]) }}
      >
        Computer Science &amp; Technology at SRMIST
      </motion.p>
      <motion.p
        className="text-gray-500 text-sm mt-2"
        style={{ opacity: useTransform(progress, [0.92, 0.96], [0, 1]) }}
      >
        CGPA: 9.44
      </motion.p>
    </motion.div>
  );
}

// ─── Holographic Scanline ───────────────────────────────────────────────────
function HolographicScanline({ progress }: { progress: MotionValue<number> }) {
  const yPos = useTransform(progress, [0.35, 0.55], [-5, 105]);
  const opacity = useTransform(progress, [0.35, 0.38, 0.52, 0.55], [0, 0.8, 0.8, 0]);

  return (
    <motion.div
      className="absolute inset-0 z-[4] pointer-events-none"
      style={{ opacity }}
    >
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          top: `${yPos}%`,
          background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 20%, rgba(14,165,233,0.9) 50%, rgba(99,102,241,0.6) 80%, transparent 100%)",
          boxShadow: "0 0 20px 4px rgba(99,102,241,0.4), 0 0 60px 8px rgba(14,165,233,0.2)",
        }}
      />
      <motion.div
        className="absolute left-0 right-0 h-[40px] opacity-20"
        style={{
          top: `calc(${yPos}% - 20px)`,
          background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.15), transparent)",
        }}
      />
    </motion.div>
  );
}

// ─── Keyboard Rain ──────────────────────────────────────────────────────────
function KeyboardRain({ progress }: { progress: MotionValue<number> }) {
  const containerOpacity = useTransform(progress, [0.55, 0.6, 0.76, 0.82], [0, 0.6, 0.6, 0]);

  return (
    <motion.div
      className="absolute inset-0 z-[10] pointer-events-none overflow-hidden"
      style={{ opacity: containerOpacity }}
    >
      {CODE_FRAGMENTS.map((code, i) => {
        const left = (i * 37 + 13) % 100;
        const delay = i * 0.025;
        const duration = 0.15 + (i % 5) * 0.02;
        const yPos = useTransform(
          progress,
          [0.56 + delay, 0.56 + delay + duration],
          [-10, 110]
        );
        const opacity = useTransform(
          progress,
          [0.56 + delay, 0.58 + delay, 0.68 + delay, 0.7 + delay],
          [0, 0.5, 0.5, 0]
        );
        const rotate = useTransform(progress, [0.56 + delay, 0.56 + delay + duration], [0, (i % 2 === 0 ? 1 : -1) * 15]);

        return (
          <motion.div
            key={i}
            className="absolute whitespace-nowrap font-mono text-[0.55rem] md:text-[0.65rem] text-indigo-400/30"
            style={{
              left: `${left}%`,
              top: `${yPos}%`,
              opacity,
              rotate,
            }}
          >
            {code}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Gradient Waves ─────────────────────────────────────────────────────────
function GradientWaves({ progress }: { progress: MotionValue<number> }) {
  const waves = [0, 1, 2, 3];
  const colors = ["rgba(99,102,241,0.3)", "rgba(14,165,233,0.25)", "rgba(168,85,247,0.2)", "rgba(99,102,241,0.15)"];

  return (
    <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
      {waves.map((i) => {
        const delay = i * 0.03;
        const opacity = useTransform(progress, [0.55 + delay, 0.6 + delay, 0.72 + delay, 0.78 + delay], [0, 0.25, 0.25, 0]);
        const scale = useTransform(progress, [0.55 + delay, 0.75 + delay], [0.1, 2 + i * 0.3]);

        return (
          <motion.div
            key={i}
            className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full"
            style={{
              opacity,
              scale,
              border: `2px solid ${colors[i]}`,
              boxShadow: `0 0 30px ${colors[i]}`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Particle Trails (SVG lines between skill icons) ────────────────────────
function ParticleTrails({ progress }: { progress: MotionValue<number> }) {
  const burstRadius = 180;
  const lines = SKILLS.map((s, i) => {
    const next = SKILLS[(i + 1) % SKILLS.length];
    const x1 = Math.cos((s.angle * Math.PI) / 180) * burstRadius;
    const y1 = Math.sin((s.angle * Math.PI) / 180) * burstRadius;
    const x2 = Math.cos((next.angle * Math.PI) / 180) * burstRadius;
    const y2 = Math.sin((next.angle * Math.PI) / 180) * burstRadius;
    return { x1, y1, x2, y2 };
  });

  const pathOpacity = useTransform(progress, [0.6, 0.66, 0.74, 0.8], [0, 0.4, 0.4, 0]);

  return (
    <motion.svg
      className="absolute inset-0 z-[8] w-full h-full pointer-events-none"
      style={{ opacity: pathOpacity }}
    >
      {lines.map((l, i) => {
        const lineOpacity = useTransform(progress, [0.62 + i * 0.02, 0.66 + i * 0.02], [0, 1]);
        return (
          <motion.line
            key={i}
            x1={`${50 + (l.x1 / 1920) * 100}%`}
            y1={`${50 + (l.y1 / 1080) * 100}%`}
            x2={`${50 + (l.x2 / 1920) * 100}%`}
            y2={`${50 + (l.y2 / 1080) * 100}%`}
            stroke="rgba(99,102,241,0.12)"
            strokeWidth="1"
            style={{ opacity: lineOpacity }}
          />
        );
      })}
    </motion.svg>
  );
}

// ─── Breathing Glow ─────────────────────────────────────────────────────────
function BreathingGlow({ progress }: { progress: MotionValue<number> }) {
  const glowOpacity = useTransform(progress, [0.4, 0.55, 0.6, 0.75, 0.82], [0, 0.6, 1, 1, 0]);
  const glowScale = useTransform(progress, [0.55, 0.6, 0.65, 0.7, 0.75, 0.8], [1, 1.1, 0.95, 1.15, 0.9, 1]);

  return (
    <motion.div
      className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none"
      style={{ opacity: glowOpacity }}
    >
      <motion.div
        className="w-[350px] h-[450px] md:w-[400px] md:h-[500px] rounded-2xl"
        style={{
          scale: glowScale,
          boxShadow: "0 0 80px 30px rgba(99,102,241,0.25), 0 0 160px 60px rgba(14,165,233,0.15), inset 0 0 60px rgba(99,102,241,0.1)",
        }}
      />
    </motion.div>
  );
}

// ─── Glitch Flicker ─────────────────────────────────────────────────────────
function GlitchFlicker({ progress }: { progress: MotionValue<number> }) {
  const glitchOpacity = useTransform(progress, [0.82, 0.83, 0.84, 0.85, 0.86], [0, 1, 0, 1, 0]);
  const glitchX = useTransform(progress, [0.82, 0.83, 0.84, 0.85], [0, -3, 2, -1]);
  const glitchX2 = useTransform(progress, [0.82, 0.83, 0.84, 0.85], [0, 3, -2, 1]);

  return (
    <motion.div
      className="absolute inset-0 z-[11] pointer-events-none"
      style={{ opacity: glitchOpacity }}
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-end pb-[15vh] text-center px-6"
        style={{ x: glitchX, mixBlendMode: "screen" }}
      >
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl font-black text-red-500/40 leading-[1] tracking-[-0.02em] mb-3">
          Shlok <span>Sathwara</span>
        </h2>
      </motion.div>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-end pb-[15vh] text-center px-6"
        style={{ x: glitchX2, mixBlendMode: "screen" }}
      >
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl font-black text-cyan-500/40 leading-[1] tracking-[-0.02em] mb-3">
          Shlok <span>Sathwara</span>
        </h2>
      </motion.div>
    </motion.div>
  );
}

// ─── Floating Badges ────────────────────────────────────────────────────────
function FloatingBadges({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 z-[9] pointer-events-none">
      {BADGES.map((badge, i) => {
        const isLeft = i % 2 === 0;
        const startX = isLeft ? -30 : 130;
        const endX = isLeft ? 8 + i * 3 : 92 - i * 3;
        const yPos = 20 + i * 12;

        const opacity = useTransform(
          progress,
          [0.65 + badge.delay, 0.7 + badge.delay, 0.78 + badge.delay, 0.83 + badge.delay],
          [0, 1, 1, 0]
        );
        const x = useTransform(progress, [0.65 + badge.delay, 0.72 + badge.delay], [startX, endX]);
        const y = useTransform(progress, [0.65 + badge.delay, 0.72 + badge.delay], [yPos + 10, yPos]);

        return (
          <motion.div
            key={badge.text}
            className="absolute flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full backdrop-blur-sm"
            style={{ opacity, x: `${x}%`, y: `${y}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[0.55rem] md:text-[0.65rem] text-gray-400 font-medium whitespace-nowrap">{badge.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Mouse Parallax Hook ────────────────────────────────────────────────────
function useMouseParallax(strength: number = 8) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * strength;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY, strength]);

  return { mouseX, mouseY };
}

// ─── Skill Burst ────────────────────────────────────────────────────────────
function SkillBurst({ progress, mouseX, mouseY }: { progress: MotionValue<number>; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const burstRadius = 180;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {SKILLS.map((skill, i) => {
        const angleRad = (skill.angle * Math.PI) / 180;
        const tx = Math.cos(angleRad) * burstRadius;
        const ty = Math.sin(angleRad) * burstRadius;

        const delay = i * 0.03;
        const opacity = useTransform(
          progress,
          [0.58 + delay, 0.64 + delay, 0.76, 0.82],
          [0, 1, 1, 0]
        );
        const baseX = useTransform(progress, [0.58 + delay, 0.66 + delay], [0, tx]);
        const baseY = useTransform(progress, [0.58 + delay, 0.66 + delay], [0, ty]);
        const scale = useTransform(progress, [0.58 + delay, 0.64 + delay, 0.76, 0.82], [0.3, 1, 1, 0.5]);

        const parallaxX = useTransform(mouseX, (v) => v * (0.3 + i * 0.1));
        const parallaxY = useTransform(mouseY, (v) => v * (0.3 + i * 0.1));
        const x = useTransform(() => baseX.get() + parallaxX.get());
        const y = useTransform(() => baseY.get() + parallaxY.get());

        return (
          <motion.div
            key={skill.label}
            className="absolute flex flex-col items-center gap-1.5"
            style={{ opacity, x, y, scale }}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md flex items-center justify-center">
              <span className="text-[0.65rem] md:text-xs font-bold text-indigo-400">{skill.label.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="text-[0.6rem] md:text-[0.65rem] text-gray-500 font-medium tracking-wide">{skill.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function AnimatedStat({
  value,
  label,
  decimals,
  progress,
  inputRange,
}: {
  value: number;
  label: string;
  decimals: number;
  progress: MotionValue<number>;
  inputRange: [number, number];
}) {
  const [display, setDisplay] = useState("0");
  const opacity = useTransform(progress, [inputRange[0] - 0.02, inputRange[0], inputRange[1], inputRange[1] + 0.04], [0, 1, 1, 0]);
  const y = useTransform(progress, [inputRange[0], inputRange[0] + 0.04], [30, 0]);

  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      if (v < inputRange[0]) {
        setDisplay(decimals > 0 ? "0.00" : "0");
        return;
      }
      const t = Math.min((v - inputRange[0]) / (inputRange[1] - inputRange[0]), 1);
      const current = t * value;
      setDisplay(decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString());
    });
    return unsub;
  }, [progress, value, decimals, inputRange]);

  return (
    <motion.div className="flex flex-col items-center" style={{ opacity, y }}>
      <span className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-black text-white leading-none">
        {display}
      </span>
      <span className="text-[0.6rem] md:text-xs text-gray-500 uppercase tracking-[0.1em] mt-1.5">{label}</span>
    </motion.div>
  );
}

function BurstRing({ progress }: { progress: MotionValue<number> }) {
  const ringOpacity = useTransform(progress, [0.58, 0.62, 0.72, 0.78], [0, 0.5, 0.5, 0]);
  const ringScale = useTransform(progress, [0.58, 0.72], [0.2, 1.4]);
  const ringOpacity2 = useTransform(progress, [0.6, 0.64, 0.74, 0.8], [0, 0.3, 0.3, 0]);
  const ringScale2 = useTransform(progress, [0.6, 0.74], [0.3, 1.6]);

  return (
    <div className="absolute inset-0 z-[7] flex items-center justify-center pointer-events-none">
      <motion.div
        className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-indigo-500/30"
        style={{ opacity: ringOpacity, scale: ringScale }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] md:w-[350px] md:h-[350px] rounded-full border border-sky-500/20"
        style={{ opacity: ringOpacity2, scale: ringScale2 }}
      />
    </div>
  );
}

function SkillBurstSection({ progress, mouseX, mouseY }: { progress: MotionValue<number>; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 z-[8] pointer-events-none">
      <BurstRing progress={progress} />
      <ParticleTrails progress={progress} />
      <SkillBurst progress={progress} mouseX={mouseX} mouseY={mouseY} />
    </div>
  );
}

function StatCounters({ progress }: { progress: MotionValue<number> }) {
  const containerOpacity = useTransform(progress, [0.68, 0.74, 0.82, 0.88], [0, 1, 1, 0]);
  const containerY = useTransform(progress, [0.68, 0.74], [40, 0]);

  return (
    <motion.div
      className="absolute inset-0 z-[9] flex items-end justify-center pb-[18vh] pointer-events-none"
      style={{ opacity: containerOpacity, y: containerY }}
    >
      <div className="flex gap-8 sm:gap-10 md:gap-14">
        {STATS.map((stat, i) => (
          <AnimatedStat
            key={stat.label}
            value={stat.value}
            label={stat.label}
            decimals={stat.decimals}
            progress={progress}
            inputRange={[0.7 + i * 0.01, 0.76 + i * 0.01]}
          />
        ))}
      </div>
    </motion.div>
  );
}

function FramePiece({
  frame,
  progress,
  videoSrc,
}: {
  frame: { id: number; row: number; col: number; spreadX: number; spreadY: number; rotation: number };
  progress: MotionValue<number>;
  videoSrc: string;
}) {
  const cellW = 100 / 3;
  const cellH = 100 / 3;

  const x = useTransform(progress, [0.28, 0.5], [0, frame.spreadX]);
  const y = useTransform(progress, [0.28, 0.5], [0, frame.spreadY]);
  const rotate = useTransform(progress, [0.28, 0.55], [0, frame.rotation + 360]);
  const scale = useTransform(progress, [0.28, 0.42, 0.55], [1, 1.15, 0.6]);
  const opacity = useTransform(progress, [0.25, 0.34, 0.52, 0.62], [0, 1, 1, 0]);

  return (
    <motion.div
      className="absolute overflow-hidden rounded-lg border border-white/10"
      style={{
        width: `${cellW + 0.5}%`,
        height: `${cellH + 0.5}%`,
        left: `${frame.col * cellW}%`,
        top: `${frame.row * cellH}%`,
        x,
        y,
        rotate,
        scale,
        opacity,
      }}
    >
      <video
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          width: "300%",
          height: "300%",
          transform: `translate(-${frame.col * 100}%, -${frame.row * 100}%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
    </motion.div>
  );
}

const FRAMES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  row: Math.floor(i / 3),
  col: i % 3,
  spreadX: (i % 3 - 1) * 220,
  spreadY: (Math.floor(i / 3) - 1) * 220,
  rotation: (Math.random() - 0.5) * 60,
}));

export default function WelcomeIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mouseX, mouseY } = useMouseParallax(8);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001,
  });

  const velocity = useScrollVelocity(smooth);

  const videoOpacity = useTransform(smooth, [0, 0.2, 0.4], [1, 1, 0]);
  const videoScale = useTransform(smooth, [0, 0.4], [1, 1.2]);
  const overlayOpacity = useTransform(smooth, [0, 0.1, 0.3], [0, 0, 0.8]);

  const welcomeOpacity = useTransform(smooth, [0, 0.05, 0.18, 0.28], [1, 1, 1, 0]);

  const framesOpacity = useTransform(smooth, [0.22, 0.32, 0.52, 0.62], [0, 1, 1, 0]);
  const framesRotate = useTransform(smooth, [0.2, 0.6], [0, 360]);
  const framesScale = useTransform(smooth, [0.22, 0.4], [0.85, 1]);

  const imgReveal = useTransform(smooth, [0.35, 0.5], [0, 1]);
  const imgClip = useTransform(smooth, [0.35, 0.55], ["circle(6% at 50% 50%)", "circle(80% at 50% 50%)"]);
  const imgScale = useTransform(smooth, [0.35, 0.55], [0.8, 1]);
  const imgY = useTransform(smooth, [0.35, 0.6], [100, -30]);
  const imgGlow = useTransform(smooth, [0.4, 0.55], [0, 0.6]);

  const scrollIndicatorOpacity = useTransform(smooth, [0, 0.08], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[400vh] md:h-[600vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0a0a0f]">
        {/* Video */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: videoOpacity, scale: videoScale }}>
          <video src="/welcome-video.mp4" muted playsInline preload="auto" className="w-full h-full object-cover" />
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.5)_70%,rgba(10,10,15,0.9)_100%)]" />

        {/* Dark Overlay */}
        <motion.div className="absolute inset-0 bg-[#0a0a0f] z-[2]" style={{ opacity: overlayOpacity }} />

        {/* Holographic Scanline */}
        <HolographicScanline progress={smooth} />

        {/* Frame Break - hidden on mobile for performance */}
        <motion.div
          className="absolute inset-0 z-[3] hidden md:flex items-center justify-center"
          style={{ opacity: framesOpacity, rotate: framesRotate, scale: framesScale }}
        >
          <div className="relative w-[80vw] max-w-[700px] aspect-video" style={{ perspective: "1200px" }}>
            {FRAMES.map((frame) => (
              <FramePiece key={frame.id} frame={frame} progress={smooth} videoSrc="/welcome-video.mp4" />
            ))}
          </div>
        </motion.div>

        {/* Dimensional Rift */}
        <DimensionalRift progress={smooth} />

        {/* Welcome Text — visible from start, fades out on scroll */}
        <motion.div
          className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center px-6"
          style={{ opacity: welcomeOpacity }}
        >
          <div className="mb-5">
            <span className="inline-block px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-400 tracking-[0.12em] uppercase">
              Welcome to my world
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-[-0.03em] mb-5">
            Shlok
            <span className="block text-gradient-sky">Sathwara</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-[500px] leading-relaxed">
            Aspiring Software Engineer crafting AI-powered solutions
          </p>
        </motion.div>

        {/* Gradient Waves */}
        <GradientWaves progress={smooth} />

        {/* Profile Image Reveal */}
        <motion.div
          className="absolute inset-0 z-[6] flex items-center justify-center"
          style={{ opacity: imgReveal }}
        >
          <motion.div
            className="relative w-[300px] h-[380px] sm:w-[340px] sm:h-[440px] md:w-[380px] md:h-[480px] rounded-2xl overflow-hidden"
            style={{ clipPath: imgClip, scale: imgScale, y: imgY }}
          >
            <img
              src="/profile-new.jpg"
              alt="Shlok Sathwara"
              className="w-full h-full object-cover object-top"
            />
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: "0 0 60px 20px rgba(99,102,241,0.3), 0 0 120px 40px rgba(14,165,233,0.15)",
                opacity: imgGlow,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </motion.div>
        </motion.div>

        {/* Holographic Profile Effects */}
        <HolographicProfile progress={smooth} />

        {/* Particle Dissolution Canvas */}
        <ParticleDissolution progress={smooth} />

        {/* Breathing Glow */}
        <BreathingGlow progress={smooth} />

        {/* Tech Stack Burst */}
        <SkillBurstSection progress={smooth} mouseX={mouseX} mouseY={mouseY} />

        {/* Stat Counters */}
        <StatCounters progress={smooth} />

        {/* Floating Badges */}
        <FloatingBadges progress={smooth} />

        {/* Keyboard Rain */}
        <KeyboardRain progress={smooth} />

        {/* Typewriter Name (replaces old Name + Tagline + GlitchFlicker) */}
        <TypewriterName progress={smooth} />

        {/* Hyperspace Effect (velocity-based) */}
        <HyperspaceEffect velocity={velocity} />

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[8] flex flex-col items-center gap-3"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-gray-500 text-xs tracking-[0.2em] uppercase">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-2 bg-indigo-400 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
