"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUp,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  Cloud,
  Code2,
  Cog,
  Database,
  Download,
  FileText,
  GraduationCap,
  MapPin,
  Quote,
  Star,
  Trophy,
} from "lucide-react";
import {
  aboutPanels,
  aboutParagraphs,
  achievements,
  buildingItems,
  certifications,
  contact,
  education,
  experiences,
  heroStats,
  honors,
  research,
  socialLinks,
  type AchievementItem,
  type CertificationItem,
  type HonorItem,
  type ProofTarget,
} from "./data";
import { RichText, SectionHeading, SocialIcon } from "./primitives";
import ProofModal from "../ui/proof-modal";

function CertificationIcon({ icon }: { icon: CertificationItem["icon"] }) {
  if (icon === "cloud") return <Cloud aria-hidden />;
  if (icon === "code") return <Code2 aria-hidden />;
  if (icon === "database") return <Database aria-hidden />;
  if (icon === "cog") return <Cog aria-hidden />;
  return <Trophy aria-hidden />;
}

function AchievementIcon({ icon }: { icon: AchievementItem["icon"] }) {
  if (icon === "file") return <FileText aria-hidden />;
  if (icon === "star") return <Star aria-hidden />;
  if (icon === "award") return <Award aria-hidden />;
  return <Code2 aria-hidden />;
}

function HonorIcon({ icon }: { icon: HonorItem["icon"] }) {
  return icon === "trophy" ? <Trophy aria-hidden /> : <Award aria-hidden />;
}

export function AboutSection() {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <SectionHeading index="01" label="ABOUT">
          WHAT I DO
        </SectionHeading>

        <div className="about-grid">
          <div className="about-portrait" data-reveal>
            <div className="about-portrait-frame">
              <Image
                src="/profile-new.webp"
                alt="Shlok Sathwara"
                fill
                sizes="(max-width: 900px) 80vw, 34vw"
                className="about-portrait-photo"
              />
              <span className="about-portrait-glow" aria-hidden />
              <span className="about-portrait-grid" aria-hidden />
            </div>
            <div className="about-portrait-meta">
              <span className="status-dot" />
              Vadodara, India
              <span className="about-portrait-sep" />
              Open to 2027 roles
            </div>
          </div>

          <div className="about-copy">
            {aboutParagraphs.map((paragraph, index) => (
              <div className="about-paragraph" data-reveal key={index}>
                <RichText text={paragraph} />
              </div>
            ))}

            <div className="about-stats" data-reveal>
              {heroStats.map((stat) => (
                <div className="about-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="about-oracle" data-reveal>
              <BadgeCheck aria-hidden />
              <span>
                <strong>Oracle APEX Cloud Developer</strong> certified · 2025–2027
              </span>
            </div>
          </div>
        </div>

        <div className="about-panels">
          {aboutPanels.map((panel) => (
            <article className="about-panel" data-reveal key={panel.title}>
              <div className="about-panel-head">
                <span className="about-panel-index">{panel.label}</span>
                <h3>{panel.title}</h3>
              </div>
              <p>{panel.body}</p>
              <div className="chip-row">
                {panel.chips.map((chip) => (
                  <span className="chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExperienceSection() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    let frame = 0;

    const update = () => {
      const rect = timeline.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.78 - rect.top) / Math.max(1, rect.height))
      );
      timeline.style.setProperty("--timeline-fill", `${progress * 100}%`);
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

  return (
    <section id="experience" className="section experience-section">
      <div className="container">
        <SectionHeading index="02" label="EXPERIENCE">
          MY CAREER &amp; EXPERIENCE
        </SectionHeading>

        <div className="experience-intro" data-reveal>
          <p>
            A short timeline of the rooms I have worked in, the teams I have
            led, and the products I have shipped. Each stop left a stack and a
            lesson behind.
          </p>
          <div className="experience-intro-meta">
            <span>
              <span className="status-dot" /> 2 industry experiences
            </span>
            <span>Linde Engineering · Aaruush</span>
          </div>
        </div>

        <div className="timeline" ref={timelineRef}>
          <span className="timeline-line" aria-hidden>
            <span className="timeline-fill" />
          </span>

          {experiences.map((item) => (
            <article
              className="timeline-item"
              key={`${item.company}-${item.period}`}
              data-reveal
            >
              <div className="timeline-marker" aria-hidden>
                <span />
              </div>
              <div className="timeline-period">{item.period}</div>
              <div className="timeline-card">
                <div className="timeline-card-head">
                  <div>
                    <h3>{item.role}</h3>
                    <p>{item.company}</p>
                  </div>
                  <span className="timeline-meta">{item.meta}</span>
                </div>

                {item.summary ? (
                  <p className="timeline-summary">{item.summary}</p>
                ) : null}

                {item.bullets.length > 0 ? (
                  <ul className="timeline-bullets">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}

                {item.stack ? (
                  <div className="chip-row">
                    {item.stack.map((tech) => (
                      <span className="chip" key={tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.quote ? (
                  <blockquote className="timeline-quote">
                    <Quote aria-hidden />
                    <p>{item.quote.text}</p>
                    <cite>{item.quote.author}</cite>
                  </blockquote>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResearchSection() {
  const [proof, setProof] = useState<ProofTarget | null>(null);

  return (
    <section id="publication" className="section research-section">
      <div className="container">
        <SectionHeading index="03" label="RESEARCH">
          RESEARCH &amp; BUILDING
        </SectionHeading>

        <article className="research-card" data-reveal>
          <div className="research-card-copy">
            <span className="research-status">
              <BadgeCheck aria-hidden />
              Accepted · ICICCS 2026
            </span>
            <h3>{research.title}</h3>
            <p className="research-conference">{research.conference}</p>
            <RichText
              text={research.description}
              className="research-description"
            />
            <div className="chip-row">
              {research.metrics.map((metric) => (
                <span className="chip" key={metric}>
                  {metric}
                </span>
              ))}
            </div>
            <div className="research-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setProof({
                    title: "ICICCS 2026 — Acceptance",
                    type: "image",
                    src: research.acceptanceImage,
                  })
                }
              >
                View acceptance
                <ArrowUpRight aria-hidden />
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  setProof({
                    title: "ICICCS 2026 — Paper",
                    type: "pdf",
                    src: research.acceptancePdf,
                  })
                }
              >
                Open PDF
              </button>
            </div>
          </div>

          <div className="research-visual" aria-hidden>
            <span className="research-grid" />
            <span className="research-orb" />
            <div className="research-big-number">
              98<span>%</span>
            </div>
            <p>accuracy</p>
            <span className="research-visual-note">
              Random Forest · CICIDS2017
            </span>
          </div>
        </article>

        {proof ? (
          <ProofModal
            open
            onClose={() => setProof(null)}
            title={proof.title}
            type={proof.type}
            src={proof.src}
          />
        ) : null}
      </div>
    </section>
  );
}

export function BuildingSection() {
  return (
    <section id="building" className="section building-section">
      <div className="container">
        <div className="building-head" data-reveal>
          <p className="section-kicker">
            <span className="section-index">04</span>
            CURRENTLY BUILDING
          </p>
          <h2 className="display">SHIPPING IN PUBLIC</h2>
          <p>
            Three products in the workshop right now. Each one starts with a
            real annoyance and ends with a tool I actually use.
          </p>
        </div>

        <div className="building-stack">
          {buildingItems.map((item, index) => (
            <article
              className={`building-card accent-${item.accent}`}
              key={item.title}
              data-reveal
              style={{ "--i": index } as React.CSSProperties}
            >
              <div className="building-card-head">
                <span className="building-status">
                  <span className="status-dot" />
                  {item.status}
                </span>
                <span className="building-index">0{index + 1}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="building-features">
                {item.features.map((feature) => (
                  <span key={feature}>
                    <Check aria-hidden />
                    {feature}
                  </span>
                ))}
              </div>
              <div className="chip-row">
                {item.stack.map((tech) => (
                  <span className="chip" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EducationSection() {
  return (
    <section id="education" className="section education-section">
      <div className="container">
        <SectionHeading index="06" label="EDUCATION">
          WHERE I LEARNED
        </SectionHeading>

        <div className="education-grid">
          {education.map((item) => (
            <article className="education-card" data-reveal key={item.school}>
              <div className="education-card-head">
                <span className="education-icon">
                  {item.icon === "building" ? (
                    <Building2 aria-hidden />
                  ) : (
                    <GraduationCap aria-hidden />
                  )}
                </span>
                <span className="education-period">{item.period}</span>
              </div>
              <h3>{item.school}</h3>
              <p className="education-degree">{item.degree}</p>
              {item.cgpa ? (
                <div className="education-cgpa">
                  <strong>{item.cgpa}</strong>
                  <span>CGPA</span>
                </div>
              ) : null}
              <p className="education-detail">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CertificationsSection() {
  return (
    <section id="certifications" className="section certifications-section">
      <div className="container">
        <SectionHeading index="08" label="CERTIFICATIONS">
          CREDENTIALS
        </SectionHeading>

        <div className="cert-grid">
          {certifications.map((cert) => (
            <a
              className="cert-card"
              href={cert.pdf}
              target="_blank"
              rel="noopener noreferrer"
              key={cert.title}
              data-reveal
            >
              <div className="cert-card-top">
                <span className="cert-icon">
                  <CertificationIcon icon={cert.icon} />
                </span>
                <span className="cert-issuer">{cert.issuer}</span>
              </div>
              <h3>{cert.title}</h3>
              <span className="cert-date">{cert.date}</span>
              <span className="cert-link">
                View PDF
                <ArrowUpRight aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HonorsSection() {
  const [proof, setProof] = useState<ProofTarget | null>(null);

  return (
    <section id="honors" className="section honors-section">
      <div className="container">
        <SectionHeading index="09" label="HONORS">
          RECOGNITION
        </SectionHeading>

        <div className="honors-list">
          {honors.map((honor) => (
            <button
              type="button"
              className="honor-card"
              key={honor.title}
              data-reveal
              onClick={() =>
                setProof({
                  title: honor.title,
                  type: "image",
                  src: honor.proof,
                })
              }
            >
              <span className="honor-icon">
                <HonorIcon icon={honor.icon} />
              </span>
              <span className="honor-copy">
                <strong>{honor.title}</strong>
                <span>{honor.detail}</span>
              </span>
              <span className="honor-link">
                View proof
                <ArrowUpRight aria-hidden />
              </span>
            </button>
          ))}
        </div>

        {proof ? (
          <ProofModal
            open
            onClose={() => setProof(null)}
            title={proof.title}
            type={proof.type}
            src={proof.src}
          />
        ) : null}
      </div>
    </section>
  );
}

export function AchievementsSection() {
  return (
    <section id="achievements" className="section achievements-section">
      <div className="container">
        <SectionHeading index="10" label="ACHIEVEMENTS">
          PROOF OF WORK
        </SectionHeading>

        <div className="achievements-grid">
          {achievements.map((item) => (
            <a
              className="achievement-card"
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              key={item.title}
              data-reveal
            >
              <div className="achievement-card-top">
                <span className="achievement-icon">
                  <AchievementIcon icon={item.icon} />
                </span>
                <span className="achievement-date">{item.date}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.issuer}</p>
              <span className="achievement-link">
                View PDF
                <ArrowUpRight aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="contact-head" data-reveal>
          <p className="section-kicker">
            <span className="section-index">12</span>
            CONTACT
          </p>
          <h2 className="contact-title">
            LET&apos;S
            <br />
            <span>TALK.</span>
          </h2>
          <p className="contact-copy">{contact.intro}</p>
        </div>

        <div className="contact-grid">
          <a
            className="contact-email"
            href={`mailto:${contact.email}`}
            data-reveal
          >
            <span>Email me</span>
            <strong>{contact.email}</strong>
            <ArrowUpRight aria-hidden />
          </a>

          <div className="contact-side" data-reveal>
            <p className="contact-location">
              <MapPin aria-hidden />
              {contact.location}
            </p>
            <div className="contact-socials">
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
              Download resume
            </a>
          </div>
        </div>

        <div className="contact-marquee" aria-hidden>
          <span>AVAILABLE FOR WORK</span>
          <span className="contact-marquee-dot" />
          <span>LET&apos;S BUILD SOMETHING</span>
          <span className="contact-marquee-dot" />
          <span>AVAILABLE FOR WORK</span>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="nav-logo-mark">SS</span>
          <p>© 2026 Shlok Sathwara. All rights reserved.</p>
        </div>
        <p className="footer-note">
          Built with Next.js, React Three Fiber, GSAP &amp; Matter.js.
        </p>
        <a href="#top" className="footer-top">
          Back to top
          <ArrowUp aria-hidden />
        </a>
      </div>
    </footer>
  );
}
