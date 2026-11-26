"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type CenterpieceProps = {
  glitchTrigger: number;
  reducedMotion: boolean;
  isMobile: boolean;
  waterfallParticleCount: number;
  pointerRef: React.RefObject<{ x: number; y: number; active: boolean }>;
};

/* ── Helpers ────────────────────────────────────────────────────────────── */

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.14)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/* ═══════════════════════════════════════════════════════════════════════════
   IRIDESCENT TORUS-KNOT CORE — Exactly matching the demo shader
   ═══════════════════════════════════════════════════════════════════════════ */

const CORE_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 p = position + normal * sin(position.y * 4.0 + uTime * 1.6) * 0.05;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalMatrix * normal;
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float f = 1.0 - abs(dot(N, V));
    vec3 c = 0.5 + 0.5 * cos(6.2832 * (f * 1.3 + uTime * 0.08 + vec3(0.0, 0.33, 0.67)));
    float s = pow(f, 2.5);
    gl_FragColor = vec4(mix(vec3(0.04, 0.02, 0.1), c, 0.35 + 0.65 * s) + s * 0.6, 1.0);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   PARTICLE GLOBE — Fibonacci-sphere distributed micro-stars with
   cursor-reactive scattering (inspired by Framer ParticleGlobe3D)
   ═══════════════════════════════════════════════════════════════════════════ */

const GLOBE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  attribute vec3 aTarget;
  attribute vec3 aSplashVec;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uRepel;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uGlitch;
  uniform float uSplash;
  uniform float uSplashTime;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Particles gently orbit their home position on the globe shell
    vec3 target = aTarget;
    float orbit = uTime * aSpeed * 0.35 + aPhase;
    target.x += sin(orbit) * 0.06;
    target.y += cos(orbit * 0.7 + aPhase) * 0.045;
    target.z += sin(orbit * 1.3 + aPhase * 2.0) * 0.06;

    // Breathing: gently expand/contract
    float breath = 1.0 + sin(uTime * 0.5 + aPhase) * 0.04;
    vec3 p = target * breath;

    // Double-click whole-screen splash & 2s spiral reassembly
    if (uSplash > 0.001) {
      vec3 splashOffset = aSplashVec * uSplash;
      splashOffset.x += sin(uSplashTime * 1.5 + aPhase * 3.0) * 0.65 * uSplash;
      splashOffset.y += cos(uSplashTime * 1.3 + aPhase * 2.3) * 0.55 * uSplash;
      splashOffset.z += sin(uSplashTime * 1.7 + aPhase * 4.1) * 0.50 * uSplash;
      p += splashOffset;

      // Swirl/vortex as particles burst out and converge back together
      float swirlDir = sin(aPhase * 7.0) >= 0.0 ? 1.0 : -1.0;
      float swirlAngle = uSplash * (1.6 + aSpeed * 1.4) * swirlDir;
      float cs = cos(swirlAngle);
      float sn = sin(swirlAngle);
      float rx = p.x * cs - p.z * sn;
      float rz = p.x * sn + p.z * cs;
      p.x = mix(p.x, rx, uSplash * 0.85);
      p.z = mix(p.z, rz, uSplash * 0.85);
    }

    // Cursor repulsion in screen space
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / max(0.001, clip.w);
    vec2 diff = ndc - uMouse;
    diff.x *= uAspect;
    float dist = length(diff);

    // Subtle localized cursor border parting (~10% deviation, tight circular halo)
    float force = smoothstep(0.16, 0.0, dist) * uRepel * (1.0 - uSplash * 0.7);
    vec2 dir2d = normalize(diff + 0.0001);

    // Gentle nudge outward only around the cursor border
    vec3 radial = normalize(target + vec3(0.0001));
    p += radial * (force * 0.22);
    p.x += dir2d.x * force * 0.20;
    p.y += dir2d.y * force * 0.18;
    p.z += force * 0.12 * sign(p.z + 0.001);

    mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // Strictly clamp gl_PointSize to 1.5–4.2 px for crisp micro-stars
    float rawSize = aSize * uPixelRatio * (120.0 / max(0.1, -mv.z));
    rawSize *= (1.0 + force * 0.8 + uGlitch * 0.4 + uSplash * 0.35);
    gl_PointSize = clamp(rawSize, 1.5, 4.2);

    vColor = aColor;
    // Twinkle alpha
    float twinkle = 0.5 + 0.5 * sin(uTime * 2.5 + aPhase * 6.0);
    vAlpha = (0.45 + 0.4 * twinkle) * (0.85 + force * 0.4 + uSplash * 0.25);
  }
`;

const GLOBE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Crisp point: sharp center, soft edge
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

function GlobeParticles({
  count,
  reducedMotion,
  interactionRef,
}: {
  count: number;
  reducedMotion: boolean;
  interactionRef: React.RefObject<{
    x: number;
    y: number;
    repel: number;
    glitch: number;
    splash: number;
    splashTime: number;
  }>;
}) {
  const { gl, size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, targets, splashVecs, colors, sizes, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tgt = new Float32Array(count * 3);
    const spl = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);

    // Color palette: cyan, electric violet, soft pink, bright white
    const palette = [
      new THREE.Color("#5fe7ff"),
      new THREE.Color("#b36bff"),
      new THREE.Color("#ff5fb0"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#5fe7ff"),
      new THREE.Color("#b36bff"),
    ];

    const golden = (1 + Math.sqrt(5)) / 2;
    const globeRadius = 1.65;

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution for dense, uniform globe shell
      const theta = (2 * Math.PI * i) / golden;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

      // Two shells: inner dense shell + outer sparse halo
      const isHalo = i > count * 0.82;
      const r = isHalo
        ? globeRadius * (1.15 + seeded(i * 11 + 3) * 0.55)
        : globeRadius * (0.88 + seeded(i * 11 + 3) * 0.24);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      tgt[i * 3] = x;
      tgt[i * 3 + 1] = y;
      tgt[i * 3 + 2] = z;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Whole-screen splash direction vector per particle
      const sx = (seeded(i * 17 + 1) - 0.5) * 16.0 + (x / r) * 3.5;
      const sy = (seeded(i * 17 + 2) - 0.5) * 10.5 + (y / r) * 2.5;
      const sz = (seeded(i * 17 + 3) - 0.5) * 7.0 + (z / r) * 2.0;
      spl[i * 3] = sx;
      spl[i * 3 + 1] = sy;
      spl[i * 3 + 2] = sz;

      const color = palette[i % palette.length];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // Small size values — the shader clamps to 1.5–4.2 px
      sizeArray[i] = isHalo
        ? 0.5 + seeded(i * 11 + 4) * 0.8
        : 0.7 + seeded(i * 11 + 4) * 1.2;
      phase[i] = seeded(i * 11 + 5) * Math.PI * 2;
      speed[i] = 0.2 + seeded(i * 11 + 6) * 0.6;
    }

    return {
      positions: pos,
      targets: tgt,
      splashVecs: spl,
      colors: col,
      sizes: sizeArray,
      phases: phase,
      speeds: speed,
    };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uRepel: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uGlitch: { value: 0 },
      uSplash: { value: 0 },
      uSplashTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    const interaction = interactionRef.current;
    const u = material.uniforms;
    u.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uRepel.value = reducedMotion ? 0 : interaction.repel;
    u.uMouse.value.set(interaction.x, interaction.y);
    u.uAspect.value = size.width / Math.max(1, size.height);
    u.uGlitch.value = reducedMotion ? 0 : interaction.glitch;
    u.uSplash.value = reducedMotion ? 0 : interaction.splash;
    u.uSplashTime.value = reducedMotion ? 0 : interaction.splashTime;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
        <bufferAttribute attach="attributes-aSplashVec" args={[splashVecs, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={GLOBE_VERT}
        fragmentShader={GLOBE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN CENTERPIECE — TorusKnot + Cages + Rings + Particle Globe + Glow
   Matches the demo exactly, plus cursor-interactive particle globe
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Centerpiece({
  glitchTrigger,
  reducedMotion,
  isMobile,
  waterfallParticleCount,
  pointerRef,
}: CenterpieceProps) {
  const { gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreShaderRef = useRef<THREE.ShaderMaterial>(null);
  const cage1Ref = useRef<THREE.LineSegments>(null);
  const cage2Ref = useRef<THREE.LineSegments>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);
  const hoverRef = useRef(0);
  const splashTriggeredRef = useRef(false);
  const splashStartRef = useRef<number | null>(null);
  const projectedRef = useRef(new THREE.Vector3());
  const interactionRef = useRef({
    x: 0,
    y: 0,
    repel: 0,
    glitch: 0,
    splash: 0,
    splashTime: 0,
  });

  const triggerSplash = () => {
    if (reducedMotion) return;
    splashTriggeredRef.current = true;
  };

  useEffect(() => {
    const dom = gl.domElement;
    const onDblClick = (e: MouseEvent) => {
      if (reducedMotion || !groupRef.current) return;
      const rect = dom.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      groupRef.current.getWorldPosition(projectedRef.current);
      projectedRef.current.project(camera);
      const dx = ndcX - projectedRef.current.x;
      const dy = ndcY - projectedRef.current.y;
      if (Math.hypot(dx, dy) < 0.55) {
        triggerSplash();
      }
    };
    dom.addEventListener("dblclick", onDblClick);
    return () => dom.removeEventListener("dblclick", onDblClick);
  }, [gl, camera, reducedMotion]);

  const glowTexture = useMemo(() => makeGlowTexture(), []);

  const coreUniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    []
  );

  // Wireframe geometries
  const icoWire = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.4, 1)),
    []
  );
  const octWire = useMemo(
    () => new THREE.WireframeGeometry(new THREE.OctahedronGeometry(1.9, 1)),
    []
  );

  useEffect(() => {
    return () => {
      glowTexture?.dispose();
      icoWire.dispose();
      octWire.dispose();
    };
  }, [glowTexture, icoWire, octWire]);

  useEffect(() => {
    if (reducedMotion || glitchTrigger === 0) return;
    pulseRef.current = 1;
  }, [glitchTrigger, reducedMotion]);

  const K = reducedMotion ? 0.3 : 1;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Core rotation — exactly like demo
    if (coreRef.current) {
      coreRef.current.rotation.set(t * 0.17 * K, t * 0.3 * K, 0);
    }

    // Wireframe cage rotations — exactly like demo
    if (cage1Ref.current) {
      cage1Ref.current.rotation.set(-t * 0.1 * K, t * 0.14 * K, 0);
    }
    if (cage2Ref.current) {
      cage2Ref.current.rotation.set(t * 0.2 * K, -t * 0.12 * K, t * 0.07);
    }

    // Ring rotations — exactly like demo
    if (ring1Ref.current) {
      ring1Ref.current.rotation.set(t * 0.25 * K, 0, t * 0.1);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.set(1.2, t * 0.2 * K, -t * 0.15);
    }

    // Core shader time
    if (coreShaderRef.current) {
      coreShaderRef.current.uniforms.uTime.value = reducedMotion ? 0 : t;
    }

    // Pointer proximity → particle repulsion
    const pointer = pointerRef.current;
    const target = !reducedMotion && pointer.active ? 1.0 : 0.0;
    hoverRef.current +=
      (target - hoverRef.current) * Math.min(1, dt * 5.2);

    pulseRef.current = Math.max(0, pulseRef.current - dt * 2.4);

    // Double-click splash lifecycle:
    // 0.00s - 0.35s: fast outward splash across the whole viewport
    // 0.35s - 2.00s: float/sparkle across the whole page
    // 2.00s - 3.05s: smoothly swirl & come back together into the globe
    if (splashTriggeredRef.current) {
      splashTriggeredRef.current = false;
      splashStartRef.current = t;
    }

    let splash = 0;
    let splashTime = 0;
    if (splashStartRef.current !== null) {
      const elapsed = t - splashStartRef.current;
      splashTime = elapsed;
      if (elapsed < 0.35) {
        const p = elapsed / 0.35;
        splash = 1 - Math.pow(1 - p, 3);
      } else if (elapsed < 2.0) {
        splash = 1.0;
      } else if (elapsed < 3.05) {
        const p = (elapsed - 2.0) / 1.05;
        // Smooth quintic ease-in-out so particles glide & snap smoothly back together
        const ease =
          p < 0.5
            ? 16 * p * p * p * p * p
            : 1 - Math.pow(-2 * p + 2, 5) / 2;
        splash = 1.0 - ease;
      } else {
        splash = 0;
        splashStartRef.current = null;
      }
    }

    interactionRef.current.x = pointer.x;
    interactionRef.current.y = pointer.y;
    interactionRef.current.repel = hoverRef.current;
    interactionRef.current.glitch = reducedMotion ? 0 : pulseRef.current;
    interactionRef.current.splash = splash;
    interactionRef.current.splashTime = splashTime;
  });

  // 2500–3500 particles: 3000 desktop, 2500 mobile
  const globeParticleCount = isMobile ? 2500 : 3000;

  return (
    <>
      <group ref={groupRef} position={[0, 0.25, 0]}>
        {/* Invisible hit sphere for reliable double-click splash on the globe */}
        <mesh
          onDoubleClick={(e) => {
            e.stopPropagation();
            triggerSplash();
          }}
        >
          <sphereGeometry args={[2.3, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* ── Central glow sprite (pulsing, like demo) ── */}
        <sprite scale={[5, 5, 1]} renderOrder={-1}>
          <spriteMaterial
            map={glowTexture ?? undefined}
            color="#ff8cdc"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </sprite>

        {/* ── Deep volumetric bloom behind everything ── */}
        <sprite scale={[5.5, 9.0, 1]} renderOrder={-2}>
          <spriteMaterial
            map={glowTexture ?? undefined}
            color="#7c3aed"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </sprite>
        <sprite scale={[3.0, 7.0, 1]} renderOrder={-2}>
          <spriteMaterial
            map={glowTexture ?? undefined}
            color="#22d3ee"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </sprite>

        {/* ═══ Iridescent TorusKnot Core ═══ */}
        <mesh ref={coreRef} renderOrder={3}>
          <torusKnotGeometry args={[1.15, 0.34, 240, 40, 2, 3]} />
          <shaderMaterial
            ref={coreShaderRef}
            vertexShader={CORE_VERT}
            fragmentShader={CORE_FRAG}
            uniforms={coreUniforms}
          />
        </mesh>

        {/* ═══ Wireframe Icosahedron Cage (#b36bff) ═══ */}
        <lineSegments ref={cage1Ref} geometry={icoWire}>
          <lineBasicMaterial
            color={0xb36bff}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* ═══ Wireframe Octahedron Cage (#5fe7ff) ═══ */}
        <lineSegments ref={cage2Ref} geometry={octWire}>
          <lineBasicMaterial
            color={0x5fe7ff}
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* ═══ Orbital Ring 1 (violet) — thin gyroscopic with bloom ═══ */}
        <mesh ref={ring1Ref} renderOrder={0}>
          <torusGeometry args={[2.9, 0.012, 8, 200]} />
          <meshBasicMaterial
            color={0xb36bff}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* ═══ Orbital Ring 2 (cyan) — thin gyroscopic with bloom ═══ */}
        <mesh ref={ring2Ref} renderOrder={0}>
          <torusGeometry args={[3.4, 0.012, 8, 200]} />
          <meshBasicMaterial
            color={0x5fe7ff}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* ═══ Particle Globe — Fibonacci sphere, cursor scattering ═══ */}
        <GlobeParticles
          count={globeParticleCount}
          reducedMotion={reducedMotion}
          interactionRef={interactionRef}
        />
      </group>

      {/* Ground bloom */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.85, 0]}
        renderOrder={-3}
      >
        <planeGeometry args={[isMobile ? 10 : 14, isMobile ? 10 : 14]} />
        <meshBasicMaterial
          map={glowTexture ?? undefined}
          color="#4c1d95"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Top mist */}
      <sprite position={[0, 3.05, 0]} scale={[2.6, 2.6, 1]} renderOrder={-2}>
        <spriteMaterial
          map={glowTexture ?? undefined}
          color="#67e8f9"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>

      {/* Bottom bloom */}
      <sprite position={[0, -2.7, 0]} scale={[4.2, 1.5, 1]} renderOrder={-2}>
        <spriteMaterial
          map={glowTexture ?? undefined}
          color="#a855f7"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
    </>
  );
}
