"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import {
  Bot,
  Cloud,
  Database,
  Layout,
  Server,
  Wrench,
} from "lucide-react";
import {
  allSkills,
  physicsSkills,
  skillGroups,
  type SkillGroup,
} from "./data";
import {
  SectionHeading,
  useMediaQuery,
  usePrefersReducedMotion,
} from "./primitives";

function SkillGroupIcon({ icon }: { icon: SkillGroup["icon"] }) {
  if (icon === "layout") return <Layout aria-hidden />;
  if (icon === "server") return <Server aria-hidden />;
  if (icon === "database") return <Database aria-hidden />;
  if (icon === "cloud") return <Cloud aria-hidden />;
  if (icon === "bot") return <Bot aria-hidden />;
  return <Wrench aria-hidden />;
}

type PhysicsItem = {
  body: Matter.Body;
  element: HTMLSpanElement;
  width: number;
  height: number;
};

export default function SkillsSection() {
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const itemsRef = useRef<PhysicsItem[]>([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const [active, setActive] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [version, setVersion] = useState(0);

  const visibleSkills = isMobile
    ? physicsSkills.slice(0, 12)
    : physicsSkills;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.5, 1] }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    resizeObserver.observe(container);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    if (size.width < 40 || size.height < 40) return;

    const elements = pillRefs.current
      .slice(0, visibleSkills.length)
      .filter((element): element is HTMLSpanElement => Boolean(element));
    if (elements.length === 0) return;

    const engine = Matter.Engine.create();
    engine.gravity.y = 1;
    engine.gravity.scale = 0.0012;

    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      friction: 0.2,
      restitution: 0.1,
    };

    const walls = [
      Matter.Bodies.rectangle(
        size.width / 2,
        size.height + 34,
        size.width + 200,
        68,
        wallOptions
      ),
      Matter.Bodies.rectangle(-34, size.height / 2, 68, size.height * 2, wallOptions),
      Matter.Bodies.rectangle(
        size.width + 34,
        size.height / 2,
        68,
        size.height * 2,
        wallOptions
      ),
    ];

    const items = elements.map((element) => {
      const width = Math.max(48, element.offsetWidth);
      const height = Math.max(28, element.offsetHeight);
      const x = width / 2 + Math.random() * Math.max(1, size.width - width);
      const y = -height - Math.random() * size.height * 0.9;
      const body = Matter.Bodies.rectangle(x, y, width, height, {
        restitution: 0.52,
        friction: 0.08,
        frictionAir: 0.014,
        angle: (Math.random() - 0.5) * 0.45,
        chamfer: { radius: height / 2 },
      });
      return { body, element, width, height };
    });

    items.forEach(({ body, element, width, height }) => {
      element.style.transform = `translate3d(${
        body.position.x - width / 2
      }px, ${body.position.y - height / 2}px, 0) rotate(${body.angle}rad)`;
    });

    Matter.Composite.add(engine.world, [
      ...walls,
      ...items.map((item) => item.body),
    ]);

    engineRef.current = engine;
    itemsRef.current = items;
    setVersion((value) => value + 1);

    return () => {
      itemsRef.current = [];
      engineRef.current = null;
      Matter.Composite.clear(engine.world, false, true);
      Matter.Engine.clear(engine);
    };
  }, [prefersReduced, size.width, size.height, visibleSkills.length]);

  useEffect(() => {
    if (prefersReduced || !active || !engineRef.current) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      const delta = Math.min(16.666, Math.max(1, now - last));
      last = now;

      const pointer = pointerRef.current;
      if (pointer.active) {
        for (const item of itemsRef.current) {
          const dx = item.body.position.x - pointer.x;
          const dy = item.body.position.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0.01 && distance < 150) {
            const force = 0.00055 * (1 - distance / 150);
            Matter.Body.applyForce(item.body, item.body.position, {
              x: (dx / distance) * force,
              y: (dy / distance) * force,
            });
          }
        }
      }

      Matter.Engine.update(engine, delta);

      for (const item of itemsRef.current) {
        item.element.style.transform = `translate3d(${
          item.body.position.x - item.width / 2
        }px, ${item.body.position.y - item.height / 2}px, 0) rotate(${
          item.body.angle
        }rad)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, version, prefersReduced]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    };
  };

  const onPointerLeave = () => {
    pointerRef.current.active = false;
  };

  return (
    <section id="skills" className="section skills-section">
      <div className="container">
        <SectionHeading index="07" label="SKILLS">
          MY TECHSTACK
        </SectionHeading>

        <div className="skills-intro" data-reveal>
          <p>
            The tools I reach for most. Drag or move through the stack and
            knock the pieces around — the list below has the full inventory.
          </p>
          <span className="skills-count">{allSkills.length} skills</span>
        </div>

        {prefersReduced ? (
          <div className="skills-static" data-reveal>
            {visibleSkills.map((skill, index) => (
              <span
                className={`skill-pill tone-${index % 4}`}
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div
            className="skills-playground"
            ref={containerRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            aria-hidden
          >
            <span className="skills-playground-label">
              <span className="status-dot" />
              Drag, tap or hover — the stack responds
            </span>
            <div className="skills-pills">
              {visibleSkills.map((skill, index) => (
                <span
                  className={`skill-pill tone-${index % 4}`}
                  key={skill}
                  ref={(element) => {
                    pillRefs.current[index] = element;
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
            <span className="skills-playground-hint">drag / tap / hover</span>
          </div>
        )}

        <ul className="sr-only">
          {allSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>

        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-group" key={group.title} data-reveal>
              <div className="skill-group-head">
                <span className="skill-group-icon">
                  <SkillGroupIcon icon={group.icon} />
                </span>
                <h3>{group.title}</h3>
              </div>
              <div className="chip-row">
                {group.skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
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
