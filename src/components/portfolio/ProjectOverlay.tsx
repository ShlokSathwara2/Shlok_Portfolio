"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
} from "lucide-react";
import type { ProjectItem, ProofTarget } from "./projects-data";
import { GithubIcon } from "./primitives";

type ProjectOverlayProps = {
  projects: ProjectItem[];
  activeIndex: number;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  onOpenProof: (proof: ProofTarget) => void;
};

export default function ProjectOverlay({
  projects,
  activeIndex,
  reducedMotion,
  onSelect,
  onOpenProof,
}: ProjectOverlayProps) {
  const project = projects[activeIndex] ?? projects[0];
  const formattedIndex = String(activeIndex + 1).padStart(2, "0");
  const formattedTotal = String(projects.length).padStart(2, "0");
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= projects.length - 1;

  return (
    <div className="work-overlay">
      <div className="work-overlay-card" data-no-drag>
        <div className="work-overlay-rule" aria-hidden>
          <span />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={project.title}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, filter: "blur(7px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -10, filter: "blur(4px)" }
            }
            transition={{
              duration: reducedMotion ? 0.12 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="work-overlay-inner"
          >
            <div className="work-overlay-meta">
              <span className="work-overlay-counter">
                <strong>{formattedIndex}</strong>
                <span className="work-overlay-slash">/</span>
                {formattedTotal}
              </span>
              <span className="work-overlay-primary-tech">
                {project.stack[0]}
              </span>
            </div>

            <h3
              className="work-overlay-title"
              data-glitch={reducedMotion ? "false" : "true"}
            >
              {project.title}
            </h3>
            <p className="work-overlay-desc">{project.description}</p>

            <div className="chip-row work-overlay-chips">
              {project.stack.map((tech) => (
                <span className="chip" key={tech}>
                  {tech}
                </span>
              ))}
            </div>

            <div className="project-links work-overlay-links">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
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
                >
                  <Download aria-hidden />
                  Download APK
                </a>
              ) : null}
              {project.proof ? (
                <button
                  type="button"
                  onClick={() => onOpenProof(project.proof!)}
                >
                  Proof
                  <ArrowUpRight aria-hidden />
                </button>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="work-controls">
          <button
            type="button"
            className="work-nav-btn"
            aria-label="Previous project"
            disabled={atStart}
            onClick={() => onSelect(activeIndex - 1)}
          >
            <ArrowLeft aria-hidden />
          </button>

          <div
            className="work-ticks"
            role="group"
            aria-label="Choose a project"
          >
            {projects.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`work-tick${
                  index === activeIndex ? " is-active" : ""
                }`}
                aria-label={`Go to ${item.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => onSelect(index)}
              />
            ))}
          </div>

          <button
            type="button"
            className="work-nav-btn"
            aria-label="Next project"
            disabled={atEnd}
            onClick={() => onSelect(activeIndex + 1)}
          >
            <ArrowRight aria-hidden />
          </button>
        </div>

        <p className="work-overlay-hint">
          <span className="work-overlay-hint-dot" aria-hidden />
          Drag to orbit · Scroll to travel
        </p>
      </div>
    </div>
  );
}
