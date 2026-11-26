"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Centerpiece from "./Centerpiece";
import ProjectCard3D from "./ProjectCard3D";
import type { ProjectItem } from "./projects-data";

/* ═══════════════════════════════════════════════════════════════════════════
   TUNABLE CONSTANTS — adjust these to change the feel of the orbit
   ═══════════════════════════════════════════════════════════════════════════ */
export const WORK_TUNING = {
  // The projects travel down an inclined spiral around the orb.
  orbitTiltDeg: 60,
  orbitRadiusTopDesktop: 5.0,
  orbitRadiusBottomDesktop: 6.0,
  orbitRadiusTopMobile: 3.5,
  orbitRadiusBottomMobile: 4.4,
  helixSpanDesktop: 6.0,
  helixSpanMobile: 4.0,

  cardWidthDesktop: 1.85,
  cardHeightDesktop: 1.22,
  cardWidthMobile: 1.28,
  cardHeightMobile: 0.84,
  cardCornerRadius: 0.12,
  cardPadding: 0.22,

  // Distance from the active card to the camera.
  cameraDistanceDesktop: 5.0,
  cameraDistanceMobile: 5.0,
  cameraFovDesktop: 42,
  cameraFovMobile: 44,
  cameraLiftDesktop: 0.78,
  cameraLiftMobile: 0.58,
  cameraSway: 0.22,
  sceneOffsetDesktop: 1.12,

  // The spiral banks in a loop between 60° and 120°. The active card stays
  // anchored; the left/right cards rise and fall to create the travelling
  // "enters right, exits left" motion.
  orbitBankMinDeg: 60,
  orbitBankMaxDeg: 120,
  orbitBankSpeed: 0.22,
  orbitBankAmount: 2.4,

  rotationSmoothing: 5.2,
  glitchDurationMs: 400,
  particleCountDesktop: 220,
  particleCountMobile: 110,
  waterfallParticlesDesktop: 160,
  waterfallParticlesMobile: 90,
  parallaxStrength: 0.22,
  dprDesktop: 1.6,
  dprMobile: 1.25,
  lowFpsThreshold: 38,
} as const;

type WorkSceneProps = {
  projects: ProjectItem[];
  activeIndex: number;
  targetProgressRef: React.RefObject<number>;
  suppressClickRef: React.RefObject<boolean>;
  isMobile: boolean;
  isDesktop: boolean;
  reducedMotion: boolean;
  active?: boolean;
  onSelectCard: (index: number) => void;
  onLowFpsFallback: () => void;
};

/* ── Poster / title texture loading ─────────────────────────────────────── */

function getPixelFamily() {
  if (typeof document === "undefined") return "monospace";
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none;font-family:var(--font-pixel)";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "monospace";
  probe.remove();
  return family.split(",")[0].trim().replace(/['"]/g, "");
}

function createTitleTexture(title: string, index: number, family: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const upper = title.toUpperCase();
  const size = upper.length > 22 ? 22 : upper.length > 16 ? 27 : 34;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "alphabetic";

  ctx.font = `700 18px ${family}`;
  ctx.fillStyle = "rgba(103,232,249,0.92)";
  ctx.fillText(String(index + 1).padStart(2, "0"), 24, 34);

  ctx.font = `700 ${size}px ${family}`;
  ctx.fillStyle = "rgba(236,72,153,0.55)";
  ctx.fillText(upper, 26, 100);
  ctx.fillStyle = "rgba(56,189,248,0.55)";
  ctx.fillText(upper, 22, 98);
  ctx.fillStyle = "rgba(248,250,252,0.98)";
  ctx.fillText(upper, 24, 99);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function loadPosterTexture(src: string, isMobile: boolean) {
  return new Promise<THREE.Texture | null>((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      const width = isMobile ? 384 : 512;
      const height = Math.round(width / 1.56);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      const sourceWidth = image.naturalWidth || image.width || width;
      const sourceHeight = image.naturalHeight || image.height || height;
      const targetAspect = width / height;
      const sourceAspect = sourceWidth / sourceHeight;
      let sx = 0;
      let sy = 0;
      let sw = sourceWidth;
      let sh = sourceHeight;
      if (sourceAspect > targetAspect) {
        sw = sourceHeight * targetAspect;
        sx = (sourceWidth - sw) / 2;
      } else {
        sh = sourceWidth / targetAspect;
        sy = (sourceHeight - sh) / 2;
      }
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      resolve(texture);
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function useWorkTextures(projects: ProjectItem[], isMobile: boolean) {
  const [posters, setPosters] = useState<Record<string, THREE.Texture>>({});
  const [titles, setTitles] = useState<Record<string, THREE.Texture>>({});

  useEffect(() => {
    let cancelled = false;
    const created: THREE.Texture[] = [];

    const run = async () => {
      const family = getPixelFamily();
      try {
        await document.fonts.load(`700 40px ${family}`);
        await document.fonts.ready;
      } catch {
        /* fall back to the browser's monospace face */
      }
      if (cancelled) return;

      const nextTitles: Record<string, THREE.Texture> = {};
      projects.forEach((project, index) => {
        const texture = createTitleTexture(project.title, index, family);
        if (!texture) return;
        created.push(texture);
        nextTitles[project.title] = texture;
      });
      setTitles(nextTitles);

      await Promise.all(
        projects.map(async (project) => {
          if (!project.image) return;
          const texture = await loadPosterTexture(project.image, isMobile);
          if (!texture) return;
          if (cancelled) {
            texture.dispose();
            return;
          }
          created.push(texture);
          setPosters((prev) => ({ ...prev, [project.image!]: texture }));
        })
      );
    };

    void run();
    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [projects, isMobile]);

  return { posters, titles };
}

/* ── Camera ─────────────────────────────────────────────────────────────── */

type CameraRigProps = {
  targetProgressRef: React.RefObject<number>;
  viewAngleRef: React.RefObject<number>;
  sceneOffset: number;
  isMobile: boolean;
  reducedMotion: boolean;
};

function CameraRig({
  targetProgressRef,
  viewAngleRef,
  sceneOffset,
  isMobile,
  reducedMotion,
}: CameraRigProps) {
  const { camera } = useThree();
  const smoothRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const lookAtRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (isMobile || reducedMotion) return;
    const onMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isMobile, reducedMotion]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = Math.min(1, Math.max(0, targetProgressRef.current));
    const smoothing = reducedMotion ? 16 : WORK_TUNING.rotationSmoothing;
    smoothRef.current +=
      (target - smoothRef.current) * Math.min(1, dt * smoothing);

    const p = smoothRef.current;
    const time = state.clock.elapsedTime;
    const turns = 13 / 14;
    const angle = p * Math.PI * 2 * turns;

    const radiusTop = isMobile
      ? WORK_TUNING.orbitRadiusTopMobile
      : WORK_TUNING.orbitRadiusTopDesktop;
    const radiusBottom = isMobile
      ? WORK_TUNING.orbitRadiusBottomMobile
      : WORK_TUNING.orbitRadiusBottomDesktop;
    const helixSpan = isMobile
      ? WORK_TUNING.helixSpanMobile
      : WORK_TUNING.helixSpanDesktop;
    const cardDistance = isMobile
      ? WORK_TUNING.cameraDistanceMobile
      : WORK_TUNING.cameraDistanceDesktop;
    const lift = isMobile
      ? WORK_TUNING.cameraLiftMobile
      : WORK_TUNING.cameraLiftDesktop;

    const activeY = helixSpan * 0.5 - p * helixSpan;
    const activeRadius = THREE.MathUtils.lerp(radiusTop, radiusBottom, p);
    const orbitRadius =
      activeRadius +
      cardDistance +
      Math.sin(p * Math.PI) * WORK_TUNING.cameraSway;

    // Dynamic 60° → 120° banking loop
    const bank =
      Math.cos(
        THREE.MathUtils.degToRad(
          90 +
            30 *
              Math.sin(
                time * WORK_TUNING.orbitBankSpeed
              )
        )
      ) * WORK_TUNING.orbitBankAmount;

    const baseY = activeY + lift;
    const y =
      baseY +
      (reducedMotion
        ? 0
        : Math.sin(p * Math.PI * 2) * 0.05 + Math.sin(time * 0.5) * 0.025);

    const px = reducedMotion ? 0 : pointerRef.current.x;
    const py = reducedMotion ? 0 : pointerRef.current.y;

    camera.position.set(
      sceneOffset +
        Math.sin(angle) * orbitRadius +
        px * WORK_TUNING.parallaxStrength * 0.35,
      y + py * WORK_TUNING.parallaxStrength * 0.22,
      Math.cos(angle) * orbitRadius
    );

    lookAtRef.current.set(
      sceneOffset + px * WORK_TUNING.parallaxStrength,
      activeY + 0.1 + py * WORK_TUNING.parallaxStrength * 0.5,
      0
    );
    camera.lookAt(lookAtRef.current);
    if (!reducedMotion) {
      camera.rotateZ(
        Math.sin(p * Math.PI * 2) * 0.01 +
          px * 0.006 +
          bank * 0.01
      );
    }

    viewAngleRef.current = angle;
  });

  return null;
}

/* ── Ambient particle cloud ────────────────────────────────────────────── */

const PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uGlitch;
  uniform float uDrift;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed * uDrift + 7.0, 14.0) - 7.0;
    p.x += sin(uTime * 0.12 + aPhase) * 0.14 * uDrift;
    p.z += cos(uTime * 0.1 + aPhase * 1.3) * 0.14 * uDrift;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float rawSize = aSize * uPixelRatio * (80.0 / max(0.1, -mv.z));
    gl_PointSize = clamp(rawSize * (1.0 + uGlitch * 0.4), 1.2, 3.8);

    vColor = aColor;
    vAlpha = 0.32 + 0.38 * (0.5 + 0.5 * sin(uTime * 1.1 + aPhase));
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function ParticleCloud({
  count,
  reducedMotion,
  glitchTrigger,
}: {
  count: number;
  reducedMotion: boolean;
  glitchTrigger: number;
}) {
  const { gl } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pulseRef = useRef(0);

  useEffect(() => {
    if (reducedMotion || glitchTrigger === 0) return;
    pulseRef.current = 1;
  }, [glitchTrigger, reducedMotion]);

  const { positions, colors, sizes, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const palette = [
      new THREE.Color("#a855f7"),
      new THREE.Color("#ec4899"),
      new THREE.Color("#38bdf8"),
      new THREE.Color("#818cf8"),
      new THREE.Color("#e9d5ff"),
    ];

    for (let i = 0; i < count; i++) {
      const wide = i > count * 0.72;
      const theta = seeded(i * 7 + 1) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i * 7 + 2) - 1);
      const radius = wide
        ? 5 + seeded(i * 7 + 3) * 5
        : 1.1 + seeded(i * 7 + 3) * 3.4;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.cos(phi) * (wide ? 4 : 2.2) + 0.4;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;

      const color = palette[i % palette.length];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      size[i] = wide ? 0.7 + seeded(i * 7 + 4) * 1.4 : 1.2 + seeded(i * 7 + 4) * 2.2;
      phase[i] = seeded(i * 7 + 5) * Math.PI * 2;
      speed[i] = 0.018 + seeded(i * 7 + 6) * 0.05;
    }
    return {
      positions: pos,
      colors: col,
      sizes: size,
      phases: phase,
      speeds: speed,
    };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uGlitch: { value: 0 },
      uDrift: { value: reducedMotion ? 0 : 1 },
    }),
    [reducedMotion]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    pulseRef.current = Math.max(0, pulseRef.current - dt * 2.4);
    u.uGlitch.value = reducedMotion ? 0 : pulseRef.current;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/* ── FPS guard (Disabled to keep 3D orbit steady and visible at all times) ── */

function FpsGuard({ onLowFps: _onLowFps }: { onLowFps: () => void }) {
  // Disabled: The 3D orbit and centerpiece must stay rock-steady and visible at all times.
  return null;
}

/* ── Scene contents ─────────────────────────────────────────────────────── */

function SceneContents({
  projects,
  activeIndex,
  targetProgressRef,
  suppressClickRef,
  isMobile,
  isDesktop,
  reducedMotion,
  onSelectCard,
  onLowFpsFallback,
}: WorkSceneProps) {
  const { gl } = useThree();
  const viewAngleRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const sceneOffset = isDesktop ? WORK_TUNING.sceneOffsetDesktop : 0;

  const radiusTop = isMobile
    ? WORK_TUNING.orbitRadiusTopMobile
    : WORK_TUNING.orbitRadiusTopDesktop;
  const radiusBottom = isMobile
    ? WORK_TUNING.orbitRadiusBottomMobile
    : WORK_TUNING.orbitRadiusBottomDesktop;
  const helixSpan = isMobile
    ? WORK_TUNING.helixSpanMobile
    : WORK_TUNING.helixSpanDesktop;
  const helixTop = helixSpan * 0.5;

  const cardWidth = isMobile
    ? WORK_TUNING.cardWidthMobile
    : WORK_TUNING.cardWidthDesktop;
  const cardHeight = isMobile
    ? WORK_TUNING.cardHeightMobile
    : WORK_TUNING.cardHeightDesktop;
  const particleCount = isMobile
    ? WORK_TUNING.particleCountMobile
    : WORK_TUNING.particleCountDesktop;

  const { posters, titles } = useWorkTextures(projects, isMobile);

  useEffect(() => {
    if (isMobile) return;
    const element = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerRef.current.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y =
        -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      const inBounds =
        event.clientX >= rect.left - 60 &&
        event.clientX <= rect.right + 60 &&
        event.clientY >= rect.top - 60 &&
        event.clientY <= rect.bottom + 60;
      pointerRef.current.active = inBounds;
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, isMobile]);

  const cardGeometry = useMemo(() => {
    const padding = WORK_TUNING.cardPadding;
    return new THREE.PlaneGeometry(
      cardWidth + padding * 2,
      cardHeight + padding * 2
    );
  }, [cardHeight, cardWidth]);

  useEffect(() => () => cardGeometry.dispose(), [cardGeometry]);

  return (
    <>
      <CameraRig
        targetProgressRef={targetProgressRef}
        viewAngleRef={viewAngleRef}
        sceneOffset={sceneOffset}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
      />

      <group position={[sceneOffset, 0, 0]}>
        <Centerpiece
          glitchTrigger={activeIndex}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          waterfallParticleCount={
            isMobile
              ? WORK_TUNING.waterfallParticlesMobile
              : WORK_TUNING.waterfallParticlesDesktop
          }
          pointerRef={pointerRef}
        />

        <ParticleCloud
          count={particleCount}
          reducedMotion={reducedMotion}
          glitchTrigger={activeIndex}
        />

        {projects.map((project, index) => {
          const t = index / (projects.length - 1);
          const cardY =
            helixTop - t * helixSpan + Math.sin(index * 1.9) * 0.06;
          const cardRadius = THREE.MathUtils.lerp(
            radiusTop,
            radiusBottom,
            t
          );
          return (
            <ProjectCard3D
              key={project.title}
              index={index}
              poster={project.image ? posters[project.image] ?? null : null}
              titleTexture={titles[project.title] ?? null}
              geometry={cardGeometry}
              cardY={cardY}
              cardRadius={cardRadius}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              baseAngle={(index / projects.length) * Math.PI * 2}
              viewAngleRef={viewAngleRef}
              isActive={index === activeIndex}
              reducedMotion={reducedMotion}
              glitchMs={WORK_TUNING.glitchDurationMs}
              bankAmount={WORK_TUNING.orbitBankAmount}
              bankSpeed={WORK_TUNING.orbitBankSpeed}
              suppressClickRef={suppressClickRef}
              onSelect={onSelectCard}
            />
          );
        })}
      </group>

      <FpsGuard onLowFps={onLowFpsFallback} />
    </>
  );
}

/* ── Canvas wrapper ─────────────────────────────────────────────────────── */

export default function WorkScene({
  projects,
  activeIndex,
  targetProgressRef,
  suppressClickRef,
  isMobile,
  isDesktop,
  reducedMotion,
  active = true,
  onSelectCard,
  onLowFpsFallback,
}: WorkSceneProps) {
  const [canvasKey, setCanvasKey] = useState(0);

  return (
    <div className="work-canvas-mask">
      <Canvas
        key={canvasKey}
        dpr={
          isMobile
            ? [1, WORK_TUNING.dprMobile]
            : [1, WORK_TUNING.dprDesktop]
        }
        frameloop={active ? "always" : "demand"}
        camera={{
          fov: isMobile
            ? WORK_TUNING.cameraFovMobile
            : WORK_TUNING.cameraFovDesktop,
          position: [0, 0.55, WORK_TUNING.cameraDistanceDesktop],
          near: 0.1,
          far: 40,
        }}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          const el = gl.domElement;
          el.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
            },
            false
          );
          el.addEventListener(
            "webglcontextrestored",
            () => {
              setCanvasKey((k) => k + 1);
            },
            false
          );
        }}
      >
        <SceneContents
          projects={projects}
          activeIndex={activeIndex}
          targetProgressRef={targetProgressRef}
          suppressClickRef={suppressClickRef}
          isMobile={isMobile}
          isDesktop={isDesktop}
          reducedMotion={reducedMotion}
          onSelectCard={onSelectCard}
          onLowFpsFallback={onLowFpsFallback}
        />
      </Canvas>
    </div>
  );
}
