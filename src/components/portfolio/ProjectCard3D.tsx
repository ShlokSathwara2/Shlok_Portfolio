"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

type ProjectCard3DProps = {
  index: number;
  poster: THREE.Texture | null;
  titleTexture: THREE.Texture | null;
  geometry: THREE.BufferGeometry;
  cardY: number;
  cardRadius: number;
  cardWidth: number;
  cardHeight: number;
  baseAngle: number;
  viewAngleRef: React.RefObject<number>;
  suppressClickRef: React.RefObject<boolean>;
  isActive: boolean;
  reducedMotion: boolean;
  glitchMs: number;
  bankAmount: number;
  bankSpeed: number;
  onSelect: (index: number) => void;
};

const CARD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CARD_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uPoster;
  uniform sampler2D uTitle;
  uniform float uHasPoster;
  uniform float uHasTitle;
  uniform float uDepth;
  uniform float uActive;
  uniform float uHover;
  uniform float uGlitch;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uAccent;
  uniform vec2 uCardSize;
  uniform vec2 uPlaneSize;
  uniform float uRadius;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uPlaneSize;
    vec2 halfCard = uCardSize * 0.5;
    float d = sdRoundBox(p, halfCard, uRadius);

    float inside = 1.0 - smoothstep(-0.003, 0.003, d);
    float glow = exp(-max(d, 0.0) * 16.0);
    float edge = 1.0 - smoothstep(0.0, 0.012, abs(d + 0.007));

    vec2 frameUv = clamp((p + halfCard) / uCardSize, 0.0, 1.0);
    vec2 cardUv = frameUv;

    // Blocky pixel-glitch on click/transition (matching Orbit demo shader)
    if (uGlitch > 0.001) {
      float b = mix(48.0, 7.0, uGlitch);
      vec2 q = floor(cardUv * b) / b;
      float blockMask = step(0.45, hash(q + floor(uTime * 18.0))) * uGlitch;
      cardUv = mix(cardUv, q, blockMask);
    }

    float inset = 0.055;
    vec2 innerUv = (cardUv - inset) / (1.0 - inset * 2.0);
    float innerMask =
      step(0.0, innerUv.x) * step(innerUv.x, 1.0) *
      step(0.0, innerUv.y) * step(innerUv.y, 1.0);

    vec3 placeholder = mix(vec3(0.035, 0.045, 0.09), uAccent * 0.22, cardUv.y);
    vec3 poster = placeholder;

    if (uHasPoster > 0.5) {
      vec2 sampleUv = innerUv;
      sampleUv += (vec2(
        hash(sampleUv * vec2(42.0, 31.0)),
        hash(sampleUv * vec2(17.0, 53.0) + 3.0)
      ) - 0.5) * 0.005 * (1.0 - uDepth);
      poster = texture2D(uPoster, clamp(sampleUv, 0.0, 1.0)).rgb;
    }

    vec3 col = mix(vec3(0.035, 0.045, 0.085), poster, innerMask);

    // Frosted grain + diagonal glass sheen.
    float grain = hash(cardUv * vec2(900.0, 620.0) + uTime * 0.05) - 0.5;
    col += grain * 0.022;

    float sheenPos = 0.62 + sin(uTime * 0.12) * 0.2;
    float sheen = smoothstep(
      0.22, 0.0,
      abs(cardUv.x * 0.8 + cardUv.y * 0.6 - sheenPos)
    );
    col += vec3(0.55, 0.62, 0.85) * sheen * (0.035 + uDepth * 0.035);

    // Dark glass strip for the pixel title.
    float bottom = smoothstep(0.52, 0.94, cardUv.y);
    col = mix(col, vec3(0.012, 0.016, 0.032), bottom * 0.68);

    if (uHasTitle > 0.5 && cardUv.y > 0.6) {
      vec2 titleUv = vec2(cardUv.x, (cardUv.y - 0.6) / 0.4);
      vec4 title = texture2D(uTitle, clamp(titleUv, 0.0, 1.0));
      vec3 titleColor = mix(vec3(0.94, 0.97, 1.0), uAccent, uActive * 0.35);
      col = mix(col, titleColor, title.a * 0.96);
    }

    // Cards further back are dimmer and slightly desaturated.
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 farCol = vec3(luma) * 0.42 + uAccent * 0.045;
    col = mix(farCol, col, pow(uDepth, 0.9));

    // RGB chromatic aberration & brightness boost on click/hover (matching Orbit demo)
    if (uGlitch > 0.001 && uHasPoster > 0.5) {
      float o = 0.014 * uGlitch + 0.002;
      vec2 suv = clamp(innerUv, 0.0, 1.0);
      float r = texture2D(uPoster, clamp(suv + vec2(o, 0.0), 0.0, 1.0)).r;
      float bl = texture2D(uPoster, clamp(suv - vec2(o, 0.0), 0.0, 1.0)).b;
      vec3 g = vec3(r, poster.g, bl);
      col = mix(col, g, uGlitch * 0.85);
    }
    col *= 1.0 + uHover * 0.45 + uGlitch * 0.6;

    // Thin bright rim + soft outer bloom (faked, no postprocessing pass).
    vec3 borderColor = mix(vec3(0.55, 0.66, 0.92), uAccent, 0.55);
    borderColor *= 0.35 + uActive * 0.8 + uHover * 0.35;
    col += borderColor * edge * 1.5;

    float outerGlow = glow * (0.15 + uActive * 0.42 + uHover * 0.22);
    col += uAccent * outerGlow * 0.55;

    float alpha = max(inside * uOpacity, glow * (0.16 + uActive * 0.22));
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

const ACCENTS = ["#38bdf8", "#a855f7", "#ec4899", "#818cf8", "#22d3ee"];

export default function ProjectCard3D({
  index,
  poster,
  titleTexture,
  geometry,
  cardY,
  cardRadius,
  cardWidth,
  cardHeight,
  baseAngle,
  viewAngleRef,
  suppressClickRef,
  isActive,
  reducedMotion,
  glitchMs,
  bankAmount,
  bankSpeed,
  onSelect,
}: ProjectCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const hoverRef = useRef(0);
  const hoverSmoothRef = useRef(0);
  const pinTimerRef = useRef(0);
  const glitchRef = useRef(0);
  const previousActiveRef = useRef(isActive);

  const accent = useMemo(
    () => new THREE.Color(ACCENTS[index % ACCENTS.length]),
    [index]
  );

  const uniforms = useMemo(
    () => ({
      uPoster: { value: null as THREE.Texture | null },
      uTitle: { value: null as THREE.Texture | null },
      uHasPoster: { value: 0 },
      uHasTitle: { value: 0 },
      uDepth: { value: 0 },
      uActive: { value: 0 },
      uHover: { value: 0 },
      uGlitch: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0.9 },
      uAccent: { value: accent },
      uCardSize: { value: new THREE.Vector2(cardWidth, cardHeight) },
      uPlaneSize: {
        value: new THREE.Vector2(
          cardWidth + 0.44,
          cardHeight + 0.44
        ),
      },
      uRadius: { value: 0.12 },
    }),
    [accent, cardHeight, cardWidth]
  );

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uPoster.value = poster;
    materialRef.current.uniforms.uHasPoster.value = poster ? 1 : 0;
  }, [poster]);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTitle.value = titleTexture;
    materialRef.current.uniforms.uHasTitle.value = titleTexture ? 1 : 0;
  }, [titleTexture]);

  useEffect(() => {
    if (previousActiveRef.current === isActive) return;
    previousActiveRef.current = isActive;
    if (!reducedMotion) glitchRef.current = 1;
  }, [isActive, reducedMotion]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (!group || !material) return;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const deltaAngle = baseAngle - viewAngleRef.current;
    const depth = (Math.cos(deltaAngle) + 1) * 0.5;
    const active = isActive ? 1 : 0;

    pinTimerRef.current = Math.max(0, pinTimerRef.current - dt);
    const targetHv = hoverRef.current > 0.5 || pinTimerRef.current > 0 ? 1 : 0;
    hoverSmoothRef.current +=
      (targetHv - hoverSmoothRef.current) * Math.min(1, dt * 8);
    const hover = hoverSmoothRef.current;

    // Slow 60° → 120° bank. The active card is at deltaAngle 0, so it stays
    // anchored while the cards on the left and right rise/fall around it.
    const bank = reducedMotion
      ? 0
      : Math.cos(
          THREE.MathUtils.degToRad(
            90 + 30 * Math.sin(time * bankSpeed)
          )
        ) * bankAmount;
    const bankOffset = Math.sin(deltaAngle) * bank;

    const scale =
      (THREE.MathUtils.lerp(0.46, 1.0, Math.pow(depth, 1.9)) + active * 0.06) *
      (1 + hover * 0.25);
    group.scale.setScalar(scale);
    group.position.y =
      cardY +
      bankOffset +
      (reducedMotion ? 0 : Math.sin(time * 0.7 + index * 1.3) * 0.02);
    group.rotation.x = -0.12 + (1 - depth) * 0.12;
    group.rotation.y = baseAngle + (1 - depth) * 0.1;
    group.rotation.z =
      Math.sin(deltaAngle) * bank * 0.16 +
      Math.sin(index * 2.1) * 0.012;

    glitchRef.current = Math.max(0, glitchRef.current - dt * 2.2);

    const u = material.uniforms;
    u.uDepth.value = depth;
    u.uActive.value = active;
    u.uHover.value = hover;
    u.uGlitch.value = reducedMotion ? 0 : glitchRef.current;
    u.uTime.value = reducedMotion ? 0 : time;
    u.uOpacity.value =
      THREE.MathUtils.lerp(0.32, 0.98, Math.pow(depth, 1.2)) +
      active * 0.02;
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (suppressClickRef.current) return;
    if (!reducedMotion) glitchRef.current = 1;
    pinTimerRef.current = 3.5;
    onSelect(index);
  };

  return (
    <group
      ref={groupRef}
      position={[
        Math.sin(baseAngle) * cardRadius,
        cardY,
        Math.cos(baseAngle) * cardRadius,
      ]}
      rotation={[0, baseAngle, 0]}
    >
      <mesh
        geometry={geometry}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoverRef.current = 1;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hoverRef.current = 0;
          document.body.style.cursor = "";
        }}
      >
        <shaderMaterial
          ref={materialRef}
          vertexShader={CARD_VERT}
          fragmentShader={CARD_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
