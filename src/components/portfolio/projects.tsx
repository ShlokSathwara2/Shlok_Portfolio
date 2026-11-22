"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
} from "lucide-react";
import { projects, type ProofTarget } from "./data";
import { GithubIcon, useMediaQuery } from "./primitives";
import ProofModal from "../ui/proof-modal";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function ProjectsSection() {
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [proof, setProof] = useState<ProofTarget | null>(null);

  useEffect(() => {
    if (!isDesktop) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let frame = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance, 0, 1);
      const max = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-progress * max}px, 0, 0)`;
      section.style.setProperty("--projects-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isDesktop]);

  return (
    <section
      id="projects"
      className={`projects-section${isDesktop ? " is-desktop" : ""}`}
      ref={sectionRef}
      style={{ height: isDesktop ? "500vh" : "auto" }}
    >
      <div className="projects-sticky">
        <div className="projects-head">
          <div>
            <p className="section-kicker">
              <span className="section-index">05</span>
              SELECTED WORK
            </p>
            <h2 className="display">MY WORK</h2>
          </div>
          <div className="projects-head-side">
            <p>
              {projects.length} selected builds · 2024—2026
              <br />
              AI products, full-stack apps, and experiments.
            </p>
            <span className="projects-hint">
              Scroll to explore
              <ArrowRight aria-hidden />
            </span>
          </div>
        </div>

        <div className="projects-track-wrap">
          <div className="projects-track" ref={trackRef}>
            {projects.map((project, index) => (
              <article className="project-card" key={project.title}>
                <div className="project-visual">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.imageAlt ?? project.title}
                      fill
                      sizes="(max-width: 900px) 90vw, 48vw"
                      className="project-image"
                    />
                  ) : (
                    <div
                      className={`project-visual-placeholder accent-${index % 4}`}
                    >
                      <span className="project-visual-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="project-visual-title">
                        {project.title}
                      </span>
                      <span className="project-visual-grid" />
                      <span className="project-visual-stack">
                        {project.stack.slice(0, 3).join(" · ")}
                      </span>
                    </div>
                  )}
                  <span className="project-visual-shade" aria-hidden />
                  <span className="project-number" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="project-body">
                  <div className="project-body-top">
                    <span>{project.stack[0]}</span>
                    <span>
                      {String(index + 1).padStart(2, "0")} / {projects.length}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="chip-row">
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
                        <Download className="h-3.5 w-3.5" aria-hidden />
                        Download APK
                      </a>
                    ) : null}
                    {project.proof ? (
                      <button
                        type="button"
                        onClick={() =>
                          setProof({
                            title: project.proof!.title,
                            type: project.proof!.type,
                            src: project.proof!.src,
                          })
                        }
                      >
                        Proof
                        <ArrowUpRight aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="projects-progress" aria-hidden>
          <span className="projects-progress-fill" />
        </div>
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
