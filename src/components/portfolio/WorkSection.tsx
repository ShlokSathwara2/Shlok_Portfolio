"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { projects, type ProofTarget } from "./projects-data";
import { useMediaQuery, usePrefersReducedMotion } from "./primitives";
import { useWorkScroll } from "./useWorkScroll";
import ProjectOverlay from "./ProjectOverlay";
import WorkFallbackCarousel from "./WorkFallbackCarousel";
import ProofModal from "../ui/proof-modal";

const WorkScene = dynamic(() => import("./WorkScene"), {
  ssr: false,
  loading: () => (
    <div className="work-scene-loading" aria-hidden>
      <span className="scene-loading-dot" />
      <span>Calibrating orbit…</span>
    </div>
  ),
});

function detectDeviceFallback(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return true;
    const lose = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_lose_context"
    );
    lose?.loseContext();
  } catch {
    return true;
  }

  const cores =
    typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 8;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 2 || memory <= 2;
}

let deviceFallbackCache: boolean | null = null;

function getDeviceFallbackSnapshot() {
  if (typeof window === "undefined") return false;
  if (deviceFallbackCache === null) {
    deviceFallbackCache = detectDeviceFallback();
  }
  return deviceFallbackCache;
}

function subscribeNoop() {
  return () => {};
}

export default function WorkSection() {
  const isMobile = useMediaQuery("(max-width: 899px)");
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const reducedMotion = usePrefersReducedMotion();
  const [proof, setProof] = useState<ProofTarget | null>(null);
  const [fpsFallback, setFpsFallback] = useState(false);

  const deviceFallback = useSyncExternalStore(
    subscribeNoop,
    getDeviceFallbackSnapshot,
    () => false
  );

  const useFallback = false;

  const {
    sectionRef,
    stageRef,
    targetProgressRef,
    suppressClickRef,
    activeIndex,
    isNearViewport,
    selectProject,
  } = useWorkScroll({
    total: projects.length,
    enabled: true,
    reducedMotion,
  });

  const handleLowFps = useCallback(() => {}, []);
  const handleProof = useCallback((target: ProofTarget) => setProof(target), []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-title"
      className={`work-section${useFallback ? " is-lite" : ""}${
        deviceFallback ? " is-device-fallback" : ""
      }`}
    >
      <div className="work-sticky" ref={stageRef}>
        <div className="work-atmosphere" aria-hidden />

        <header className="projects-head work-head">
          <div>
            <p className="section-kicker">
              <span className="section-index">05</span>
              SELECTED WORK
            </p>
            <h2 className="display" id="projects-title">
              MY WORK
            </h2>
          </div>
          <div className="projects-head-side">
            <p>
              {projects.length} selected builds · 2024—2026
              <br />
              AI products, full-stack apps, and experiments.
            </p>
            <span className="projects-hint">
              {useFallback
                ? "Swipe to explore"
                : "Scroll to orbit · Drag · ← →"}
              <ArrowRight aria-hidden />
            </span>
          </div>
        </header>

        {useFallback ? (
          <WorkFallbackCarousel
            projects={projects}
            activeIndex={activeIndex}
            reducedMotion={reducedMotion}
            suppressClickRef={suppressClickRef}
            onSelect={selectProject}
            onOpenProof={handleProof}
          />
        ) : (
          <>
            <div className="work-canvas-wrap">
              <WorkScene
                projects={projects}
                activeIndex={activeIndex}
                targetProgressRef={targetProgressRef}
                suppressClickRef={suppressClickRef}
                isMobile={isMobile}
                isDesktop={isDesktop}
                reducedMotion={reducedMotion}
                active={isNearViewport}
                onSelectCard={selectProject}
                onLowFpsFallback={handleLowFps}
              />
            </div>

            <ProjectOverlay
              projects={projects}
              activeIndex={activeIndex}
              reducedMotion={reducedMotion}
              onSelect={selectProject}
              onOpenProof={handleProof}
            />
          </>
        )}

        <div className="projects-progress work-progress" aria-hidden>
          <span className="projects-progress-fill" />
        </div>

        <p className="work-live-status sr-only" aria-live="polite">
          Project {String(activeIndex + 1).padStart(2, "0")} of{" "}
          {projects.length}: {projects[activeIndex]?.title}
        </p>
      </div>

      {/* Real DOM content for screen readers, crawlers, and no-JS readers */}
      <div className="sr-only">
        <h3>All {projects.length} Projects</h3>
        <ul>
          {projects.map((project) => (
            <li key={project.title}>
              <h4>{project.title}</h4>
              <p>{project.description}</p>
              <p>{project.stack.join(", ")}</p>
              {project.link ? (
                <a href={project.link} tabIndex={-1}>
                  Live: {project.title}
                </a>
              ) : null}
              {project.github ? (
                <a href={project.github} tabIndex={-1}>
                  Code: {project.title}
                </a>
              ) : null}
              {project.apk ? (
                <a href={project.apk} tabIndex={-1}>
                  Download APK: {project.title}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {proof ? (
        <ProofModal
          open
          onClose={() => setProof(null)}
          title={proof.title}
          type={proof.type}
          src={proof.src}
        />
      ) : null}
    </section>
  );
}
