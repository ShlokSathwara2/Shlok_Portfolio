"use client";

import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import PortfolioAnimations from "./portfolio-animations";
import ProofModal from "./ui/proof-modal";
import HeroImage from "./HeroImage";
import { Camera, Map, GraduationCap, Brain, Wallet, Cog, MapPin, Film, BookOpen, Database, Building2, School, Layout, Server, Cloud, Bot, Wrench, Award, Trophy, FileText, Mail, ExternalLink, ChevronRight, BadgeCheck, Star, Code2 } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function PortfolioSections() {
  const typingRef = useRef<HTMLSpanElement>(null);
  const [modal, setModal] = useState<{ open: boolean; title: string; type: "image" | "pdf"; src: string }>({ open: false, title: "", type: "image", src: "" });

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });

    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const phrases = [
      "AI-powered applications",
      "full-stack web apps",
      "intelligent systems",
      "scalable backend APIs",
      "smart automation tools",
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeEffect() {
      if (!typingRef.current) return;
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        typingRef.current.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typingRef.current.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }
      if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400;
      }
      timeoutId = setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();

    return () => {
      revealObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <PortfolioAnimations />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-10 py-4 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-300">
        <div className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold text-gradient-indigo">SS</div>
        <div className="hidden md:flex gap-8">
          {[{l:"Home",h:"#hero"},{l:"About",h:"#about"},{l:"Experience",h:"#experience"},{l:"Projects",h:"#projects"},{l:"Research",h:"#publication"},{l:"Education",h:"#education"},{l:"Skills",h:"#skills"},{l:"Certs",h:"#certifications"},{l:"Achievements",h:"#achievements"},{l:"Contact",h:"#contact"}].map((link) => (
            <a key={link.h} href={link.h} className="nav-link text-sm font-medium text-gray-400 hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-indigo-500 after:rounded-full hover:after:w-full after:transition-all after:duration-300">{link.l}</a>
          ))}
        </div>
        <a href="#contact" className="nav-cta hidden md:inline-flex bg-white/10 text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-300 border border-white/[0.06]">Let&apos;s Talk</a>
        <button className="hamburger md:hidden flex flex-col justify-center gap-[5px] w-[30px] h-[30px] bg-transparent border-none cursor-pointer z-[200] p-0" aria-label="Toggle menu">
          <span className="hamburger-span block w-full h-[2px] bg-white rounded-[2px] transition-all duration-300 origin-center"></span>
          <span className="hamburger-span block w-full h-[2px] bg-white rounded-[2px] transition-all duration-300 origin-center"></span>
          <span className="hamburger-span block w-full h-[2px] bg-white rounded-[2px] transition-all duration-300 origin-center"></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className="mobile-menu" id="mobileMenu">
        <div className="mobile-menu-links">
          {[{l:"Home",h:"#hero"},{l:"About",h:"#about"},{l:"Experience",h:"#experience"},{l:"Projects",h:"#projects"},{l:"Research",h:"#publication"},{l:"Education",h:"#education"},{l:"Skills",h:"#skills"},{l:"Certs",h:"#certifications"},{l:"Achievements",h:"#achievements"},{l:"Contact",h:"#contact"}].map((link) => (
            <a key={link.h} href={link.h} className="mobile-link">{link.l}</a>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="hero-section relative z-10 flex min-h-screen overflow-hidden" id="hero">
        <div className="flex-1 flex items-center py-24 px-8 md:px-16 lg:px-20 bg-[rgba(255,255,255,0.02)] relative">
          <div className="max-w-[560px]">
            <div className="inline-block px-4 py-1.5 bg-indigo-500/[0.08] border border-indigo-500/[0.15] rounded-full text-xs font-semibold text-indigo-400 tracking-[0.05em] uppercase mb-6" data-aos="fade-up" data-aos-delay="0">Aspiring Software Engineer</div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] mb-6" data-aos="fade-up" data-aos-delay="100">
              <span className="hero-name block text-4xl sm:text-5xl md:text-[4.5rem] font-black leading-[1.05] tracking-[-0.03em] text-white">Shlok</span>
              <span className="hero-name block text-4xl sm:text-5xl md:text-[4.5rem] font-black leading-[1.05] tracking-[-0.03em] text-gradient-sky">Sathwara</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-4 max-w-[440px]" data-aos="fade-up" data-aos-delay="200">Computer Science & Technology at SRMIST. Focused on DSA, Java, AI Integration, and building AI-powered apps. CGPA: 9.44</p>
            <div className="text-base text-gray-400 mb-10 min-h-[1.5rem]" data-aos="fade-up" data-aos-delay="300">
              <span className="text-gray-400">I build </span>
              <span className="text-indigo-400 font-semibold" ref={typingRef}></span>
              <span className="text-indigo-400 font-light animate-[blink_0.8s_step-end_infinite]">|</span>
            </div>
            <div className="text-sm text-gray-400 mb-10 flex items-center gap-2" data-aos="fade-up" data-aos-delay="350"><MapPin className="w-4 h-4 text-rose-500" /> Vadodara, Gujarat, India</div>
            <div className="flex gap-4 mb-10" data-aos="fade-up" data-aos-delay="400">
              <a href="/Resume_2608.pdf" download className="btn-explore flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-[0.4px] text-indigo-300 bg-white/[0.06] border border-white/[0.08] rounded-full py-4 px-7 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Resume
              </a>
              <a href="#contact" className="btn-outline inline-flex items-center justify-center py-4 px-7 rounded-full text-xs font-semibold uppercase tracking-[0.4px] text-white border border-white/[0.06] bg-transparent hover:border-indigo-500 hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-300">Get In Touch</a>
            </div>
            <div className="flex gap-4" data-aos="fade-up" data-aos-delay="500">
              {[{icon:<GithubIcon className="w-5 h-5" />,url:"https://github.com/ShlokSathwara2"},{icon:<LinkedinIcon className="w-5 h-5" />,url:"https://www.linkedin.com/in/shlok-sathwara-4b91ab319/"},{icon:<Code2 className="w-5 h-5" />,url:"https://leetcode.com/u/Shlok_Sathwara/"}].map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="social-link w-[42px] h-[42px] flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.06] text-gray-400 text-base hover:text-indigo-400 hover:border-indigo-500 hover:-translate-y-0.5 transition-all duration-300">{s.icon}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
          <HeroImage />
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[2]">
          <div className="w-px h-10 bg-gradient-to-b from-indigo-500 to-transparent animate-[scroll-pulse_2s_ease-in-out_infinite]"></div>
          <span className="text-[0.7rem] uppercase tracking-[0.15em] text-gray-500">Scroll</span>
        </div>
      </section>

      {/* About - Bento Grid */}
      <section className="relative z-10 py-24" id="about">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">01</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">About Me</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="grid grid-cols-3 gap-4" data-aos="fade-up">
            <div className="col-span-2 row-span-2 glass spotlight-card rounded-2xl p-8 flex flex-col justify-center" data-aos="fade-up">
              <p className="text-[1.05rem] text-gray-400 mb-5 leading-[1.8]">I&apos;m a Computer Science & Technology student at SRMIST with a CGPA of <strong className="text-white">9.44</strong>, passionate about building impactful digital products. From leading a team at <strong className="text-white">Linde Engineering</strong> to building AI-powered tools, I thrive at the intersection of design and engineering.</p>
              <p className="text-[1.05rem] text-gray-400 mb-5 leading-[1.8]">My focus areas are <strong className="text-white">DSA & Java</strong>, <strong className="text-white">AI Integration</strong>, and building full-stack applications. I&apos;ve delivered projects ranging from AI budget trackers to adaptive study platforms, and I hold an <strong className="text-white">Oracle APEX Cloud Developer</strong> certification.</p>
              <p className="text-[1.05rem] text-gray-400 leading-[1.8]">Currently seeking software engineering roles where I can apply my skills in full-stack development, AI integration, and cloud platforms. Also available for freelance engagements and open-source collaborations.</p>
            </div>
            <div className="glass spotlight-card rounded-2xl p-6 flex flex-col items-center justify-center text-center" data-aos="fade-up" data-aos-delay="100">
              <span className="stat-number block font-[family-name:var(--font-space-grotesk)] text-[3rem] font-extrabold text-gradient-indigo">9.44</span>
              <span className="text-sm text-gray-400 uppercase tracking-[0.05em]">CGPA</span>
            </div>
            <div className="glass spotlight-card rounded-2xl p-6 flex flex-col items-center justify-center text-center" data-aos="fade-up" data-aos-delay="150">
              <span className="stat-number block font-[family-name:var(--font-space-grotesk)] text-[2.5rem] font-extrabold text-gradient-sky">10+</span>
              <span className="text-sm text-gray-400 uppercase tracking-[0.05em]">Projects</span>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="200">
              <div className="glass spotlight-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <span className="stat-number block font-[family-name:var(--font-space-grotesk)] text-[2.5rem] font-extrabold text-gradient-indigo">7</span>
                <span className="text-sm text-gray-400 uppercase tracking-[0.05em]">Certifications</span>
              </div>
              <div className="glass spotlight-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <span className="stat-number block font-[family-name:var(--font-space-grotesk)] text-[2.5rem] font-extrabold text-gradient-sky">2</span>
                <span className="text-sm text-gray-400 uppercase tracking-[0.05em]">Experiences</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="relative z-10 py-24" id="experience">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">02</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Experience</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="relative pl-10">
            <div className="absolute left-[6px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent rounded-[2px]"></div>
            <div className="relative mb-12 reveal" data-aos="fade-up">
              <div className="absolute left-[-2.5rem] top-[0.5rem] w-[14px] h-[14px] rounded-full bg-indigo-500 border-[3px] border-[#0a0a0f] shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"></div>
              <div className="glass spotlight-card rounded-2xl p-8 hover:-translate-y-0.5 hover:shadow-card-md transition-all duration-300">
                <div className="mb-4">
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-1 text-white">Team Lead — Helpdesk Portal Redesign</h3>
                  <span className="block text-sm text-indigo-400 font-medium">Linde Engineering India Pvt. Ltd.</span>
                  <span className="block text-xs text-gray-500 mt-0.5">Jun — Jul 2026 · Vadodara, On-site</span>
                </div>
                <ul className="list-none mb-4">
                  {["Led a small team with full ownership from planning through delivery","Coordinated feature planning, task delegation, and technical decisions","Redesigned frontend from scratch — custom animations, interactive UI components","Rebuilt backend architecture for structure, maintainability, and clean API design","Added stakeholder-requested features improving workflow efficiency","Introduced role-based access + admin tooling","Built reporting/analytics views for leadership visibility"].map((item) => (
                    <li key={item} className="relative pl-5 mb-2 text-sm text-gray-400 leading-relaxed before:content-['›'] before:absolute before:left-0 before:text-indigo-500">{item}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["React",".NET","SQL Server","Azure AD","Framer Motion","Three.js","Chart.js","ASP.NET Web API","Microsoft Entra ID"].map((t) => (
                    <span key={t} className="px-3 py-1 bg-indigo-500/[0.06] border border-indigo-500/[0.1] rounded-full text-xs font-medium text-indigo-400">{t}</span>
                  ))}
                </div>
                <div className="mt-6 py-5 px-6 bg-indigo-500/[0.04] border-l-[3px] border-indigo-500 rounded-r-[10px]">
                  <p className="text-sm text-gray-400 italic leading-relaxed mb-2">&ldquo;His dedication, ownership, and professionalism made a positive impact on the project and the team. I am confident he has a bright future ahead in software engineering.&rdquo;</p>
                  <span className="text-xs text-indigo-400 font-semibold">— Miteshkumar Mehta, IT Department, Linde Engineering</span>
                </div>
              </div>
            </div>
            <div className="relative reveal" data-aos="fade-up" data-aos-delay="100">
              <div className="absolute left-[-2.5rem] top-[0.5rem] w-[14px] h-[14px] rounded-full bg-indigo-500 border-[3px] border-[#0a0a0f] shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"></div>
              <div className="glass spotlight-card rounded-2xl p-8 hover:-translate-y-0.5 hover:shadow-card-md transition-all duration-300">
                <div className="mb-4">
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-1 text-white">Quality Assurance</h3>
                  <span className="block text-sm text-indigo-400 font-medium">Aaruush, SRM University</span>
                  <span className="block text-xs text-gray-500 mt-0.5">Aug 2025 — Present · On-site</span>
                </div>
                <ul className="list-none">
                  {["QA lead for Aaruush — SRM&apos;s annual technical fest (5000+ attendees)","Tested and validated event registration, scheduling, and live feedback systems","Identified and reported 20+ bugs across web and mobile platforms before launch","Implemented automated regression testing for repeatable event workflows"].map((item) => (
                    <li key={item} className="relative pl-5 mb-2 text-sm text-gray-400 leading-relaxed before:content-['›'] before:absolute before:left-0 before:text-indigo-500">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publication */}
      <section className="relative z-10 py-24" id="publication">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">PUB</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Research Publication</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="relative glass spotlight-card rounded-2xl p-10 overflow-hidden reveal" data-aos="fade-up">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.04)_0%,transparent_50%)] pointer-events-none"></div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-sky-500/[0.08] border border-sky-500/[0.15] rounded-full text-xs font-semibold text-sky-400 uppercase tracking-[0.05em] mb-4">Peer-Reviewed Paper</div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold mb-2 leading-snug text-white">AI-Based Cloud Intrusion Detection System Using Machine Learning</h3>
            <p className="text-sm text-indigo-400 font-medium mb-4">ICICCS 2026 — International Conference on Intelligent Computing and Communication Systems</p>
            <p className="text-[0.95rem] text-gray-400 leading-relaxed mb-6 max-w-[750px]">Proposed an ML-based intrusion detection system for cloud environments achieving <strong className="text-white">98.2% accuracy</strong>. Evaluated multiple classifiers (Random Forest, XGBoost, SVM) on the NSL-KDD dataset with feature engineering, cross-validation, and hyperparameter tuning. Addressed class imbalance via SMOTE and compared ensemble strategies for real-time cloud threat detection.</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {["98.2% Accuracy","NSL-KDD Dataset","RF, XGBoost, SVM","Accepted 2026"].map((m) => (
                <span key={m} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/[0.06] border border-indigo-500/[0.1] rounded-full text-xs font-medium text-indigo-400">{m}</span>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              <a href="/ICICCS-2026_Paper_Accepted.pdf" target="_blank" className="pub-link inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/10 text-white rounded-full text-xs font-semibold hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-300 border border-white/[0.06]">View Acceptance Letter</a>
              <a href="/ICICCS_Paper.docx" download className="pub-link inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/10 text-white rounded-full text-xs font-semibold hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-300 border border-white/[0.06]">Download Paper</a>
            </div>
          </div>
        </div>
      </section>

      {/* Currently Building */}
      <section className="relative z-10 py-24" id="building">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">WIP</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Currently Building</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="relative glass spotlight-card rounded-2xl p-10 overflow-hidden reveal" data-aos="fade-up">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,transparent_50%)] pointer-events-none"></div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-rose-500/[0.08] border border-rose-500/[0.15] rounded-full text-xs font-semibold text-rose-400 uppercase tracking-[0.05em] mb-4">In Progress</div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold mb-3 text-white">FRIDAY — AI Voice Assistant</h3>
            <p className="text-[0.95rem] text-gray-400 leading-relaxed mb-6 max-w-[700px]">A full-featured personal AI assistant with voice biometric authentication, emotion detection, multi-model intelligence (Gemini + Ollama), RAG pipeline, screen OCR, smart home control, encrypted vault, and proactive scheduling. Built with Python, featuring a plugin architecture and event-driven module communication.</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {["Voice & Wake Word","Gemini + Ollama AI","Screen OCR & Vision","Face Auth & Vault","Smart Home Control","Smart Scheduling"].map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/[0.06] border border-indigo-500/[0.1] rounded-full text-xs font-medium text-indigo-400">{f}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Python","Gemini","Ollama","Whisper","OpenCV","Tesseract","SQLite","FastAPI"].map((t) => (
                <span key={t} className="px-2.5 py-1 bg-sky-500/[0.06] border border-sky-500/[0.1] rounded-full text-[0.7rem] font-medium text-sky-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="relative z-10 py-24" id="projects">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">03</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Projects</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:<Code2 className="w-7 h-7 text-indigo-400" />, title:"Threshold Website", desc:"Official web experience for Threshold — a modern, fast, student-focused website showcasing attendance, marks, CGPA, exams, timetable.", stack:["React","UI/UX","Frontend","Responsive"], featured:true, image:"/threshold-website.jpg" },
              { icon:<Camera className="w-7 h-7 text-indigo-400" />, title:"Lecturn", desc:"Mobile-first PWA that transforms lecture slide photos into organized, searchable notes. AI extracts verbatim text via Gemini, groups into chapters, supports semantic search + Whisper audio transcription. Offline-first with sync.", stack:["Next.js 15","React 19","TypeScript","FastAPI","Supabase","Gemini","Groq Whisper"], featured:true, link:"https://lecturn-app.vercel.app", github:"https://github.com/ShlokSathwara2/Lecturn" },
              { icon:<Map className="w-7 h-7 text-indigo-400" />, title:"Global Deal Finder", desc:"AI-powered tool that calculates the true cheapest way to buy any product across 7 countries. Compares local, imported, and traveler-carried prices with real card offers, VAT refunds, customs duty.", stack:["Next.js","TypeScript","Tailwind","FastAPI","Supabase","Groq","Gemini"], featured:true, link:"https://global-deal-finder-tau.vercel.app", github:"https://github.com/ShlokSathwara2/Global-Deal-Finder" },
              { icon:<GraduationCap className="w-7 h-7 text-indigo-400" />, title:"LearnPath", desc:"AI-driven adaptive study-path platform with real-time quiz injection. Built with Aditya Bhambhani (Rutgers). Co-developed at Linde.", stack:["Next.js","Supabase","Gemini API","AI/ML"], featured:true, link:"https://learnpath-ai-nuiw.vercel.app" },
              { icon:<Brain className="w-7 h-7 text-indigo-400" />, title:"Threshold", desc:"SRMIST student companion app that unifies attendance, marks, CGPA, and timetable data from multiple college portals into one clean interface.", stack:["Next.js","Python","FastAPI","Capacitor","Render","Vercel"], featured:true, image:"/threshold-apk.jpg" },
              { icon:<Wallet className="w-7 h-7 text-indigo-400" />, title:"SmartStudy AI", desc:"Real-time collaborative study rooms with SM-2 spaced repetition, voice input via Groq Whisper, offline-first IndexedDB. $0/month infra.", stack:["Next.js 14","TypeScript","Supabase","Groq","Gemini","Ollama"], featured:true, link:"https://smart-flow-ai-delta.vercel.app", github:"https://github.com/ShlokSathwara2/Smart-Study-Planner-with-AI" },
              { icon:<Cog className="w-7 h-7 text-indigo-400" />, title:"TRIKIA", desc:"AI-powered budget tracker with voice commands, anomaly detection, family shared budgets, financial simulator, and bill reminders. Includes React Native mobile app.", stack:["React","Node/Express","MongoDB","React Native","JWT"], featured:false, link:"https://ai-budget-tracker-9d2e.vercel.app", github:"https://github.com/ShlokSathwara2/AI-BUDGET-TRACKER" },
              { icon:<MapPin className="w-7 h-7 text-indigo-400" />, title:"PipeStressRM", desc:"Automated resource/scheduling system for pipe-stress engineering. Skill/workload-based task matching, 2-year Gantt schedules generated in under a minute.", stack:["Python","OpenPyXL","Excel Automation"], featured:false },
              { icon:<Film className="w-7 h-7 text-indigo-400" />, title:"Smart Attendance System", desc:"GPS-verified attendance with entity-repo-service-controller backend. Geofencing, real-time tracking, role-based dashboards.", stack:["Java","JDBC","MySQL","HTML","JavaScript"], featured:false, github:"https://github.com/ShlokSathwara2/GPS-ATTENDANCE-SYSTEM" },
              { icon:<BookOpen className="w-7 h-7 text-indigo-400" />, title:"CineMatch", desc:"AI movie recommendation engine with personalized suggestions based on user preferences and viewing history.", stack:["React/Next.js","Flask","TMDB API"], featured:false },
              { icon:<Database className="w-7 h-7 text-indigo-400" />, title:"Smart Study Planner", desc:"Python + AI planning logic with Streamlit interface. Task prioritization and schedule generation.", stack:["Python","Streamlit","AI"], featured:false, github:"https://github.com/ShlokSathwara2/Smart-Study-Planner" },
              { icon:<School className="w-7 h-7 text-indigo-400" />, title:"College Database System", desc:"DBMS mini-project with MySQL. Normalization, CRUD operations, and comprehensive data management.", stack:["MySQL","JavaScript","Node.js"], featured:false, github:"https://github.com/ShlokSathwara2/College-Database-System" },
            ].map((p, i) => (
              <div key={p.title} onClick={p.title === "Threshold Website" ? () => setModal({ open: true, title: "Threshold Website", type: "image", src: "/threshold-website.jpg" }) : p.title === "Threshold" ? () => setModal({ open: true, title: "Threshold APK", type: "image", src: "/threshold-apk.jpg" }) : undefined} data-aos="fade-up" data-aos-delay={Math.min(i * 50, 300)} className={`project-card spotlight-card glass ${p.featured ? "border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.02] to-sky-500/[0.02]" : ""} rounded-2xl transition-all duration-300 hover:shadow-card-lg hover:border-indigo-500/15 overflow-hidden group reveal ${(p.title === "Threshold Website" || p.title === "Threshold") ? "cursor-pointer" : ""}`}>
                {p.image && <div className="w-full h-48 overflow-hidden"><img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                <div className="p-8">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[1.8rem]">{p.icon}</span>
                    <div className="flex gap-3">
                      {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-indigo-500/[0.06] text-gray-400 text-[0.85rem] hover:bg-indigo-500 hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></a>}
                      {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-indigo-500/[0.06] text-gray-400 text-[0.85rem] hover:bg-indigo-500 hover:text-white transition-all"><GithubIcon className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-3 text-white">{p.title}</h3>
                  <p className="text-[0.88rem] text-gray-400 leading-[1.7] mb-5">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-sky-500/[0.06] border border-sky-500/[0.1] rounded-full text-[0.7rem] font-medium text-sky-400">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="relative z-10 py-24" id="education">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">04</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Education</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { school:"SRM Institute of Science and Technology (SRMIST)", degree:"B.Tech — Computer Science and Technology", date:"Aug 2024 — Jun 2028", cgpa:"9.44", detail:"Sem 1: 9.33 · Sem 2: 9.48 · Sem 3: 9.2 · Sem 4: 9.7", icon:<Building2 className="w-5 h-5 text-indigo-400" /> },
              { school:"Delhi Public School Vadodara", degree:"Higher Secondary Education", date:"Apr 2009 — May 2022", detail:"Proficiency in English (2021-22), Mathematics (2017-19)", icon:<School className="w-5 h-5 text-indigo-400" /> },
            ].map((e, i) => (
              <div key={e.school} data-aos="fade-up" data-aos-delay={i * 100} className="education-card spotlight-card glass flex gap-6 rounded-2xl p-8 hover:-translate-y-[3px] hover:shadow-card-md transition-all duration-300 reveal">
                <div className="w-[50px] h-[50px] rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0"><span className="text-indigo-400 text-xl">{e.icon}</span></div>
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold mb-1 text-white">{e.school}</h3>
                  <p className="text-sm text-indigo-400 font-medium">{e.degree}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{e.date}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {e.cgpa && <span className="inline-block px-3 py-1 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full text-xs font-semibold">CGPA: {e.cgpa}</span>}
                    <span className="text-xs text-gray-400">{e.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="relative z-10 py-24" id="skills">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">05</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Skills</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title:"Frontend", icon:<Layout className="w-5 h-5 text-indigo-400" />, skills:["React","Next.js","TypeScript","Tailwind CSS","Framer Motion","Three.js","HTML/CSS"] },
              { title:"Backend", icon:<Server className="w-5 h-7 text-indigo-400" />, skills:["Node.js","Express",".NET","ASP.NET Web API","Python","Java","Flask"] },
              { title:"Database", icon:<Database className="w-5 h-5 text-indigo-400" />, skills:["SQL Server","MongoDB","MySQL","Supabase","SQLite","pgvector"] },
              { title:"Cloud & DevOps", icon:<Cloud className="w-5 h-5 text-indigo-400" />, skills:["Azure AD","Microsoft Entra ID","Oracle APEX","Git","GitHub Actions"] },
              { title:"AI & ML", icon:<Bot className="w-5 h-5 text-indigo-400" />, skills:["Gemini API","Groq","Ollama","AI Integration","Spaced Repetition"] },
              { title:"Languages & Tools", icon:<Wrench className="w-5 h-5 text-indigo-400" />, skills:["Java","Python","C","JavaScript","DSA","Streamlit","OpenPyXL"] },
            ].map((c, i) => (
              <div key={c.title} data-aos="fade-up" data-aos-delay={i * 80} className="skill-category spotlight-card glass rounded-2xl p-7 hover:-translate-y-[3px] hover:shadow-card-md transition-all duration-300 reveal">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold mb-4 flex items-center gap-2.5 text-white"><span>{c.icon}</span> {c.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <span key={s} className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-xs font-medium text-gray-400 hover:border-indigo-500/15 hover:text-indigo-400 transition-all">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="relative z-10 py-24" id="certifications">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">06</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Certifications</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:<Cloud className="w-5 h-5 text-indigo-400" />, title:"Oracle APEX Cloud Developer", issuer:"Oracle", date:"Oct 2025 — Oct 2027", pdf:"/Oracle_APEX_Cert.pdf" },
              { icon:<Code2 className="w-5 h-5 text-indigo-400" />, title:"DSA using Java", issuer:"NPTEL", date:"Nov 2025", pdf:"/NPTEL_DSA_Java.pdf" },
              { icon:<Database className="w-5 h-5 text-indigo-400" />, title:"Database Management System", issuer:"NPTEL", date:"Jan 2026", pdf:"/NPTEL_DBMS.pdf" },
              { icon:<Cog className="w-5 h-5 text-indigo-400" />, title:"OOP Fundamentals", issuer:"NPTEL", date:"Apr 2025", pdf:"/NPTEL_OOP.pdf" },
              { icon:<Code2 className="w-5 h-5 text-indigo-400" />, title:"C For Beginners", issuer:"Great Learning", date:"Aug 2024", pdf:"/Great_Learning_C.pdf" },
              { icon:<Trophy className="w-5 h-5 text-indigo-400" />, title:"HackTrax 2.0", issuer:"Alexa Developers SRM", date:"Hackathon Participation", pdf:"/HackTrax_Certificate.pdf" },
              { icon:<Code2 className="w-5 h-5 text-indigo-400" />, title:"Programming in C", issuer:"Baroda Institute of Technology", date:"Apr 2025", pdf:"/C_Language_BIT_Cert.pdf" },
            ].map((c, i) => (
              <a key={c.title} href={c.pdf} target="_blank" rel="noopener noreferrer" data-aos="fade-up" data-aos-delay={Math.min(i * 50, 300)} className="cert-card spotlight-card glass rounded-2xl p-7 text-center hover:-translate-y-[3px] hover:shadow-card-md hover:border-indigo-500/15 transition-all duration-300 reveal cursor-pointer">
                <div className="w-[50px] h-[50px] mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-sky-500/10 flex items-center justify-center"><span className="text-indigo-400 text-xl">{c.icon}</span></div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-[0.95rem] font-bold mb-1 text-white">{c.title}</h3>
                <p className="text-sm text-indigo-400 font-medium mb-0.5">{c.issuer}</p>
                <p className="text-[0.78rem] text-gray-500">{c.date}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Honors & Awards */}
      <section className="relative z-10 py-24" id="honors">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">07</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Honors & Awards</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon:<Trophy className="w-5 h-5 text-rose-500" />, title:"Toppers of 4th Semester — D1 Section (SRM)", detail:"SGPA 9.7 · Jun 2026", proof:"/SEM1_Toppers.jpg" },
              { icon:<Trophy className="w-5 h-5 text-rose-500" />, title:"Toppers of 2nd Semester — D1 Section (SRM)", detail:"SGPA 9.476 · Jun 2025", proof:"/SEM2_Toppers.jpg" },
              { icon:<Trophy className="w-5 h-5 text-rose-500" />, title:"Toppers of 1st Semester — D1 Section (SRM)", detail:"SGPA 9.33 · Jan 2025", proof:"/SEM1_Toppers.jpg" },
              { icon:<Award className="w-5 h-5 text-rose-500" />, title:"Proficiency in English", detail:"Delhi Public School Vadodara · 2021-22", proof:"/Proficiency_English.jpg" },
              { icon:<Award className="w-5 h-5 text-rose-500" />, title:"Proficiency in Mathematics", detail:"Delhi Public School Vadodara · 2017-19", proof:"/Proficiency_Math_17.jpg" },
            ].map((h, i) => (
              <div key={h.title} onClick={() => setModal({ open: true, title: h.title, type: "image", src: h.proof })} data-aos="fade-up" data-aos-delay={i * 80} className="honor-item spotlight-card glass flex items-center gap-5 rounded-[10px] py-5 px-7 hover:-translate-y-0.5 hover:shadow-card-md transition-all duration-300 reveal cursor-pointer">
                <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-rose-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0"><span className="text-rose-500">{h.icon}</span></div>
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-[0.95rem] font-semibold mb-0.5 text-white">{h.title}</h3>
                  <p className="text-xs text-gray-500">{h.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="relative z-10 py-24" id="achievements">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">08</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Achievements</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:<FileText className="w-5 h-5 text-indigo-400" />, title:"Internship Completion Certificate", issuer:"Linde Engineering India Pvt. Ltd.", date:"Jun — Jul 2026", link:"/Internship_Completion_Certificate_of_Shlok_Sathwara.pdf" },
              { icon:<Star className="w-5 h-5 text-indigo-400" />, title:"Certificate of Appreciation", issuer:"Linde Engineering India Pvt. Ltd.", date:"Jul 2026", link:"/Certification of Appreciation.pdf" },
              { icon:<Award className="w-5 h-5 text-indigo-400" />, title:"Letter of Recommendation", issuer:"Linde Engineering India Pvt. Ltd.", date:"Jul 2026", link:"/Certification of Recommendation.pdf" },
              { icon:<Code2 className="w-5 h-5 text-indigo-400" />, title:"HackTrax 2.0 — Certificate of Participation", issuer:"Alexa Developers SRM", date:"Hackathon", link:"/HackTrax_Certificate.pdf" },
            ].map((a, i) => (
              <a key={a.title} href={a.link} target="_blank" rel="noopener noreferrer" data-aos="fade-up" data-aos-delay={i * 80} className="achievement-card spotlight-card glass flex flex-col items-center text-center rounded-2xl p-8 text-decoration-none text-inherit hover:-translate-y-[3px] hover:shadow-card-lg hover:border-indigo-500/20 transition-all duration-300 reveal">
                <div className="w-[56px] h-[56px] mb-4 rounded-full bg-gradient-to-br from-indigo-500/[0.12] to-purple-500/[0.12] flex items-center justify-center"><span className="text-xl">{a.icon}</span></div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold mb-1 text-white">{a.title}</h3>
                <p className="text-sm text-indigo-400 font-medium">{a.issuer}</p>
                <p className="text-[0.78rem] text-gray-500 mt-0.5 mb-4">{a.date}</p>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500/[0.06] border border-indigo-500/[0.12] rounded-full text-[0.78rem] font-semibold text-indigo-400"><ExternalLink className="w-3.5 h-3.5" /> View PDF</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24" id="testimonials">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">09</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">What They Say</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { text:["Shlok consistently demonstrated a strong desire to understand the purpose and business value behind the Linde Helpdesk Portal before starting development. His curiosity and eagerness to learn enabled him to quickly grasp both frontend and backend technologies and deliver high-quality solutions.","He approached challenges with a positive attitude, remained composed under pressure, and adapted quickly to changing requirements without losing momentum. His dedication, ownership, and professionalism made a positive impact on the project and the team."], name:"Miteshkumar Mehta", role:"IT Department, Linde Engineering India", initials:"MM" },
              { text:["During your six-week internship, you demonstrated a commendable level of enthusiasm, commitment, and aptitude for application development. You successfully developed a prototype application and consistently exhibited a proactive approach toward understanding user requirements.","Your willingness to listen, learn, and incorporate feedback reflected a mature and professional approach. You left a positive impression as a reliable, dedicated, and capable IT professional in the making."], name:"Mehul Vaidya", role:"Dy. Manager - Facility Management, Linde Engineering India", initials:"MV" },
            ].map((t, i) => (
              <div key={t.name} data-aos="fade-up" data-aos-delay={i * 100} className="testimonial-card spotlight-card glass rounded-2xl p-8 hover:-translate-y-[3px] hover:shadow-card-md hover:border-indigo-500/15 transition-all duration-300 reveal">
                <div className="mb-4"><FileText className="w-6 h-6 text-indigo-500 opacity-30" /></div>
                {t.text.map((p,i) => <p key={i} className="text-[0.9rem] text-gray-400 leading-[1.7] mb-4 italic">{p}</p>)}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/[0.06]">
                  <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{t.initials}</div>
                  <div>
                    <h4 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-[0.78rem] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="relative z-10 py-24 text-center" id="contact">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-center gap-5 mb-14 reveal">
            <span className="section-tag font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-500">10</span>
            <h2 className="section-title font-[family-name:var(--font-space-grotesk)] text-[2.2rem] font-extrabold tracking-[-0.02em] text-white">Let&apos;s Connect</h2>
            <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent"></div>
          </div>
          <p className="text-xl text-gray-400 max-w-[520px] mx-auto mb-10 leading-[1.8] reveal">Have a project in mind or just want to chat? I&apos;m always open to new opportunities and interesting conversations.</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              { icon:<Mail className="w-5 h-5" />, label:"shloksathwara2@gmail.com", url:"mailto:shloksathwara2@gmail.com" },
              { icon:<LinkedinIcon className="w-5 h-5" />, label:"LinkedIn", url:"https://www.linkedin.com/in/shlok-sathwara-4b91ab319/" },
              { icon:<GithubIcon className="w-5 h-5" />, label:"GitHub", url:"https://github.com/ShlokSathwara2" },
              { icon:<Code2 className="w-5 h-5" />, label:"LeetCode", url:"https://leetcode.com/u/Shlok_Sathwara/" },
            ].map((c) => (
              <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer" className="contact-link-item flex items-center gap-3 py-4 px-7 glass rounded-[10px] text-sm font-medium text-gray-300 hover:-translate-y-[3px] hover:shadow-card-md hover:border-indigo-500 hover:text-indigo-400 transition-all duration-300">
                <span>{c.icon}</span> {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/[0.06]">
        <p className="text-xs text-gray-500">&copy; 2026 Shlok Sathwara. Built with passion.</p>
      </footer>
      <ProofModal open={modal.open} onClose={() => setModal(m => ({...m, open: false}))} title={modal.title} type={modal.type} src={modal.src} />
    </>
  );
}
