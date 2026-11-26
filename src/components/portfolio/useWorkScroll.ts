"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type UseWorkScrollOptions = {
  total: number;
  enabled: boolean;
  reducedMotion: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Drives the MY WORK orbit.
 *
 * Scroll progress is written to refs (never React state) so the scene can read
 * it every frame without re-rendering the page. React state is only updated
 * when the active project actually changes.
 *
 * Interaction model:
 * - page scroll = camera orbit (primary)
 * - drag / swipe = temporary orbit offset, then snaps to the nearest project
 * - arrows / card click / dots = smoothly scroll the page to that project
 */
export function useWorkScroll({
  total,
  enabled,
  reducedMotion,
}: UseWorkScrollOptions) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const targetProgressRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const lockedProgressRef = useRef<number | null>(null);
  const activeRef = useRef(0);
  const suppressClickRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const maxIndex = Math.max(1, total - 1);
  const step = 1 / maxIndex;

  const publishIndex = useCallback(
    (progress: number) => {
      const next = Math.max(
        0,
        Math.min(total - 1, Math.round(progress * maxIndex))
      );
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActiveIndex(next);
      }
    },
    [maxIndex, total]
  );

  // Mount the WebGL scene only while the section is near the viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "420px 0px 420px 0px", threshold: 0 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // ScrollTrigger pin + progress. No ScrollTrigger snapping: Lenis already
  // smooths the page, and snapping every project makes the section feel sticky.
  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          stage.style.setProperty(
            "--work-progress",
            self.progress.toFixed(4)
          );

          if (lockedProgressRef.current !== null) {
            // A click/arrow/snap is scrolling the page to a specific project.
            // Keep the camera on that project until the scroll arrives, so it
            // doesn't rewind to the old scroll position mid-flight.
            if (
              Math.abs(self.progress - lockedProgressRef.current) < 0.0035
            ) {
              lockedProgressRef.current = null;
              dragOffsetRef.current = 0;
              targetProgressRef.current = self.progress;
              publishIndex(self.progress);
            } else {
              targetProgressRef.current = lockedProgressRef.current;
            }
            return;
          }

          const next = clamp01(
            self.progress + dragOffsetRef.current
          );
          targetProgressRef.current = next;
          publishIndex(next);
        },
      });
    }, section);

    return () => {
      stRef.current = null;
      ctx.revert();
    };
  }, [enabled, publishIndex]);

  // Any real wheel/touch input cancels a programmatic snap.
  useEffect(() => {
    if (!enabled) return;
    const release = () => {
      lockedProgressRef.current = null;
      dragOffsetRef.current = 0;
    };
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    return () => {
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
    };
  }, [enabled]);

  const scrollToProgress = useCallback(
    (progress: number) => {
      const st = stRef.current;
      if (!st) return;
      const top = st.start + clamp01(progress) * (st.end - st.start);
      window.scrollTo({
        top,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion]
  );

  const selectProject = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(total - 1, index));
      const progress = next * step;
      dragOffsetRef.current = 0;
      lockedProgressRef.current = progress;
      targetProgressRef.current = progress;
      publishIndex(progress);
      scrollToProgress(progress);
    },
    [publishIndex, scrollToProgress, step, total]
  );

  // Drag (mouse) / horizontal swipe (touch). `touch-action: pan-y` on the
  // stage lets vertical page scrolling win before this code locks the axis.
  useEffect(() => {
    if (!enabled) return;
    const stage = stageRef.current;
    if (!stage) return;

    let dragging = false;
    let axis: "x" | "y" | null = null;
    let startX = 0;
    let startY = 0;
    let startTarget = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "a, button, input, textarea, select, [data-no-drag]"
        )
      ) {
        return;
      }

      dragging = true;
      axis = null;
      startX = event.clientX;
      startY = event.clientY;
      startTarget = targetProgressRef.current;
      suppressClickRef.current = false;
      lockedProgressRef.current = null;
      dragOffsetRef.current = 0;
      setIsDragging(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") {
          dragging = false;
          setIsDragging(false);
          return;
        }
      }

      if (axis !== "x") return;
      if (Math.abs(dx) > 10) suppressClickRef.current = true;
      const travel = Math.max(360, window.innerWidth * 0.9);
      const next = clamp01(startTarget + dx / travel);
      targetProgressRef.current = next;
      publishIndex(next);
    };

    const finish = () => {
      if (!dragging) return;
      dragging = false;
      setIsDragging(false);
      if (axis === "x") {
        selectProject(Math.round(targetProgressRef.current * maxIndex));
      }
      axis = null;
    };

    stage.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", finish, { passive: true });
    window.addEventListener("pointercancel", finish, { passive: true });

    return () => {
      stage.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [enabled, maxIndex, publishIndex, selectProject]);

  // Left / right arrows while the section is near the viewport.
  useEffect(() => {
    if (!isNearViewport) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
      selectProject(
        activeRef.current + (event.key === "ArrowRight" ? 1 : -1)
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isNearViewport, selectProject]);

  return {
    sectionRef,
    stageRef,
    targetProgressRef,
    suppressClickRef,
    activeIndex,
    isNearViewport,
    isDragging,
    selectProject,
  };
}
