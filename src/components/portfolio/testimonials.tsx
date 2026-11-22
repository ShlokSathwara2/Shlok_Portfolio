"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "./data";
import { SectionHeading, usePrefersReducedMotion } from "./primitives";

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced || paused) return;
    const interval = window.setInterval(() => {
      setIndex((value) => (value + 1) % testimonials.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [paused, prefersReduced]);

  const go = (direction: number) => {
    setIndex(
      (value) =>
        (value + direction + testimonials.length) % testimonials.length
    );
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container">
        <SectionHeading index="11" label="TESTIMONIALS">
          WHAT PEOPLE SAY
        </SectionHeading>

        <div
          className="testimonials-carousel"
          ref={regionRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={onKeyDown}
        >
          <div className="testimonials-viewport">
            {testimonials.map((testimonial, slideIndex) => (
              <article
                className={`testimonial-slide${
                  slideIndex === index ? " is-active" : ""
                }`}
                key={testimonial.name}
                aria-hidden={slideIndex !== index}
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} of ${testimonials.length}`}
              >
                <Quote className="testimonial-quote-icon" aria-hidden />
                <div className="testimonial-text">
                  {testimonial.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="testimonial-author">
                  <span className="testimonial-avatar">
                    {testimonial.initials}
                  </span>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="testimonial-controls">
            <div className="testimonial-dots">
              {testimonials.map((testimonial, dotIndex) => (
                <button
                  key={testimonial.name}
                  type="button"
                  className={dotIndex === index ? "is-active" : undefined}
                  aria-label={`Go to testimonial ${dotIndex + 1}`}
                  aria-current={dotIndex === index ? "true" : undefined}
                  onClick={() => setIndex(dotIndex)}
                />
              ))}
            </div>
            <div className="testimonial-arrows">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
              >
                <ChevronRight aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
