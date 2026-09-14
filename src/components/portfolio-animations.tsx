"use client";

import { useEffect, useRef, useState } from "react";

export default function PortfolioAnimations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // ══════════════════════════════════════════
    // 1. MAGNETIC CURSOR (dot + trail)
    // ══════════════════════════════════════════
    const cursorDot = document.createElement("div");
    const cursorTrail = document.createElement("div");
    cursorDot.className = "cursor-dot";
    cursorTrail.className = "cursor-trail";
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorTrail);

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top = mouseY + "px";
    };
    document.addEventListener("mousemove", onMouseMove);

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      cursorTrail.style.left = trailX + "px";
      cursorTrail.style.top = trailY + "px";
      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Cursor hover states
    const hoverTargets = document.querySelectorAll(
      "a, button, .project-card, .stat-card, .skill-category, .cert-card, .honor-item, .education-card, .achievement-card, .testimonial-card, .building-card"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorDot.classList.add("cursor-hover");
        cursorTrail.classList.add("cursor-hover");
      });
      el.addEventListener("mouseleave", () => {
        cursorDot.classList.remove("cursor-hover");
        cursorTrail.classList.remove("cursor-hover");
      });
    });

    // Magnetic effect on buttons and links
    const magneticEls = document.querySelectorAll(
      ".btn-explore, .btn-outline, .nav-cta, .social-link, .nav-link"
    );
    magneticEls.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const me = e as MouseEvent;
        const x = me.clientX - rect.left - rect.width / 2;
        const y = me.clientY - rect.top - rect.height / 2;
        (el as HTMLElement).style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        (el as HTMLElement).style.transition = "transform 0.2s ease";
      });
      el.addEventListener("mouseleave", () => {
        (el as HTMLElement).style.transform = "translate(0, 0)";
        (el as HTMLElement).style.transition =
          "transform 0.5s cubic-bezier(0.03, 0.98, 0.52, 0.99)";
      });
    });

    // ══════════════════════════════════════════
    // 2. TEXT SCRAMBLE ON SCROLL
    // ══════════════════════════════════════════
    const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    class TextScramble {
      el: HTMLElement;
      originalText: string;
      isScrambled: boolean;
      constructor(el: HTMLElement) {
        this.el = el;
        this.originalText = el.textContent || "";
        this.isScrambled = false;
      }
      scramble() {
        if (this.isScrambled) return;
        this.isScrambled = true;
        const original = this.originalText;
        const len = original.length;
        let iteration = 0;
        const maxIterations = len * 2;
        const interval = setInterval(() => {
          this.el.textContent = original
            .split("")
            .map((char, i) => {
              if (i < iteration / 2) return original[i];
              if (char === " ") return " ";
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            })
            .join("");
          iteration++;
          if (iteration > maxIterations) {
            clearInterval(interval);
            this.el.textContent = original;
          }
        }, 30);
      }
    }

    const scrambleEls = document.querySelectorAll<HTMLElement>(".section-title, .hero-name");
    scrambleEls.forEach((el) => {
      const instance = new TextScramble(el);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              instance.scramble();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
    });

    // ══════════════════════════════════════════
    // 3. INTERACTIVE PARTICLE BACKGROUND
    // ══════════════════════════════════════════
    const heroSection = document.querySelector(".hero-section") as HTMLElement;
    if (heroSection) {
      const particleCanvas = document.createElement("canvas");
      particleCanvas.id = "particleCanvas";
      particleCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;";
      heroSection.style.position = "relative";
      heroSection.insertBefore(particleCanvas, heroSection.firstChild);

      const ctx = particleCanvas.getContext("2d");
      const particles: {
        x: number; y: number; vx: number; vy: number; radius: number; opacity: number;
      }[] = [];
      const particleCount = 80;
      const connectionDistance = 120;
      let particleMouseX = 0, particleMouseY = 0;

      function resizeCanvas() {
        particleCanvas.width = heroSection.offsetWidth;
        particleCanvas.height = heroSection.offsetHeight;
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      heroSection.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = heroSection.getBoundingClientRect();
        particleMouseX = e.clientX - rect.left;
        particleMouseY = e.clientY - rect.top;
      });

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * particleCanvas.width,
          y: Math.random() * particleCanvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }

      function animateParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          const dx = p.x - particleMouseX;
          const dy = p.y - particleMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx += (dx / dist) * force * 0.5;
            p.vy += (dy / dist) * force * 0.5;
          }

          p.vx *= 0.99;
          p.vy *= 0.99;

          if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
          ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
              const opacity = (1 - dist / connectionDistance) * 0.15;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        requestAnimationFrame(animateParticles);
      }
      animateParticles();
    }

    // ══════════════════════════════════════════
    // 4. ENHANCED 3D CARD TILT + GLARE
    // ══════════════════════════════════════════
    document
      .querySelectorAll(
        ".project-card, .stat-card, .skill-category, .cert-card, .education-card, .achievement-card, .testimonial-card, .building-card, .honor-item"
      )
      .forEach((card) => {
        const glare = document.createElement("div");
        glare.className = "card-glare";
        card.appendChild(glare);

        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const me = e as MouseEvent;
          const x = me.clientX - rect.left;
          const y = me.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const tiltX = ((y - centerY) / centerY) * -8;
          const tiltY = ((x - centerX) / centerX) * 8;
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;

          (card as HTMLElement).style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px) scale(1.02)`;
          (card as HTMLElement).style.transition = "transform 0.1s ease";
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
          glare.style.opacity = "1";
        });

        card.addEventListener("mouseleave", () => {
          (card as HTMLElement).style.transform =
            "perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)";
          (card as HTMLElement).style.transition =
            "transform 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99)";
          glare.style.opacity = "0";
        });
      });

    // ══════════════════════════════════════════
    // 5. PARALLAX SCROLLING
    // ══════════════════════════════════════════
    const parallaxElements = document.querySelectorAll<HTMLElement>(
      ".hero-photo-wrapper"
    );

    function updateParallax() {
      const scrollY = window.scrollY;
      parallaxElements.forEach((el, i) => {
        const speed = (i + 1) * 0.15;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }
    window.addEventListener("scroll", () => {
      requestAnimationFrame(updateParallax);
    });

    // ══════════════════════════════════════════
    // 7. SCROLL PROGRESS BAR
    // ══════════════════════════════════════════
    const progressBar = document.createElement("div");
    progressBar.id = "scrollProgress";
    document.body.prepend(progressBar);

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = progress + "%";
    });

    // ══════════════════════════════════════════
    // 8. COUNTER COUNT-UP
    // ══════════════════════════════════════════
    const statNumbers = document.querySelectorAll<HTMLElement>(".stat-number");
    let countersStarted = false;

    function animateCounter(el: HTMLElement) {
      const text = el.textContent || "";
      const hasPlus = text.includes("+");
      const target = parseFloat(text.replace("+", ""));
      const isDecimal = text.includes(".");
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased =
          progress === 1
            ? 1
            : 1 - Math.pow(2, -10 * progress) * Math.cos(((progress * 10 - 0.75) * (2 * Math.PI)) / 3);
        const current = eased * target;
        el.textContent =
          (isDecimal ? current.toFixed(2) : Math.floor(current)) + (hasPlus ? "+" : "");
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      el.textContent = isDecimal ? "0.00" : "0";
      requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            statNumbers.forEach((el) => animateCounter(el));
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsSection = document.querySelector(".stats-section");
    if (statsSection) counterObserver.observe(statsSection);

    // ══════════════════════════════════════════
    // 9. SVG PATH DRAWING (section tags)
    // ══════════════════════════════════════════
    const sectionTags = document.querySelectorAll<HTMLElement>(".section-tag");
    sectionTags.forEach((tag) => {
      const text = tag.textContent || "";
      tag.textContent = "";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 50 30");
      svg.setAttribute("width", "50");
      svg.setAttribute("height", "30");
      svg.classList.add("section-tag-svg");

      const pathText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      pathText.setAttribute("x", "25");
      pathText.setAttribute("y", "22");
      pathText.setAttribute("text-anchor", "middle");
      pathText.setAttribute("fill", "none");
      pathText.setAttribute("stroke", "currentColor");
      pathText.setAttribute("stroke-width", "0.5");
      pathText.setAttribute("font-size", "16");
      pathText.setAttribute("font-family", "Space Grotesk, sans-serif");
      pathText.setAttribute("font-weight", "700");
      pathText.textContent = text;

      pathText.setAttribute("stroke-dasharray", "100");
      pathText.setAttribute("stroke-dashoffset", "100");

      svg.appendChild(pathText);
      tag.appendChild(svg);

      const svgObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              pathText.style.transition = "stroke-dashoffset 1.5s ease, fill 0.5s ease 1s";
              pathText.setAttribute("stroke-dashoffset", "0");
              pathText.setAttribute("fill", "currentColor");
              svgObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      svgObserver.observe(tag);
    });

    // ══════════════════════════════════════════
    // 10. RIPPLE CLICK EFFECT
    // ══════════════════════════════════════════
    function createRipple(e: Event) {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const me = e as MouseEvent;
      const size = Math.max(rect.width, rect.height) * 2;
      const x = me.clientX - rect.left - size / 2;
      const y = me.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${size}px;height:${size}px;left:${x}px;top:${y}px;
        background:radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%);
        transform:scale(0);animation:ripple-expand 0.6s ease-out forwards;
        z-index:10;
      `;

      el.style.position = el.style.position || "relative";
      el.style.overflow = "hidden";
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    document
      .querySelectorAll(
        ".btn-explore, .btn-outline, .nav-cta, .social-link, .contact-link-item, .stat-card, .honor-item, .achievement-card, .testimonial-card"
      )
      .forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.position = "relative";
        htmlEl.style.overflow = "hidden";
        htmlEl.addEventListener("click", createRipple);
      });

    const rippleStyle = document.createElement("style");
    rippleStyle.textContent = `
      @keyframes ripple-expand {
        0%   { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(rippleStyle);

    // ══════════════════════════════════════════
    // SPOTLIGHT HOVER EFFECT
    // ══════════════════════════════════════════
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const me = e as MouseEvent;
        const rect = (card as HTMLElement).getBoundingClientRect();
        (card as HTMLElement).style.setProperty('--mouse-x', `${me.clientX - rect.left}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${me.clientY - rect.top}px`);
      });
    });

    // ══════════════════════════════════════════
    // NAVBAR SCROLL
    // ══════════════════════════════════════════
    window.addEventListener("scroll", () => {
      const nav = document.querySelector("nav");
      if (nav) {
        if (window.scrollY > 50) {
          nav.classList.add("scrolled");
        } else {
          nav.classList.remove("scrolled");
        }
      }
    });

    // ══════════════════════════════════════════
    // ACTIVE NAV LINK
    // ══════════════════════════════════════════
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll<HTMLElement>(".nav-link");

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.25 }
    );
    sections.forEach((section) => sectionObserver.observe(section));

    // ══════════════════════════════════════════
    // SMOOTH ANCHOR SCROLL
    // ══════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (anchor as HTMLAnchorElement).getAttribute("href") || "";
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobileMenu");
        const hamburger = document.getElementById("hamburgerBtn");
        if (mobileMenu) {
          mobileMenu.style.opacity = "0";
          mobileMenu.style.pointerEvents = "none";
        }
        if (hamburger) hamburger.classList.remove("active");
        document.body.style.overflow = "";
      });
    });

    // ══════════════════════════════════════════
    // MOBILE HAMBURGER MENU
    // ══════════════════════════════════════════
    const hamburger = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        const isOpen = mobileMenu.style.opacity === "1";
        mobileMenu.style.opacity = isOpen ? "0" : "1";
        mobileMenu.style.pointerEvents = isOpen ? "none" : "all";
        hamburger.classList.toggle("active");
        document.body.style.overflow = isOpen ? "" : "hidden";
      });
    }

    // ══════════════════════════════════════════
    // CLEANUP
    // ══════════════════════════════════════════
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cursorDot.remove();
      cursorTrail.remove();
      progressBar.remove();
      rippleStyle.remove();
    };
  }, [mounted]);

  return null;
}
