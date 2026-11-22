"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, Menu, X } from "lucide-react";
import { contact, navLinks, socialLinks } from "./data";
import { SocialIcon } from "./primitives";

export default function SiteChrome() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tops: { id: string; top: number }[] = [];
    let frame = 0;

    const measure = () => {
      tops = navLinks
        .map((link) => {
          const element = document.getElementById(link.href.slice(1));
          return element
            ? {
                id: link.href.slice(1),
                top: element.getBoundingClientRect().top + window.scrollY,
              }
            : null;
        })
        .filter((item): item is { id: string; top: number } => Boolean(item));
    };

    const update = () => {
      const y = window.scrollY + 160;
      let current = "";
      let best = -1;
      for (const item of tops) {
        if (item.top <= y && item.top > best) {
          best = item.top;
          current = item.id;
        }
      }
      setActive((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const settle = window.setTimeout(onResize, 700);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const panel = menuPanelRef.current;
    const firstLink = panel?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${progress})`;
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
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      ring.classList.toggle(
        "is-hover",
        Boolean(target?.closest("a, button, [data-cursor]"))
      );
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden>
        <span ref={progressRef} />
      </div>

      <header className="site-nav">
        <div className="nav-inner">
          <a href="#top" className="nav-logo" aria-label="Shlok Sathwara — back to top">
            <span className="nav-logo-mark">SS</span>
            <span className="nav-logo-text">Shlok Sathwara</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => {
              const id = link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={active === id ? "is-active" : undefined}
                  aria-current={active === id ? "location" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="nav-actions">
            <a href="#contact" className="nav-cta">
              Let&apos;s Talk
              <ArrowUpRight aria-hidden />
            </a>
            <button
              type="button"
              className="nav-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          id="mobile-menu"
          className="mobile-menu"
          ref={menuPanelRef}
          data-lenis-prevent
        >
          <div className="mobile-menu-inner">
            <p className="section-kicker">
              <span className="section-index">MENU</span>
              EXPLORE
            </p>
            <nav aria-label="Mobile">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight aria-hidden />
                </a>
              ))}
            </nav>
            <div className="mobile-menu-footer">
              <div className="mobile-menu-socials">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <SocialIcon name={social.icon} />
                  </a>
                ))}
              </div>
              <a href={contact.resume} download className="btn btn-ghost">
                <Download aria-hidden />
                Resume
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <aside className="social-rail" aria-label="Social links">
        <span className="rail-line" aria-hidden />
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
          >
            <SocialIcon name={social.icon} />
          </a>
        ))}
        <span className="rail-line" aria-hidden />
      </aside>

      <a
        className="resume-fab"
        href={contact.resume}
        download
        aria-label="Download Shlok's resume"
      >
        <Download aria-hidden />
        <span>Resume</span>
      </a>

      <div
        className="cursor-dot"
        ref={dotRef}
        aria-hidden
        style={{ transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)" }}
      />
      <div
        className="cursor-ring"
        ref={ringRef}
        aria-hidden
        style={{ transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)" }}
      />
    </>
  );
}
