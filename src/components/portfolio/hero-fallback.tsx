"use client";

import { useEffect, useRef } from "react";
import { ParkBackdrop } from "./park-backdrop";

type PointerState = {
  x: number;
  y: number;
  lastMove: number;
  active: boolean;
};

export default function HeroFallback({
  pointerRef,
  reducedMotion,
}: {
  pointerRef: React.MutableRefObject<PointerState>;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;

    const tick = () => {
      const root = rootRef.current;
      if (root) {
        const pointer = pointerRef.current;
        const idle =
          !pointer.active ||
          performance.now() - pointer.lastMove > 2000;
        const x = idle ? Math.sin(performance.now() / 2800) * 0.35 : pointer.x;
        const y = idle ? Math.cos(performance.now() / 3400) * 0.22 : pointer.y;
        root.style.setProperty("--px", x.toFixed(3));
        root.style.setProperty("--py", y.toFixed(3));
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pointerRef, reducedMotion]);

  return (
    <div className="hero-fallback" ref={rootRef} aria-hidden>
      <ParkBackdrop />
      <div className="fallback-parallax fallback-back" />
      <div className="fallback-table" />
      <div className="fallback-character">
        <div className="fallback-body">
          <span className="fallback-hood" />
          <span className="fallback-string fallback-string-left" />
          <span className="fallback-string fallback-string-right" />
          <span className="fallback-pocket" />
        </div>
        <div className="fallback-head">
          <div className="fallback-hair">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="fallback-face">
            <span className="fallback-brow fallback-brow-left" />
            <span className="fallback-brow fallback-brow-right" />
            <span className="fallback-glasses" />
            <span className="fallback-eye fallback-eye-left" />
            <span className="fallback-eye fallback-eye-right" />
            <span className="fallback-nose" />
            <span className="fallback-smile" />
            <span className="fallback-beard" />
          </div>
        </div>
        <div className="fallback-laptop">
          <span className="fallback-laptop-screen" />
          <span className="fallback-laptop-base" />
        </div>
      </div>
      <div className="fallback-foreground" />
    </div>
  );
}
