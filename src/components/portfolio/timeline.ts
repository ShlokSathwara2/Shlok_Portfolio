/**
 * SINGLE SOURCE OF TRUTH FOR THE HERO SCROLL TIMELINE.
 *
 * All positions are normalized 0..1 across the scrollable distance of the
 * pinned experience stage (not the total page height). Change these values to
 * retune the sequence without touching the scene or DOM code.
 */
export const TIMELINE = {
  stage: {
    /** Total pinned stage height. 600vh - 100vh viewport = 500vh of scroll. */
    heightVh: 600,
    /** Scrollable distance inside the stage, in viewport heights. */
    scrollDistanceVh: 500,
  },

  zoom: {
    /** Laptop room -> full-screen hero. 0.5 * 500vh = 250vh of zoom. */
    start: 0,
    end: 0.5,
    ease: "power2.inOut",
    /** Room/lamp/laptop begin fading in the last 30% of the zoom. */
    fadeStart: 0.35,
    /**
     * Screen rectangle as percentages of the laptop frame.
     * Tune these four numbers against your own laptop photo.
     */
    screenRect: { x: 6, y: 6, w: 88, h: 88 },
  },

  hero: {
    /** Hero scene holds for ~40vh after the zoom. */
    holdEnd: 0.62,
    copyIn: 0.5,
    copyOut: 0.62,
    tagIn: 0.52,
    /** Timeline-time stagger between words, not a normalized scroll value. */
    stagger: 0.004,
  },

  panels: {
    in: 0.66,
    out: 0.76,
  },

  career: {
    in: 0.78,
    out: 0.9,
  },

  fade: {
    start: 0.88,
    end: 0.98,
  },

  camera: {
    fov: 34,
    mobileFov: 40,
    hero: {
      /** Offset left of the table so the character sits right-of-centre,
       *  leaving the left half clear for the headline and stats. */
      position: [-0.9, 1.35, 4.4] as [number, number, number],
      target: [-0.9, 1.15, 0] as [number, number, number],
    },
    /** Portrait framing: look slightly above the character so the copy sits
     *  over the sky and the desk/character settle into the lower half. */
    mobileHero: {
      position: [0, 1.55, 5.2] as [number, number, number],
      target: [0, 1.78, 0] as [number, number, number],
    },
    desk: {
      position: [0, 1.5, 6.6] as [number, number, number],
      target: [0, 0.85, 0] as [number, number, number],
    },
    mobileDesk: {
      position: [0, 1.7, 7.4] as [number, number, number],
      target: [0, 0.95, 0] as [number, number, number],
    },
    career: {
      position: [0, 2.6, 7.6] as [number, number, number],
      target: [0, 0.35, 0] as [number, number, number],
    },
    mobileCareer: {
      position: [0, 3, 8.8] as [number, number, number],
      target: [0, 0.35, 0] as [number, number, number],
    },
  },

  avatar: {
    deskDropStart: 0.76,
    deskDropEnd: 0.9,
    dropY: -1.15,
    scale: 0.86,
  },

  pointer: {
    maxYawDeg: 25,
    maxPitchDeg: 12,
    neckShare: 0.4,
    headShare: 0.6,
    damping: 0.08,
    idleAfterMs: 2000,
  },
} as const;

export type TimelineProgress = number;
