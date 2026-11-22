"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Download } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   SWAP POINTS
   - PORTRAIT_SRC: replace with a transparent cut-out PNG when ready.
   - HERO_WORD: the giant background word.
   - ACCENT: the hero accent token. The rest of the site keeps its
     indigo/sky palette; this warm accent is intentionally local.
   - PARTICLE_GRID: higher = denser particle portrait. 92 ≈ 6k dots
     on a 1440px screen. The mobile pass automatically thins by ~40%.
   ───────────────────────────────────────────────────────────── */
const PORTRAIT_SRC = "/profile-new.jpg";
const HERO_WORD = "DEVELOPER";
const ACCENT = "#ff5a1f";
const PARTICLE_GRID = 92;
const MAX_PARTICLES = 8000;
const ASSEMBLE_MS = 2600;
const REVEAL_START = 0.3;
const REVEAL_END = 0.7;
const REPEL_RADIUS = 92;
const REPEL_STRENGTH = 30;
const MAX_DPR = 2;

type Particle = {
  hx: number;
  hy: number;
  sx: number;
  sy: number;
  ox: number;
  oy: number;
  alpha: number;
  seed: number;
  swirl: number;
  size: number;
  color: string;
  delay: number;
};

const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const easeInOutCubic = (value: number) =>
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

/* 32 pre-computed brightness levels — no per-frame string allocation. */
const PALETTE = Array.from({ length: 32 }, (_, index) => {
  const lum = index / 31;
  return `rgba(255, ${Math.round(70 + 110 * lum)}, ${Math.round(
    20 + 40 * lum
  )}, ${(0.35 + lum * 0.65).toFixed(3)})`;
});

function createPlaceholder(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#d9c6b4");
  gradient.addColorStop(1, "#5a4a40");
  context.fillStyle = gradient;

  context.beginPath();
  context.ellipse(
    width / 2,
    height * 0.3,
    width * 0.21,
    height * 0.19,
    0,
    0,
    TAU
  );
  context.fill();

  context.beginPath();
  context.moveTo(width * 0.04, height);
  context.quadraticCurveTo(width * 0.12, height * 0.62, width / 2, height * 0.56);
  context.quadraticCurveTo(
    width * 0.88,
    height * 0.62,
    width * 0.96,
    height
  );
  context.fill();

  context.fillStyle = "rgba(0,0,0,0.25)";
  context.fillRect(width * 0.42, height * 0.49, width * 0.16, height * 0.1);

  return canvas;
}

/**
 * Samples the portrait at a low resolution and returns one particle per
 * visible sample inside a soft ellipse. Everything is pre-computed here so
 * the animation loop only reads numbers and calls fillRect.
 */
function buildParticles(
  photo: HTMLImageElement | HTMLCanvasElement,
  box: { x: number; y: number; w: number; h: number },
  isMobile: boolean
) {
  const baseStep = Math.max(4, Math.round(box.w / PARTICLE_GRID));
  const step = isMobile ? Math.max(5, Math.round(baseStep * 1.28)) : baseStep;
  const gw = Math.max(1, Math.round(box.w / step));
  const gh = Math.max(1, Math.round(box.h / step));

  const sample = document.createElement("canvas");
  sample.width = gw;
  sample.height = gh;
  const sampleContext = sample.getContext("2d");
  if (!sampleContext) return [] as Particle[];

  const scale = Math.max(gw / photo.width, gh / photo.height);
  const drawW = photo.width * scale;
  const drawH = photo.height * scale;
  sampleContext.drawImage(
    photo,
    (gw - drawW) / 2,
    (gh - drawH) / 2,
    drawW,
    drawH
  );

  const data = sampleContext.getImageData(0, 0, gw, gh).data;
  const particles: Particle[] = [];

  /* Ellipse matches the CSS mask on .hero-portrait-photo. */
  const centerX = gw * 0.5;
  const centerY = gh * 0.43;
  const radiusX = gw * 0.43;
  const radiusY = gh * 0.48;
  const clusterX = box.x + box.w * 0.5;
  const clusterY = box.y + box.h * 0.55;
  const clusterRadius = Math.min(box.w, box.h) * 0.18;
  const maxSwirl = Math.min(box.w, box.h) * 0.22;

  for (let y = 0; y < gh; y += 1) {
    for (let x = 0; x < gw; x += 1) {
      const index = (y * gw + x) * 4;
      if (data[index + 3] < 60) continue;

      const lum =
        (data[index] * 0.3 +
          data[index + 1] * 0.59 +
          data[index + 2] * 0.11) /
        255;
      if (lum < 0.05) continue;

      const nx = (x + 0.5 - centerX) / radiusX;
      const ny = (y + 0.5 - centerY) / radiusY;
      const distance = Math.sqrt(nx * nx + ny * ny);
      if (distance > 1) continue;

      const edge = 1 - smoothstep(0.78, 1, distance);
      if (edge < 0.04) continue;

      const angle = Math.random() * TAU;
      const radius = 10 + Math.random() * clusterRadius;
      const seed = Math.random();

      particles.push({
        hx: box.x + ((x + 0.5) / gw) * box.w,
        hy: box.y + ((y + 0.5) / gh) * box.h,
        sx: clusterX + Math.cos(angle) * radius,
        sy: clusterY + Math.sin(angle) * radius * 0.8,
        ox: 0,
        oy: 0,
        alpha: edge,
        seed,
        swirl: (Math.random() - 0.5) * maxSwirl,
        size: Math.max(1.5, step * 0.62),
        color: PALETTE[Math.round(lum * 31)],
        delay: seed * 0.55,
      });

      if (particles.length >= MAX_PARTICLES) return particles;
    }
  }

  return particles;
}

export default function ParticleHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const portrait = portraitRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !portrait || !canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    /* Reduced motion: CSS shows the final photo + orange word immediately. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage.style.setProperty("--rv", "1");
      stage.style.setProperty("--p", "0");
      stage.style.setProperty("--hint", "0");
      return;
    }

    let particles: Particle[] = [];
    let frame = 0;
    let running = false;
    let visible = true;
    let startTime = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let sectionTop = 0;
    let sectionHeight = 1;
    let pointerX = -9999;
    let pointerY = -9999;
    let lastReveal = -1;
    let lastProgress = -1;
    let lastHint = -1;
    let photo: HTMLImageElement | HTMLCanvasElement | null = null;

    const measureSection = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = Math.max(1, section.offsetHeight);
    };

    const build = () => {
      if (!photo) return;

      const stageRect = stage.getBoundingClientRect();
      const portraitRect = portrait.getBoundingClientRect();
      width = Math.max(1, stageRect.width);
      height = Math.max(1, stageRect.height);
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = buildParticles(
        photo,
        {
          x: portraitRect.left - stageRect.left,
          y: portraitRect.top - stageRect.top,
          w: portraitRect.width,
          h: portraitRect.height,
        },
        window.innerWidth < 640
      );

      startTime = performance.now();
      measureSection();
    };

    const draw = (now: number) => {
      if (!running) return;

      const progress = clamp(
        (window.scrollY - sectionTop) /
          Math.max(1, sectionHeight - window.innerHeight),
        0,
        1
      );
      const reveal = smoothstep(REVEAL_START, REVEAL_END, progress);
      const hint = progress > 0.04 ? 0 : 1;

      if (Math.abs(reveal - lastReveal) > 0.002) {
        stage.style.setProperty("--rv", reveal.toFixed(3));
        lastReveal = reveal;
      }
      if (Math.abs(progress - lastProgress) > 0.002) {
        stage.style.setProperty("--p", progress.toFixed(3));
        lastProgress = progress;
      }
      if (hint !== lastHint) {
        stage.style.setProperty("--hint", String(hint));
        lastHint = hint;
      }

      context.clearRect(0, 0, width, height);

      const assemble = clamp((now - startTime) / ASSEMBLE_MS, 0, 1);
      const particleAlpha = 1 - reveal;

      if (particleAlpha > 0.004) {
        for (let index = 0; index < particles.length; index += 1) {
          const particle = particles[index];
          const local = easeInOutCubic(
            clamp(assemble * 1.55 - particle.delay, 0, 1)
          );
          const settled = 1 - local;
          const swirl = Math.sin(local * Math.PI) * particle.swirl;
          const swirlAngle = particle.seed * TAU + local * 3.5;

          let x =
            particle.sx +
            (particle.hx - particle.sx) * local +
            Math.cos(swirlAngle) * swirl;
          let y =
            particle.sy +
            (particle.hy - particle.sy) * local +
            Math.sin(swirlAngle) * swirl;

          /* Living shimmer once the portrait is formed. */
          x += Math.sin(now / 620 + particle.seed * 20) * 0.6 * settled;
          y += Math.cos(now / 700 + particle.seed * 20) * 0.6 * settled;

          /* Pointer / touch repulsion with a soft spring back. */
          const dx = x - pointerX;
          const dy = y - pointerY;
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.001;

          if (distance < REPEL_RADIUS) {
            const force =
              ((REPEL_RADIUS - distance) / REPEL_RADIUS) * REPEL_STRENGTH;
            particle.ox += ((dx / distance) * force - particle.ox) * 0.12;
            particle.oy += ((dy / distance) * force - particle.oy) * 0.12;
          } else {
            particle.ox *= 0.88;
            particle.oy *= 0.88;
          }

          context.globalAlpha =
            particleAlpha * local * particle.alpha;
          context.fillStyle = particle.color;
          context.fillRect(
            x + particle.ox,
            y + particle.oy,
            particle.size,
            particle.size
          );
        }
      }

      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onResize = () => {
      build();
      if (visible && !document.hidden) start();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };

    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { rootMargin: "160px" }
    );
    intersectionObserver.observe(section);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(portrait);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      photo = image;
      build();
      if (visible && !document.hidden) start();
    };
    image.onerror = () => {
      photo = createPlaceholder(600, 800);
      build();
      if (visible && !document.hidden) start();
    };
    image.src = PORTRAIT_SRC;

    measureSection();

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Shlok Sathwara — full-stack and AI developer"
      className="particle-hero relative z-10 h-[300vh] bg-[#050506]"
    >
      <div
        ref={stageRef}
        className="particle-stage sticky top-0 h-screen overflow-hidden bg-[#050506]"
      >
        {/* Laptop backdrop — CSS placeholder. Swap this block for a photo
            of your laptop on a dark desk when you have one. */}
        <div aria-hidden className="hero-laptop">
          <div className="hero-laptop-glow" />
          <div className="hero-screen">
            <div className="hero-screen-glare" />
          </div>
          <div className="hero-keyboard" />
          <div className="hero-laptop-rim" />
          <div className="hero-noise" />
        </div>

        {/* Giant word — behind the particle portrait. */}
        <div aria-hidden className="hero-word">
          <span className="hero-word-inner">
            <span className="hero-word-base">{HERO_WORD}</span>
            <span className="hero-word-accent">{HERO_WORD}</span>
          </span>
        </div>

        {/* Full-stage particle canvas. The dots assemble into the portrait. */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
        />

        <div className="relative z-[3] flex h-full flex-col items-center justify-center px-6 pb-10 pt-24">
          <div ref={portraitRef} className="hero-portrait relative shrink-0">
            <img
              src={PORTRAIT_SRC}
              alt="Shlok Sathwara"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="hero-portrait-photo absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="hero-caption">
            <p className="hero-eyebrow">
              <span className="hero-live-dot" />
              Shlok Sathwara · Available for 2027 roles
            </p>

            <h1 className="hero-title">Full-stack &amp; AI developer</h1>

            <p className="hero-subtitle">
              CS engineering student · research · building products
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <a href="#projects" className="hero-cta hero-cta-primary">
                View projects
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href="#contact" className="hero-cta hero-cta-secondary">
                Contact
              </a>
              <a
                href="/Resume_2608.pdf"
                download
                className="hero-cta hero-cta-ghost"
              >
                <Download className="h-3.5 w-3.5" />
                Résumé
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden className="hero-hint">
          <span>Scroll</span>
          <span className="hero-hint-line" />
        </div>

        <div aria-hidden className="hero-progress">
          <span />
        </div>
      </div>
    </section>
  );
}
