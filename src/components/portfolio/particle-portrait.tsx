"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ═══════════════════════════════════════════════════════════════════════════
   Particle Portrait — Act 1
   Pixel-Perfect Particle Matrix of Shlok Sathwara (Extracted Cutout Photo).
   Every particle samples the EXACT pixel coordinates and RGB colors of Shlok's
   cutout, strictly bounded within the true silhouette (no stray particles).
   The giant background word morphs across scroll:
   DEVELOPER → ENGINEER → CREATOR → AI ARCHITECT
   ═══════════════════════════════════════════════════════════════════════════ */

export const WORDS = ["DEVELOPER", "ENGINEER", "CREATOR", "AI ARCHITECT"] as const;

export const PORTRAIT_CFG = {
  stageHeightVh: 320,
  gridSize: 3, // High density for razor-sharp definition
  dotRadius: 1.8,
  maxParticles: 9500,
  mobileMaxParticles: 4200,
  assembleRange: [0.06, 0.44] as [number, number],
  dissolveRange: [0.56, 0.88] as [number, number],
  photoReveal: [0.60, 0.90] as [number, number],
  src: "/portrait-cutout.webp",
};

type Dot = {
  hx: number;
  hy: number;
  sx: number;
  sy: number;
  r: number;
  g: number;
  b: number;
  d: number;
  lum: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease3 = (t: number) => t * t * (3 - 2 * t);

export default function ParticlePortrait() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const dots = useRef<Dot[]>([]);
  const prog = useRef(0);
  const rafId = useRef(0);
  const [currentWord, setCurrentWord] = useState<string>("DEVELOPER");
  const [portraitBox, setPortraitBox] = useState({
    left: 32,
    top: 14,
    width: 36,
    height: 72,
  });

  const reduced = useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  /* ── Sample ONLY Shlok from the cutout image with EXACT image pixel colors ── */
  const buildDots = useCallback((img: HTMLImageElement) => {
    const sc = document.createElement("canvas");
    const ctx = sc.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const mx = 200;
    const ar = img.naturalWidth / img.naturalHeight;
    sc.width = ar >= 1 ? mx : Math.round(mx * ar);
    sc.height = ar >= 1 ? Math.round(mx / ar) : mx;
    ctx.drawImage(img, 0, 0, sc.width, sc.height);
    const px = ctx.getImageData(0, 0, sc.width, sc.height).data;

    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const mob = viewW < 768;
    const cap = mob ? PORTRAIT_CFG.mobileMaxParticles : PORTRAIT_CFG.maxParticles;
    const g = PORTRAIT_CFG.gridSize;

    // Portrait box sizing matching 1:1 on both canvas and DOM
    const targetH = Math.min(viewH * (mob ? 0.65 : 0.74), viewW * (mob ? 1.05 : 0.75));
    const targetW = targetH * ar;
    const wf = targetW / viewW;
    const hf = targetH / viewH;
    const ox = (1 - wf) / 2;
    const oy = (1 - hf) / 2 + 0.02;

    setPortraitBox({
      left: ox * 100,
      top: oy * 100,
      width: wf * 100,
      height: hf * 100,
    });

    const out: Dot[] = [];

    for (let y = 0; y < sc.height && out.length < cap; y += g) {
      for (let x = 0; x < sc.width && out.length < cap; x += g) {
        const i = (y * sc.width + x) * 4;
        const alpha = px[i + 3];

        // STRICT threshold: ONLY solid pixels of Shlok's body, face and hair!
        // Never samples fringe or transparent pixels so dots strictly stay within the border!
        if (alpha < 110) continue;

        const red = px[i];
        const green = px[i + 1];
        const blue = px[i + 2];
        const lum = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
        if (lum < 0.035) continue;

        // Exact normalized target position corresponding 1:1 to the image
        const hx = ox + (x / sc.width) * wf;
        const hy = oy + (y / sc.height) * hf;

        const ang = Math.random() * Math.PI * 2;
        const dist = 0.15 + Math.random() * 0.45;

        out.push({
          hx,
          hy,
          sx: 0.5 + Math.cos(ang) * dist,
          sy: 0.95 + Math.sin(ang) * (dist * 0.4),
          // EXACT TRUE IMAGE PIXEL COLORS
          r: red,
          g: green,
          b: blue,
          d: Math.random() * 0.22,
          lum,
        });
      }
    }
    dots.current = out;
  }, []);

  /* ── Load image ── */
  useEffect(() => {
    if (reduced) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = PORTRAIT_CFG.src;
    img.onload = () => buildDots(img);
  }, [buildDots, reduced]);

  /* ── Canvas Render Loop ── */
  useEffect(() => {
    if (reduced) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = c.width;
      const h = c.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, w, h);

      const p = prog.current;
      const ds = dots.current;
      if (ds.length === 0) {
        rafId.current = requestAnimationFrame(draw);
        return;
      }

      const [aS, aE] = PORTRAIT_CFG.assembleRange;
      const [dS, dE] = PORTRAIT_CFG.dissolveRange;
      const scale = (w / dpr) / 1440;

      for (let i = 0; i < ds.length; i++) {
        const d = ds[i];
        const rawT = clamp01((p - aS - d.d) / (aE - aS));
        const t = ease3(rawT);
        const diss = clamp01((p - dS) / (dE - dS));
        const alpha = Math.min(1, rawT * 2.6) * (1 - diss);
        if (alpha < 0.01) continue;

        // Clean linear convergence to EXACT pixel coordinate
        // ZERO SWIRL and ZERO JITTER ensuring every dot stays 100% within the true border!
        const cx = lerp(d.sx, d.hx, t);
        const cy = lerp(d.sy, d.hy, t);

        const pxX = cx * (w / dpr);
        const pxY = cy * (h / dpr);
        const sz = Math.max(1.1, PORTRAIT_CFG.dotRadius * scale * (0.8 + t * 0.4));

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = alpha;

        // In flight: cyber cyan energy glow; as it locks into the body: EXACT image pixel colors!
        const blendR = Math.round(lerp(56, d.r, t));
        const blendG = Math.round(lerp(189, d.g, t));
        const blendB = Math.round(lerp(248, d.b, t));

        ctx.fillStyle = `rgb(${blendR},${blendG},${blendB})`;
        if (t < 0.85) {
          ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
          ctx.shadowBlur = sz * 1.5 * (1 - t);
        }

        ctx.beginPath();
        ctx.arc(pxX, pxY, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  /* ── ScrollTrigger for word morphing & color transition ── */
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = stageRef.current;
    const tx = textRef.current;
    const ph = photoRef.current;
    if (!st || !tx || !ph) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: st,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate(self) {
          const p = self.progress;
          prog.current = p;

          // Word Cycling: DEVELOPER → ENGINEER → CREATOR → AI ARCHITECT
          let wordIdx = 0;
          if (p >= 0.75) wordIdx = 3;
          else if (p >= 0.5) wordIdx = 2;
          else if (p >= 0.25) wordIdx = 1;
          const nextWord = WORDS[wordIdx];
          setCurrentWord((prev) => (prev === nextWord ? prev : nextWord));

          // Color transition: dark charcoal (#20242e) → bright cyber cyan (#38bdf8)
          const cyanT = clamp01((p - 0.12) / 0.5);
          const cr = Math.round(lerp(32, 56, cyanT));
          const cg = Math.round(lerp(36, 189, cyanT));
          const cb = Math.round(lerp(46, 248, cyanT));
          tx.style.color = `rgb(${cr},${cg},${cb})`;
          tx.style.textShadow =
            cyanT > 0.4 ? `0 0 ${Math.round(cyanT * 32)}px rgba(56, 189, 248, 0.45)` : "none";

          // Photo opacity ramp: reveals seamlessly at the exact same position
          const [pRStart, pREnd] = PORTRAIT_CFG.photoReveal;
          const pP = clamp01((p - pRStart) / (pREnd - pRStart));
          ph.style.opacity = String(pP);
        },
      });
    }, st);

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section
        className="particle-portrait-stage"
        style={{ height: "auto" }}
        aria-label="Developer portrait"
      >
        <div className="particle-portrait-sticky" style={{ position: "relative" }}>
          <h2 className="particle-portrait-word" style={{ color: "#38bdf8" }} aria-hidden>
            DEVELOPER
          </h2>
          <div
            className="particle-portrait-photo"
            style={{
              position: "relative",
              opacity: 1,
              width: "min(400px, 80vw)",
            }}
          >
            <img
              src={PORTRAIT_CFG.src}
              alt="Shlok Sathwara"
              style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={stageRef}
      className="particle-portrait-stage"
      style={{ height: `${PORTRAIT_CFG.stageHeightVh}vh` }}
      aria-label="Developer title and portrait reveal"
    >
      <div className="particle-portrait-sticky">
        {/* Morphing Giant Word */}
        <h2 ref={textRef} className="particle-portrait-word" aria-hidden>
          {currentWord}
        </h2>

        {/* Precision Pixel Particles Canvas */}
        <canvas ref={canvasRef} className="particle-portrait-canvas" aria-hidden />

        {/* Clean Cutout Photo (Positioned 100% identically to particles) */}
        <div
          ref={photoRef}
          className="particle-portrait-photo"
          style={{
            position: "absolute",
            left: `${portraitBox.left}%`,
            top: `${portraitBox.top}%`,
            width: `${portraitBox.width}%`,
            height: `${portraitBox.height}%`,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={PORTRAIT_CFG.src}
            alt="Shlok Sathwara — Developer"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}
