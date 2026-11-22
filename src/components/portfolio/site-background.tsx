"use client";

import ParticleNetwork from "@/components/ParticleNetwork";
import { usePrefersReducedMotion } from "./primitives";

/**
 * Fixed, living celestial cyber background.
 * Unifies the entire website with interactive constellation physics,
 * multi-tier stardust depth, and volumetric chromatic ambient auroras.
 */
export default function SiteBackground() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;

  return (
    <div className="site-particle-bg" aria-hidden>
      <ParticleNetwork />
      <span className="site-blob site-blob-1" />
      <span className="site-blob site-blob-2" />
      <span className="site-blob site-blob-3" />
      <span className="site-blob site-blob-4" />
    </div>
  );
}
