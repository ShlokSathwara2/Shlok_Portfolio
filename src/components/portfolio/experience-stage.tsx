"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { TIMELINE } from "./timeline";
import { aboutPanels, heroPhrases, heroStats, socialLinks } from "./data";
import { SocialIcon, useMediaQuery, usePrefersReducedMotion } from "./primitives";
import { ParkBackdrop } from "./park-backdrop";
import HeroFallback from "./hero-fallback";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="hero-scene hero-scene-loading">
      <ParkBackdrop />
      <div className="scene-loading-label">
        <span className="scene-loading-dot" />
        Loading the scene
      </div>
    </div>
  ),
});

type PointerState = {
  x: number;
  y: number;
  lastMove: number;
  active: boolean;
};

const KEY_ROWS = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "delete"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "control", "option", "command", "", "command", "option", "←", "↑", "↓", "→"],
];

function Typewriter({
  phrases,
  reduced,
}: {
  phrases: readonly string[];
  reduced: boolean;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (reduced) return;

    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phrase];
      if (!deleting) {
        char += 1;
        setText(current.slice(0, char));
        if (char >= current.length) {
          deleting = true;
          timeout = setTimeout(tick, 1700);
          return;
        }
      } else {
        char -= 1;
        setText(current.slice(0, char));
        if (char <= 0) {
          deleting = false;
          phrase = (phrase + 1) % phrases.length;
        }
      }
      timeout = setTimeout(tick, deleting ? 26 : 54);
    };

    timeout = setTimeout(tick, 650);
    return () => clearTimeout(timeout);
  }, [phrases, reduced]);

  const display = reduced ? phrases[0] : text;

  return (
    <span className="hero-type-text">
      {display}
      {reduced ? null : (
        <span className="hero-caret" aria-hidden>
          |
        </span>
      )}
    </span>
  );
}

function OrbitBadges({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const [badgeIndex, setBadgeIndex] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(0);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const p = progressRef.current;
      // Orbit phase: 0.04 to 0.40
      if (p >= 0.04 && p < 0.16) {
        setBadgeIndex(1);
        const t = p < 0.10 ? (p - 0.04) / 0.06 : (0.16 - p) / 0.06;
        setOpacity(Math.max(0, Math.min(1, t)));
      } else if (p >= 0.16 && p < 0.28) {
        setBadgeIndex(2);
        const t = p < 0.22 ? (p - 0.16) / 0.06 : (0.28 - p) / 0.06;
        setOpacity(Math.max(0, Math.min(1, t)));
      } else if (p >= 0.28 && p < 0.40) {
        setBadgeIndex(3);
        const t = p < 0.34 ? (p - 0.28) / 0.06 : (0.40 - p) / 0.06;
        setOpacity(Math.max(0, Math.min(1, t)));
      } else {
        setOpacity(0);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [progressRef]);

  if (opacity <= 0.01) return null;

  return (
    <div
      className="orbit-badge-container"
      style={{
        opacity,
        transform: `translate3d(0, ${Math.round((1 - opacity) * 16)}px, 0)`,
      }}
      aria-hidden
    >
      {badgeIndex === 1 && (
        <div className="orbit-badge orbit-badge-left">
          <span className="orbit-badge-dot" />
          <div className="orbit-badge-content">
            <span className="orbit-badge-kicker">01 / CAPABILITY</span>
            <strong className="orbit-badge-title">AI &amp; Full-Stack Architect</strong>
            <p className="orbit-badge-sub">Next.js • FastAPI • Gemini API • PyTorch • RAG</p>
          </div>
        </div>
      )}
      {badgeIndex === 2 && (
        <div className="orbit-badge orbit-badge-center">
          <span className="orbit-badge-dot" />
          <div className="orbit-badge-content">
            <span className="orbit-badge-kicker">02 / LEADERSHIP &amp; RESEARCH</span>
            <strong className="orbit-badge-title">Linde Engineering Team Lead</strong>
            <p className="orbit-badge-sub">Published ML Cloud Security Author • Springer</p>
          </div>
        </div>
      )}
      {badgeIndex === 3 && (
        <div className="orbit-badge orbit-badge-right">
          <span className="orbit-badge-dot" />
          <div className="orbit-badge-content">
            <span className="orbit-badge-kicker">03 / EXCELLENCE</span>
            <strong className="orbit-badge-title">9.44 CGPA — SRMIST</strong>
            <p className="orbit-badge-sub">Top 1% Rank • DSA in Java • Cloud Systems</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScrollCounter({
  target,
  progressRef,
  reduced,
}: {
  target: string;
  progressRef?: React.MutableRefObject<number>;
  reduced: boolean;
}) {
  const [display, setDisplay] = useState(reduced ? target : "0");
  const isFloat = target.includes(".");
  const hasPlus = target.includes("+");
  const numTarget = parseFloat(target);

  useEffect(() => {
    if (reduced || !progressRef) {
      setDisplay(target);
      return;
    }

    let rafId: number;
    let currentVal = 0;

    const tick = () => {
      // Numbers count up dynamically as the user scrolls into the hero reveal (progress 0.36 to 0.54)
      const p = progressRef.current;
      const t = Math.max(0, Math.min(1, (p - 0.35) / 0.18));
      const easeT = t * t * (3 - 2 * t);
      const targetVal = numTarget * easeT;

      currentVal += (targetVal - currentVal) * 0.16;

      if (isFloat) {
        setDisplay(currentVal.toFixed(2));
      } else if (hasPlus) {
        const val = Math.round(currentVal);
        setDisplay(val >= numTarget ? `${numTarget}+` : `${val}+`);
      } else {
        setDisplay(String(Math.round(currentVal)));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasPlus, isFloat, numTarget, progressRef, reduced, target]);

  return <strong>{display}</strong>;
}

function HeroCopy({
  reduced,
  copyRef,
  progressRef,
}: {
  reduced: boolean;
  copyRef?: React.RefObject<HTMLDivElement | null>;
  progressRef?: React.MutableRefObject<number>;
}) {
  return (
    <div className="hero-copy" ref={copyRef}>
      <p className="hero-kicker hero-copy-fade">
        <span className="hero-live-dot" />
        Hi, I&apos;m Shlok
      </p>

      <h1 className="hero-title">
        <span className="hero-title-line">
          <span className="hero-word">Software</span>{" "}
          <span className="hero-word">Engineer</span>
        </span>
        <span className="hero-title-line">
          <span className="hero-word hero-amp">&amp;</span>{" "}
          <span className="hero-word">AI</span>{" "}
          <span className="hero-word">Developer</span>
        </span>
      </h1>

      <p className="hero-tagline hero-copy-fade">
        crafting interfaces that feel alive.
      </p>

      <p className="hero-type hero-copy-fade" aria-hidden>
        <span className="hero-type-prefix">I build</span>{" "}
        <Typewriter phrases={heroPhrases} reduced={reduced} />
      </p>

      <ul className="sr-only">
        {heroPhrases.map((phrase) => (
          <li key={phrase}>{phrase}</li>
        ))}
      </ul>

      <div className="hero-actions hero-copy-fade">
        <a href="#projects" className="btn btn-primary">
          View Work
          <ArrowUpRight aria-hidden />
        </a>
        <a href="#contact" className="btn btn-ghost">
          Let&apos;s Talk
        </a>
      </div>

      <div className="hero-meta hero-copy-fade">
        <span className="hero-meta-item">
          <MapPin aria-hidden />
          Vadodara, India
        </span>
        <span className="hero-meta-divider" />
        <span className="hero-meta-item">
          <Sparkles aria-hidden />
          Open to 2027 roles
        </span>
      </div>

      <div className="hero-stats hero-copy-fade">
        {heroStats.map((stat) => (
          <div className="hero-stat" key={stat.label}>
            <ScrollCounter
              target={stat.value}
              progressRef={progressRef}
              reduced={reduced}
            />
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="hero-socials hero-copy-fade">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="hero-social"
          >
            <SocialIcon name={social.icon} />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ExperienceStage() {
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const stageRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const careerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    lastMove: 0,
    active: false,
  });
  const progressRef = useRef(0);
  const startRef = useRef({ x: 0, y: 0, sx: 1, sy: 1 });
  const sceneOnRef = useRef(true);

  const [skipZoom, setSkipZoom] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [debug, setDebug] = useState(false);
  const [inView, setInView] = useState(false);
  const [sceneOn, setSceneOn] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setDebug(params.get("debug") === "1");

      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setWebgl(Boolean(gl));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.01 }
    );
    observer.observe(sticky);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReduced) return;

    const onMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current.lastMove = performance.now();
      pointerRef.current.active = true;
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;

    let frame = 0;
    let frames = 0;
    let started = 0;
    let measuring = false;
    let delay = 0;

    const tick = (now: number) => {
      if (!measuring) {
        measuring = true;
        started = now;
        frames = 0;
      }
      frames += 1;
      const elapsed = now - started;
      if (elapsed >= 1400) {
        const fps = frames / (elapsed / 1000);
        if (fps < 40) setSkipZoom(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    delay = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 1600);

    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(frame);
    };
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const stage = stageRef.current;
    const shell = shellRef.current;
    const copy = copyRef.current;
    const panels = panelsRef.current;
    const career = careerRef.current;
    const room = roomRef.current;
    const laptop = laptopRef.current;
    const bezel = bezelRef.current;
    if (!stage || !shell || !copy || !panels || !career || !bezel) return;

    const copyItems = gsap.utils.toArray<HTMLElement>(
      ".hero-word, .hero-copy-fade",
      copy
    );
    const floatTag = gsap.utils.toArray<HTMLElement>(".hero-float-tag");

    const measure = () => {
      const sticky = stickyRef.current;
      const screen = bezelRef.current;
      if (!sticky || !screen) return;
      const stickyRect = sticky.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();
      const { x, y, w, h } = TIMELINE.zoom.screenRect;
      const left = screenRect.left - stickyRect.left + (screenRect.width * x) / 100;
      const top = screenRect.top - stickyRect.top + (screenRect.height * y) / 100;
      const width = (screenRect.width * w) / 100;
      const height = (screenRect.height * h) / 100;
      startRef.current = {
        x: left,
        y: top,
        sx: width / Math.max(1, stickyRect.width),
        sy: height / Math.max(1, stickyRect.height),
      };
    };

    const applyZoom = (t: number) => {
      const shellNode = shellRef.current;
      if (!shellNode) return;
      const eased = gsap.parseEase(TIMELINE.zoom.ease)(t);
      const start = startRef.current;
      const x = start.x * (1 - eased);
      const y = start.y * (1 - eased);
      const sx = start.sx + (1 - start.sx) * eased;
      const sy = start.sy + (1 - start.sy) * eased;
      shellNode.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy})`;
    };

    const ctx = gsap.context(() => {
      measure();
      gsap.set(copy, { autoAlpha: 1 });
      gsap.set(panels, { autoAlpha: 0, y: 36 });
      gsap.set(career, { autoAlpha: 0, scale: 0.94 });
      gsap.set(room, { autoAlpha: 1 });
      gsap.set(laptop, { autoAlpha: 1 });

      if (skipZoom) {
        shell.style.transform = "none";
        gsap.set([room, laptop], { autoAlpha: 0 });
        gsap.set(copyItems, { autoAlpha: 1, y: 0 });
        gsap.set(floatTag, { autoAlpha: 1, y: 0 });
      } else {
        applyZoom(0);
        gsap.set(copyItems, { autoAlpha: 0, y: 24 });
        gsap.set(floatTag, { autoAlpha: 0, y: 20 });
      }

      const zoomProxy = { t: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            const on = self.progress < TIMELINE.fade.end;
            if (on !== sceneOnRef.current) {
              sceneOnRef.current = on;
              setSceneOn(on);
            }
          },
          onRefresh: () => {
            measure();
            if (!skipZoom) applyZoom(zoomProxy.t);
          },
        },
      });

      if (!skipZoom) {
        tl.to(
          zoomProxy,
          {
            t: 1,
            duration: TIMELINE.zoom.end,
            ease: TIMELINE.zoom.ease,
            onUpdate: () => applyZoom(zoomProxy.t),
          },
          0
        );
        tl.to(
          [room, laptop],
          {
            autoAlpha: 0,
            duration: TIMELINE.zoom.end - TIMELINE.zoom.fadeStart,
            ease: "power2.inOut",
          },
          TIMELINE.zoom.fadeStart
        );
        tl.to(
          copyItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.04,
            stagger: TIMELINE.hero.stagger,
            ease: "power2.out",
          },
          TIMELINE.hero.copyIn
        );
        tl.to(
          floatTag,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.04,
            ease: "power2.out",
          },
          TIMELINE.hero.tagIn
        );
        tl.to(
          floatTag,
          {
            autoAlpha: 0,
            y: -12,
            duration: 0.04,
            ease: "power2.in",
          },
          TIMELINE.hero.copyOut
        );
        tl.to(
          copy,
          {
            autoAlpha: 0,
            y: -24,
            duration: 0.04,
            ease: "power2.in",
          },
          TIMELINE.hero.copyOut
        );
      } else {
        tl.to(
          copyItems,
          {
            autoAlpha: 0,
            y: -20,
            duration: 0.04,
            ease: "power2.in",
          },
          TIMELINE.hero.copyOut
        );
        tl.to(
          floatTag,
          {
            autoAlpha: 0,
            y: -12,
            duration: 0.04,
            ease: "power2.in",
          },
          TIMELINE.hero.copyOut
        );
      }

      tl.to(
        panels,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.08,
          ease: "power2.out",
        },
        TIMELINE.panels.in
      );
      tl.to(
        panels,
        {
          autoAlpha: 0,
          y: -30,
          duration: 0.06,
          ease: "power2.in",
        },
        TIMELINE.panels.out
      );
      tl.to(
        career,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.1,
          ease: "power2.out",
        },
        TIMELINE.career.in
      );
      tl.to(
        career,
        {
          autoAlpha: 0,
          duration: 0.08,
          ease: "power2.in",
        },
        TIMELINE.career.out
      );
      tl.to(
        shell,
        {
          autoAlpha: 0,
          duration: TIMELINE.fade.end - TIMELINE.fade.start,
          ease: "power2.inOut",
        },
        TIMELINE.fade.start
      );
    }, stage);

    const onResize = () => {
      measure();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    const settle = window.setTimeout(() => {
      measure();
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [prefersReduced, skipZoom]);

  if (prefersReduced) {
    return (
      <section
        id="hero"
        className="experience-stage is-reduced"
        aria-label="Shlok Sathwara — software engineer and AI developer"
      >
        <div className="experience-sticky is-reduced" ref={stickyRef}>
          <div className="hero-shell is-static">
            <div className="hero-scene-layer" aria-hidden>
              {webgl ? (
                <HeroScene
                  pointerRef={pointerRef}
                  progressRef={progressRef}
                  reducedMotion
                  active={inView}
                  mobile={isMobile}
                />
              ) : (
                <HeroFallback pointerRef={pointerRef} reducedMotion />
              )}
            </div>
            <div className="hero-scrim" aria-hidden />
            <HeroCopy reduced />
            <div className="hero-float-tag" aria-hidden>
              <span className="hero-float-dot" />
              open to 2027 roles
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      ref={stageRef}
      className={`experience-stage${skipZoom ? " skip-zoom" : ""}`}
      style={{ height: `${TIMELINE.stage.heightVh}vh` }}
      aria-label="Shlok Sathwara — software engineer and AI developer"
    >
      <div className="experience-sticky" ref={stickyRef}>
        <div className="room" ref={roomRef} aria-hidden>
          <div className="room-wall" />
          <div className="lamp">
            <span className="lamp-glow" />
            <span className="lamp-shade" />
          </div>
          <div className="room-vignette" />
        </div>

        <div className="laptop-wrap" ref={laptopRef} aria-hidden>
          <div className="laptop">
            <div className="laptop-bezel" ref={bezelRef}>
              <div className="bezel-piece bezel-top">
                <span className="laptop-camera" />
              </div>
              <div className="bezel-piece bezel-bottom">
                <span className="laptop-brand">SHLOK</span>
              </div>
              <div className="bezel-piece bezel-left" />
              <div className="bezel-piece bezel-right" />
              <div className="screen-glass" />
              {debug ? (
                <div
                  className="zoom-debug"
                  style={{
                    left: `${TIMELINE.zoom.screenRect.x}%`,
                    top: `${TIMELINE.zoom.screenRect.y}%`,
                    width: `${TIMELINE.zoom.screenRect.w}%`,
                    height: `${TIMELINE.zoom.screenRect.h}%`,
                  }}
                />
              ) : null}
            </div>

            <div className="laptop-deck">
              <div className="keyboard">
                {KEY_ROWS.map((row, rowIndex) => (
                  <div className="key-row" key={rowIndex}>
                    {row.map((key, keyIndex) => (
                      <span
                        key={`${rowIndex}-${keyIndex}-${key}`}
                        className={`key${key === "" ? " key-space" : ""}${
                          key === "return" || key === "delete" || key === "shift"
                            ? " key-wide"
                            : ""
                        }`}
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="trackpad" />
              <span className="deck-label">SHLOKBOOK PRO</span>
            </div>
          </div>
        </div>

        <div className="hero-shell" ref={shellRef}>
          <div className="hero-scene-layer" aria-hidden>
            {webgl ? (
              <HeroScene
                pointerRef={pointerRef}
                progressRef={progressRef}
                reducedMotion={false}
                active={inView && sceneOn}
                mobile={isMobile}
              />
            ) : (
              <HeroFallback pointerRef={pointerRef} reducedMotion={false} />
            )}
          </div>
          <div className="hero-scrim" aria-hidden />
          <OrbitBadges progressRef={progressRef} />
          <HeroCopy
            reduced={false}
            copyRef={copyRef}
            progressRef={progressRef}
          />
          <div className="hero-float-tag hero-copy-fade" aria-hidden>
            <span className="hero-float-dot" />
            open to 2027 roles
          </div>
        </div>

        <div className="hero-panels" ref={panelsRef}>
          <div className="hero-panels-head">
            <p className="section-kicker">
              WHAT I DO
            </p>
            <p className="hero-panels-note">
              Three ways I make products feel alive.
            </p>
          </div>
          <div className="hero-panels-grid">
            {aboutPanels.map((panel) => (
              <article className="hero-panel" key={panel.title}>
                <span className="hero-panel-index">{panel.label}</span>
                <h3>{panel.title}</h3>
                <p>{panel.body}</p>
                <div className="chip-row">
                  {panel.chips.map((chip) => (
                    <span className="chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-career" ref={careerRef}>
          <p className="section-kicker">
            THE NEXT CHAPTER
          </p>
          <h2 className="hero-career-title">
            MY CAREER
            <br />
            &amp; EXPERIENCE
          </h2>
          <p className="hero-career-copy">
            From leading a helpdesk redesign at Linde to shipping AI products —
            here is the work behind the pixels.
          </p>
          <a href="#experience" className="btn btn-primary">
            Explore the timeline
            <ArrowUpRight aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
