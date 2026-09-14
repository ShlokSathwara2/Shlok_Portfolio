"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

function FramePiece({
  frame,
  progress,
  videoSrc,
}: {
  frame: { id: number; row: number; col: number; spreadX: number; spreadY: number; rotation: number };
  progress: MotionValue<number>;
  videoSrc: string;
}) {
  const cellW = 100 / 3;
  const cellH = 100 / 3;

  const x = useTransform(progress, [0.28, 0.5], [0, frame.spreadX]);
  const y = useTransform(progress, [0.28, 0.5], [0, frame.spreadY]);
  const rotate = useTransform(progress, [0.28, 0.55], [0, frame.rotation + 360]);
  const scale = useTransform(progress, [0.28, 0.42, 0.55], [1, 1.15, 0.6]);
  const opacity = useTransform(progress, [0.25, 0.34, 0.52, 0.62], [0, 1, 1, 0]);

  return (
    <motion.div
      className="absolute overflow-hidden rounded-lg border border-white/10"
      style={{
        width: `${cellW + 0.5}%`,
        height: `${cellH + 0.5}%`,
        left: `${frame.col * cellW}%`,
        top: `${frame.row * cellH}%`,
        x,
        y,
        rotate,
        scale,
        opacity,
      }}
    >
      <video
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          width: "300%",
          height: "300%",
          transform: `translate(-${frame.col * 100}%, -${frame.row * 100}%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
    </motion.div>
  );
}

const FRAMES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  row: Math.floor(i / 3),
  col: i % 3,
  spreadX: (i % 3 - 1) * 220,
  spreadY: (Math.floor(i / 3) - 1) * 220,
  rotation: (Math.random() - 0.5) * 60,
}));

export default function WelcomeIntro() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001,
  });

  const videoOpacity = useTransform(smooth, [0, 0.2, 0.4], [1, 1, 0]);
  const videoScale = useTransform(smooth, [0, 0.4], [1, 1.2]);
  const overlayOpacity = useTransform(smooth, [0, 0.1, 0.3], [0, 0, 0.8]);

  const welcomeOpacity = useTransform(smooth, [0, 0.05, 0.18, 0.28], [1, 1, 1, 0]);

  const framesOpacity = useTransform(smooth, [0.22, 0.32, 0.52, 0.62], [0, 1, 1, 0]);
  const framesRotate = useTransform(smooth, [0.2, 0.6], [0, 360]);
  const framesScale = useTransform(smooth, [0.22, 0.4], [0.85, 1]);

  const imgReveal = useTransform(smooth, [0.35, 0.5], [0, 1]);
  const imgClip = useTransform(smooth, [0.35, 0.55], ["circle(6% at 50% 50%)", "circle(80% at 50% 50%)"]);
  const imgScale = useTransform(smooth, [0.35, 0.55], [0.8, 1]);
  const imgY = useTransform(smooth, [0.35, 0.6], [100, -30]);
  const imgGlow = useTransform(smooth, [0.4, 0.55], [0, 0.6]);

  const nameOpacity = useTransform(smooth, [0.52, 0.62, 0.78, 0.88], [0, 1, 1, 0]);
  const nameY = useTransform(smooth, [0.52, 0.62], [40, 0]);

  const scrollIndicatorOpacity = useTransform(smooth, [0, 0.08], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0a0a0f]">
        {/* Video */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: videoOpacity, scale: videoScale }}>
          <video src="/welcome-video.mp4" muted playsInline preload="auto" className="w-full h-full object-cover" />
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.5)_70%,rgba(10,10,15,0.9)_100%)]" />

        {/* Dark Overlay */}
        <motion.div className="absolute inset-0 bg-[#0a0a0f] z-[2]" style={{ opacity: overlayOpacity }} />

        {/* Frame Break */}
        <motion.div
          className="absolute inset-0 z-[3] flex items-center justify-center"
          style={{ opacity: framesOpacity, rotate: framesRotate, scale: framesScale }}
        >
          <div className="relative w-[80vw] max-w-[700px] aspect-video" style={{ perspective: "1200px" }}>
            {FRAMES.map((frame) => (
              <FramePiece key={frame.id} frame={frame} progress={smooth} videoSrc="/welcome-video.mp4" />
            ))}
          </div>
        </motion.div>

        {/* Welcome Text — visible from start, fades out on scroll */}
        <motion.div
          className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center px-6"
          style={{ opacity: welcomeOpacity }}
        >
          <div className="mb-5">
            <span className="inline-block px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-400 tracking-[0.12em] uppercase">
              Welcome to my world
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-[-0.03em] mb-5">
            Shlok
            <span className="block text-gradient-sky">Sathwara</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-[500px] leading-relaxed">
            Aspiring Software Engineer crafting AI-powered solutions
          </p>
        </motion.div>

        {/* Profile Image Reveal */}
        <motion.div
          className="absolute inset-0 z-[6] flex items-center justify-center"
          style={{ opacity: imgReveal }}
        >
          <motion.div
            className="relative w-[300px] h-[380px] sm:w-[340px] sm:h-[440px] md:w-[380px] md:h-[480px] rounded-2xl overflow-hidden"
            style={{ clipPath: imgClip, scale: imgScale, y: imgY }}
          >
            <img
              src="/profile-new.jpg"
              alt="Shlok Sathwara"
              className="w-full h-full object-cover object-top"
            />
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: "0 0 60px 20px rgba(99,102,241,0.3), 0 0 120px 40px rgba(14,165,233,0.15)",
                opacity: imgGlow,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </motion.div>
        </motion.div>

        {/* Name + Tagline */}
        <motion.div
          className="absolute inset-0 z-[7] flex flex-col items-center justify-end pb-[15vh] text-center px-6"
          style={{ opacity: nameOpacity, y: nameY }}
        >
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1] tracking-[-0.02em] mb-3">
            Shlok <span className="text-gradient-sky">Sathwara</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-[440px] leading-relaxed">
            Computer Science &amp; Technology at SRMIST
          </p>
          <p className="text-gray-500 text-sm mt-2">CGPA: 9.44</p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[8] flex flex-col items-center gap-3"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-gray-500 text-xs tracking-[0.2em] uppercase">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-2 bg-indigo-400 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
