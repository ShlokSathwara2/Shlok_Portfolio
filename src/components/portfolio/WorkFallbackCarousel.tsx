"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
} from "lucide-react";
import type { ProjectItem, ProofTarget } from "./projects-data";
import { GithubIcon } from "./primitives";

type WorkFallbackCarouselProps = {
  projects: ProjectItem[];
  activeIndex: number;
  reducedMotion: boolean;
  suppressClickRef: React.RefObject<boolean>;
  onSelect: (index: number) => void;
  onOpenProof: (proof: ProofTarget) => void;
};

const GAP = 22;

/**
 * WebGL-free version of the orbit. It keeps the pinned section and the same
 * scroll/drag controller, but swaps the canvas for a large glass card with its
 * neighbours peeking in from the sides. No three.js is loaded at all.
 */
export default function WorkFallbackCarousel({
  projects,
  activeIndex,
  reducedMotion,
  suppressClickRef,
  onSelect,
  onOpenProof,
}: WorkFallbackCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ width: 0, cardWidth: 380 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const width = viewport.clientWidth;
      const cardWidth = Math.min(
        Math.max(280, width * 0.84),
        width >= 1024 ? 460 : 420
      );
      setLayout({ width, cardWidth });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const x =
    layout.width / 2 -
    layout.cardWidth / 2 -
    activeIndex * (layout.cardWidth + GAP);

  return (
    <div className="work-lite" ref={viewportRef}>
      <div className="work-lite-viewport">
        <motion.div
          className="work-lite-track"
          initial={false}
          animate={{ x }}
          transition={{
            duration: reducedMotion ? 0.12 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {projects.map((project, index) => {
            const active = index === activeIndex;
            return (
              <article
                key={project.title}
                className={`work-lite-card${active ? " is-active" : ""}`}
                style={{ width: layout.cardWidth }}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  if (!active) onSelect(index);
                }}
              >
                <div className="work-lite-visual">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.imageAlt ?? project.title}
                      fill
                      unoptimized={project.image.endsWith(".svg")}
                      sizes="(max-width: 768px) 84vw, 460px"
                      className="work-lite-img"
                    />
                  ) : null}
                  <span className="work-lite-shade" aria-hidden />
                  <span className="work-lite-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="work-lite-title">{project.title}</span>
                </div>

                <div className="work-lite-body">
                  <div className="work-overlay-meta">
                    <span className="work-overlay-counter">
                      <strong>{String(index + 1).padStart(2, "0")}</strong>
                      <span className="work-overlay-slash">/</span>
                      {String(projects.length).padStart(2, "0")}
                    </span>
                    <span className="work-overlay-primary-tech">
                      {project.stack[0]}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="chip-row work-lite-chips">
                    {project.stack.map((tech) => (
                      <span className="chip" key={tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.link ? (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <ExternalLink aria-hidden />
                        Live
                      </a>
                    ) : null}
                    {project.github ? (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        Code
                      </a>
                    ) : null}
                    {project.apk ? (
                      <a
                        href={project.apk}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Download aria-hidden />
                        Download APK
                      </a>
                    ) : null}
                    {project.proof ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenProof(project.proof!);
                        }}
                      >
                        Proof
                        <ArrowUpRight aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>

      <div className="work-lite-controls" data-no-drag>
        <button
          type="button"
          className="work-nav-btn"
          aria-label="Previous project"
          disabled={activeIndex <= 0}
          onClick={() => onSelect(activeIndex - 1)}
        >
          <ArrowLeft aria-hidden />
        </button>
        <span className="work-lite-counter">
          {String(activeIndex + 1).padStart(2, "0")}
          <span>/</span>
          {String(projects.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          className="work-nav-btn"
          aria-label="Next project"
          disabled={activeIndex >= projects.length - 1}
          onClick={() => onSelect(activeIndex + 1)}
        >
          <ArrowRight aria-hidden />
        </button>
      </div>
    </div>
  );
}
