"use client";

import { useEffect, useState } from "react";
import PortfolioSections from "@/components/portfolio-sections";
import WelcomeIntro from "@/components/WelcomeIntro";
import ParticleNetwork from "@/components/ParticleNetwork";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative">
      {/* Fixed living background — particles + gradient blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <ParticleNetwork scrollY={scrollY} />
        <div className="absolute w-[500px] h-[500px] top-[-10%] left-[-5%] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12)_0%,transparent_70%)] blur-[100px] opacity-80 animate-[mesh-float-1_20s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute w-[600px] h-[600px] top-[20%] right-[-10%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%)] blur-[100px] opacity-80 animate-[mesh-float-2_25s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute w-[450px] h-[450px] top-[50%] left-[25%] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.08)_0%,transparent_70%)] blur-[100px] opacity-80 animate-[mesh-float-3_22s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute w-[500px] h-[500px] top-[75%] right-[5%] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.1)_0%,transparent_70%)] blur-[100px] opacity-80 animate-[mesh-float-4_18s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute w-[400px] h-[400px] bottom-[-5%] left-[-8%] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.06)_0%,transparent_70%)] blur-[100px] opacity-80 animate-[mesh-float-5_23s_ease-in-out_infinite_alternate]"></div>
      </div>

      <style>{`
        @keyframes mesh-float-1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(60px, 40px) scale(1.08); }
          66%  { transform: translate(-30px, 80px) scale(0.95); }
          100% { transform: translate(40px, -20px) scale(1.03); }
        }
        @keyframes mesh-float-2 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-80px, 50px) scale(1.05); }
          66%  { transform: translate(40px, -60px) scale(0.97); }
          100% { transform: translate(-50px, 30px) scale(1.1); }
        }
        @keyframes mesh-float-3 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(50px, -40px) scale(1.1); }
          66%  { transform: translate(-60px, 50px) scale(0.92); }
          100% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes mesh-float-4 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-40px, -50px) scale(0.95); }
          66%  { transform: translate(70px, 30px) scale(1.08); }
          100% { transform: translate(-20px, 60px) scale(1); }
        }
        @keyframes mesh-float-5 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(60px, -30px) scale(1.05); }
          66%  { transform: translate(-40px, 40px) scale(0.97); }
          100% { transform: translate(50px, -50px) scale(1.1); }
        }
      `}</style>

      <WelcomeIntro />
      <PortfolioSections />
    </main>
  );
}
