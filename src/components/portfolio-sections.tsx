"use client";

import { useEffect } from "react";
import {
  AboutSection,
  AchievementsSection,
  BuildingSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  HonorsSection,
  ResearchSection,
  SiteFooter,
} from "./portfolio/sections";
import ProjectsSection from "./portfolio/projects";
import SkillsSection from "./portfolio/skills-physics";
import TestimonialsSection from "./portfolio/testimonials";

export default function PortfolioSections() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <AboutSection />
      <ExperienceSection />
      <ResearchSection />
      <BuildingSection />
      <ProjectsSection />
      <EducationSection />
      <SkillsSection />
      <CertificationsSection />
      <HonorsSection />
      <AchievementsSection />
      <TestimonialsSection />
      <ContactSection />
      <SiteFooter />
    </>
  );
}
