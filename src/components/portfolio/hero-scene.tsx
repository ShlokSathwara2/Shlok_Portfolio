"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TIMELINE } from "./timeline";
import { Character } from "./character";
import { ParkBackdrop } from "./park-backdrop";

export type PointerState = {
  x: number;
  y: number;
  lastMove: number;
  active: boolean;
};

type SceneProps = {
  pointerRef: React.MutableRefObject<PointerState>;
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
  mobile?: boolean;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const pseudoRandom = (index: number, salt: number) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

function CameraRig({
  progressRef,
  reducedMotion,
  mobile = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
  mobile?: boolean;
}) {
  const { camera } = useThree();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const heroPose = mobile ? TIMELINE.camera.mobileHero : TIMELINE.camera.hero;
  const deskPose = mobile ? TIMELINE.camera.mobileDesk : TIMELINE.camera.desk;
  const careerPose = mobile
    ? TIMELINE.camera.mobileCareer
    : TIMELINE.camera.career;
  const currentLook = useRef(new THREE.Vector3(...heroPose.target));

  useFrame((_, delta) => {
    if (reducedMotion) return;

    const progress = progressRef.current;

    if (progress < 0.42) {
      // 1. Scroll-driven 360° camera orbit around Shlok
      // Orbits around Shlok, showing all angles and sequential badges,
      // and completes the orbit directly BEHIND Shlok over his shoulder!
      const orbitT = clamp(progress / 0.42, 0, 1);
      // Sweeps from front (0) through full circle and settles at back (3*PI)
      const angle = orbitT * Math.PI * 3;
      const baseRadius = mobile ? 5.2 : 4.4;
      // As it nears the back at orbitT -> 1, radius tightens into over-the-shoulder view
      const radius = mix(baseRadius, mobile ? 1.3 : 1.0, smoothstep(0.65, 1.0, orbitT));
      const heightBase = mix(mobile ? 1.55 : 1.35, 1.28, smoothstep(0.65, 1.0, orbitT));
      const shoulderX = mix(0, 0.18, smoothstep(0.65, 1.0, orbitT));

      targetPosition.set(
        shoulderX + Math.sin(angle) * radius,
        heightBase + Math.sin(angle * 2) * 0.18 * (1 - orbitT * 0.5),
        Math.cos(angle) * radius
      );
      // Look target transitions from Shlok center to the open laptop screen
      targetLook.set(
        mix(0, 0, orbitT),
        mix(1.05, 0.88, orbitT),
        mix(0.08, 0.35, orbitT)
      );
    } else if (progress < 0.60) {
      // 2. Zoom directly INTO the screen FROM THE BACK (over-the-shoulder past typing hands)
      const zoomT = smoothstep(0.42, 0.60, progress);

      // Starts behind Shlok over his right shoulder
      const startX = 0.18;
      const startY = 1.28;
      const startZ = -0.92;

      // Glides forward right through the laptop screen display into the digital dimension
      const endX = 0;
      const endY = 0.88;
      const endZ = 0.38;

      targetPosition.set(
        mix(startX, endX, zoomT),
        mix(startY, endY, zoomT),
        mix(startZ, endZ, zoomT)
      );
      targetLook.set(
        0,
        0.88,
        mix(0.35, 1.5, zoomT)
      );
    } else {
      // 3. Inside the screen: stay locked inside the cyber digital space where Career appears
      targetPosition.set(0, 0.88, 0.38);
      targetLook.set(0, 0.88, 1.5);
    }

    const lambda = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    camera.position.lerp(targetPosition, lambda);
    currentLook.current.lerp(targetLook, lambda);
    camera.lookAt(currentLook.current);
  });

  return null;
}

function Environment() {
  return (
    <>
      {/* Dark obsidian penthouse terrace floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0.2]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#0c1220" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Subtle floor grid line accents */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.2]}>
        <ringGeometry args={[1.8, 1.82, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} />
      </mesh>

      {/* Soft contact shadow under the chair and desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.2]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>

      {/* Smoked obsidian glass + dark titanium balustrade */}
      <group position={[0, 0.7, -2.6]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[8, 0.06, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[7.8, 0.85, 0.02]} />
          <meshStandardMaterial
            color="#060b14"
            transparent
            opacity={0.55}
            roughness={0.12}
            metalness={0.9}
          />
        </mesh>
        {/* Subtle glowing cyan top edge on glass */}
        <mesh position={[0, 0.42, 0.01]}>
          <boxGeometry args={[7.8, 0.008, 0.004]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
        </mesh>
        {[-3.5, -1.8, 0, 1.8, 3.5].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.9, 14]} />
            <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function CyberEmbers() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i += 1) {
      array[i * 3] = (pseudoRandom(i, 1) - 0.5) * 9;
      array[i * 3 + 1] = pseudoRandom(i, 2) * 4.6;
      array[i * 3 + 2] = (pseudoRandom(i, 3) - 0.5) * 5;
    }
    return array;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.06) * 0.08;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.06;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#38bdf8"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({
  pointerRef,
  progressRef,
  reducedMotion,
  mobile,
}: SceneProps) {
  return (
    <>
      <CameraRig
        progressRef={progressRef}
        reducedMotion={reducedMotion}
        mobile={mobile}
      />

      {/* Cyber ambient fill */}
      <ambientLight intensity={0.95} color="#0e182a" />
      <hemisphereLight args={["#38bdf8", "#050811", 0.7]} />

      {/* Studio key light */}
      <directionalLight
        position={[4.5, 6.2, 4]}
        intensity={2.0}
        color="#f1f5f9"
      />

      {/* Electric cyan fill from opposite side */}
      <directionalLight
        position={[-4.5, 3.5, 2.5]}
        intensity={1.2}
        color="#38bdf8"
      />

      {/* Electric violet rim light for cinematic silhouette */}
      <pointLight position={[0, 2.6, -2.4]} intensity={2.2} color="#a855f7" />

      {/* Cool pink & cyan rim lights on shoulders and hair */}
      <pointLight position={[-1.9, 1.85, -1.1]} intensity={1.9} color="#ec4899" />
      <pointLight position={[1.9, 1.85, -1.1]} intensity={1.9} color="#38bdf8" />

      {/* Active laptop IDE screen glow on Shlok's face & hands */}
      <pointLight position={[0, 0.95, 0.35]} intensity={1.1} color="#38bdf8" />

      <Character
        pointerRef={pointerRef}
        progressRef={progressRef}
        reducedMotion={reducedMotion}
      />
      <Environment />
      <CyberEmbers />
    </>
  );
}

export default function HeroScene({
  pointerRef,
  progressRef,
  reducedMotion,
  active,
  mobile = false,
}: SceneProps & { active: boolean }) {
  const heroPose = mobile ? TIMELINE.camera.mobileHero : TIMELINE.camera.hero;
  const fov = mobile ? TIMELINE.camera.mobileFov : TIMELINE.camera.fov;

  return (
    <div className="hero-scene">
      <ParkBackdrop />
      <Canvas
        className="hero-canvas"
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{
          fov,
          position: heroPose.position,
          near: 0.1,
          far: 100,
        }}
        frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
        onCreated={({ camera, gl }) => {
          camera.lookAt(new THREE.Vector3(...heroPose.target));
          const el = gl.domElement;
          el.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
            },
            false
          );
        }}
      >
        <Scene
          pointerRef={pointerRef}
          progressRef={progressRef}
          reducedMotion={reducedMotion}
          mobile={mobile}
        />
      </Canvas>
    </div>
  );
}
