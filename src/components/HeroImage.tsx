"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function HeroImage() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  const imgY = useTransform(smooth, [0, 1], [60, -60]);
  const imgScale = useTransform(smooth, [0, 0.5, 1], [0.95, 1.02, 0.98]);
  const glowOpacity = useTransform(smooth, [0.2, 0.5, 0.8], [0.3, 0.7, 0.3]);

  return (
    <div ref={ref} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] to-sky-500/[0.05] z-[1]" />
      <motion.div
        className="relative z-[2] w-[340px] h-[440px] sm:w-[380px] sm:h-[480px] md:w-[420px] md:h-[540px] rounded-2xl overflow-hidden"
        style={{ y: imgY, scale: imgScale }}
      >
        <img
          src="/profile-new.jpg"
          alt="Shlok Sathwara"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/70 via-transparent to-transparent" />
      </motion.div>
      <motion.div
        className="absolute z-[3] w-[340px] h-[440px] sm:w-[380px] sm:h-[480px] md:w-[420px] md:h-[540px] rounded-2xl pointer-events-none"
        style={{
          boxShadow: "0 0 80px 25px rgba(99,102,241,0.25), 0 0 150px 50px rgba(14,165,233,0.1)",
          opacity: glowOpacity,
        }}
      />
    </div>
  );
}
