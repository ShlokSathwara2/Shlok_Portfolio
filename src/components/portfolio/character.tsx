"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TIMELINE } from "./timeline";

export type PointerState = {
  x: number;
  y: number;
  lastMove: number;
  active: boolean;
};

type CharacterProps = {
  pointerRef: React.MutableRefObject<PointerState>;
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
};

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

const SKIN = "#b97a55";
const SKIN_LIGHT = "#c98b64";
const SKIN_SHADOW = "#a66745";
const HAIR = "#121216";
const SHIRT = "#edf1f3";
const SHIRT_LIGHT = "#f7f9fa";
const SHIRT_SHADE = "#dfe5e9";
const TROUSER = "#232833";
const CHAIR = "#25303a";
const CHAIR_DARK = "#192128";
const FRAME = "#1d2a42";
const IRIS = "#4a2a1a";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const pseudoRandom = (index: number, salt: number) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

function Limb({
  start,
  end,
  radius,
  color,
  roughness = 0.72,
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
  roughness?: number;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const distance = direction.length();
    const middle = from.clone().add(to).multiplyScalar(0.5);
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    return {
      position: middle,
      quaternion: rotation,
      length: distance,
    };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <capsuleGeometry
        args={[radius, Math.max(0.01, length - radius * 2), 6, 14]}
      />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Hand({
  side,
  position,
  handRef,
}: {
  side: 1 | -1;
  position: [number, number, number];
  handRef: React.RefObject<THREE.Group | null>;
}) {
  const fingerX = [-0.045, -0.015, 0.015, 0.045];

  return (
    <group
      ref={handRef}
      position={position}
      rotation={[0.06, side * -0.06, side * -0.02]}
    >
      {/* Palm */}
      <mesh scale={[0.078, 0.026, 0.092]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.58} />
      </mesh>

      {/* Four fingers, two segments each. */}
      {fingerX.map((x, index) => (
        <group key={x}>
          <mesh
            position={[x, -0.004, 0.073]}
            rotation={[Math.PI / 2 + 0.16, 0, 0]}
          >
            <capsuleGeometry args={[0.0105, 0.044, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.58} />
          </mesh>
          <mesh
            position={[x, -0.009, 0.108]}
            rotation={[Math.PI / 2 + 0.34, 0, 0]}
          >
            <capsuleGeometry args={[0.0092, 0.023, 4, 8]} />
            <meshStandardMaterial
              color={index === 3 ? SKIN_LIGHT : SKIN}
              roughness={0.6}
            />
          </mesh>
          <mesh position={[x, -0.014, 0.124]} scale={[1, 0.55, 1]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color="#d8b096" roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* Thumb */}
      <mesh
        position={[side * 0.069, 0.002, 0.018]}
        rotation={[Math.PI / 2 - 0.16, 0, side * 0.52]}
      >
        <capsuleGeometry args={[0.0115, 0.045, 4, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.58} />
      </mesh>

      {/* Knuckle highlights */}
      {fingerX.map((x) => (
        <mesh key={`knuckle-${x}`} position={[x, 0.018, 0.055]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color={SKIN_LIGHT} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A precise, friendly low-poly portrait of Shlok: curly black hair, glasses,
 * medium-brown skin, a bright open-collar shirt and separate fingers.
 */
export function Character({
  pointerRef,
  progressRef,
  reducedMotion,
}: CharacterProps) {
  const worldRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);

  const curls = useMemo(() => {
    const items: { position: [number, number, number]; radius: number }[] = [];

    for (let index = 0; index < 40; index += 1) {
      const angle = pseudoRandom(index, 1) * TAU;
      const theta = 0.14 + pseudoRandom(index, 2) * 1.18;
      const radius = 0.244;
      const x = Math.sin(theta) * Math.cos(angle) * radius;
      let z = Math.sin(theta) * Math.sin(angle) * radius * 0.95;
      let y = Math.cos(theta) * radius + 0.045;

      /* Keep the forehead clear; curls over the face are pushed up. */
      if (z > 0.075 && y < 0.15) {
        y = 0.15 + (0.15 - y) * 0.55;
        z *= 0.78;
      }

      items.push({
        position: [x, y, z],
        radius: 0.028 + pseudoRandom(index, 3) * 0.022,
      });
    }

    /* Extra volume right on top. */
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * TAU;
      items.push({
        position: [
          Math.cos(angle) * 0.15,
          0.245 + pseudoRandom(index, 4) * 0.032,
          Math.sin(angle) * 0.13,
        ],
        radius: 0.032 + pseudoRandom(index, 5) * 0.018,
      });
    }

    return items;
  }, []);

  useFrame((state, delta) => {
    const now = performance.now();
    const pointer = pointerRef.current;
    const idle =
      reducedMotion ||
      !pointer.active ||
      now - pointer.lastMove > TIMELINE.pointer.idleAfterMs;
    const time = state.clock.elapsedTime;

    let targetYaw = 0;
    let targetPitch = 0;

    if (!reducedMotion) {
      if (idle) {
        targetYaw = Math.sin(time * 0.45) * 0.1;
        targetPitch = Math.sin(time * 0.31) * 0.035;
      } else {
        targetYaw = clamp(
          pointer.x * TIMELINE.pointer.maxYawDeg * DEG,
          -TIMELINE.pointer.maxYawDeg * DEG,
          TIMELINE.pointer.maxYawDeg * DEG
        );
        targetPitch = clamp(
          -pointer.y * TIMELINE.pointer.maxPitchDeg * DEG,
          -TIMELINE.pointer.maxPitchDeg * DEG,
          TIMELINE.pointer.maxPitchDeg * DEG
        );
      }
    }

    const damping = TIMELINE.pointer.damping * 60;
    if (neckRef.current) {
      neckRef.current.rotation.y = THREE.MathUtils.damp(
        neckRef.current.rotation.y,
        targetYaw * TIMELINE.pointer.neckShare,
        damping,
        delta
      );
      neckRef.current.rotation.x = THREE.MathUtils.damp(
        neckRef.current.rotation.x,
        targetPitch * TIMELINE.pointer.neckShare,
        damping,
        delta
      );
    }
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(
        headRef.current.rotation.y,
        targetYaw * TIMELINE.pointer.headShare,
        damping,
        delta
      );
      headRef.current.rotation.x = THREE.MathUtils.damp(
        headRef.current.rotation.x,
        targetPitch * TIMELINE.pointer.headShare,
        damping,
        delta
      );
    }

    const eyeX = clamp(targetYaw * 0.07, -0.013, 0.013);
    const eyeY = clamp(-targetPitch * 0.055, -0.01, 0.01);
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.082 + eyeX;
      leftPupilRef.current.position.y = 0.028 + eyeY;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.082 + eyeX;
      rightPupilRef.current.position.y = 0.028 + eyeY;
    }

    if (torsoRef.current) {
      torsoRef.current.scale.y = 1 + Math.sin(time * 1.3) * 0.006;
    }

    const progress = progressRef.current;
    const careerT = smoothstep(
      TIMELINE.avatar.deskDropStart,
      TIMELINE.avatar.deskDropEnd,
      progress
    );
    const typing =
      smoothstep(TIMELINE.panels.in, TIMELINE.panels.in + 0.04, progress) *
      (1 - smoothstep(TIMELINE.career.in, TIMELINE.career.in + 0.05, progress));

    if (worldRef.current) {
      worldRef.current.position.y = mix(0, TIMELINE.avatar.dropY, careerT);
      const scale = mix(1, TIMELINE.avatar.scale, careerT);
      worldRef.current.scale.setScalar(scale);
    }

    const tap = Math.sin(time * 9.5) * 0.006 * typing;
    if (leftHandRef.current) {
      leftHandRef.current.position.y = 0.715 + tap;
      leftHandRef.current.rotation.x = 0.06 + tap * 0.9;
    }
    if (rightHandRef.current) {
      rightHandRef.current.position.y = 0.715 - tap;
      rightHandRef.current.rotation.x = 0.06 - tap * 0.9;
    }
  });

  return (
    <group ref={worldRef}>
      {/* Chair */}
      <mesh position={[0, 0.5, -0.78]}>
        <boxGeometry args={[0.82, 0.11, 0.66]} />
        <meshStandardMaterial color={CHAIR} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.98, -1.02]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.82, 0.96, 0.11]} />
        <meshStandardMaterial color={CHAIR_DARK} roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.42, -1.06]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.58, 0.16, 0.12]} />
        <meshStandardMaterial color={CHAIR} roughness={0.85} />
      </mesh>

      {/* Seated character */}
      <group position={[0, 0, -0.36]}>
        {/* Trousers / hips */}
        <mesh position={[0, 0.56, -0.08]}>
          <boxGeometry args={[0.48, 0.22, 0.36]} />
          <meshStandardMaterial color={TROUSER} roughness={0.86} />
        </mesh>

        {/* Legs: thighs forward, shins down, shoes on the floor. */}
        <Limb
          start={[-0.14, 0.54, -0.14]}
          end={[-0.18, 0.49, 0.32]}
          radius={0.092}
          color={TROUSER}
          roughness={0.9}
        />
        <Limb
          start={[0.14, 0.54, -0.14]}
          end={[0.18, 0.49, 0.32]}
          radius={0.092}
          color={TROUSER}
          roughness={0.9}
        />
        <Limb
          start={[-0.18, 0.49, 0.32]}
          end={[-0.18, 0.1, 0.4]}
          radius={0.073}
          color={TROUSER}
          roughness={0.9}
        />
        <Limb
          start={[0.18, 0.49, 0.32]}
          end={[0.18, 0.1, 0.4]}
          radius={0.073}
          color={TROUSER}
          roughness={0.9}
        />
        <mesh position={[-0.18, 0.065, 0.49]} scale={[0.12, 0.075, 0.21]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#171a20" roughness={0.88} />
        </mesh>
        <mesh position={[0.18, 0.065, 0.49]} scale={[0.12, 0.075, 0.21]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#171a20" roughness={0.88} />
        </mesh>

        {/* Shirt torso */}
        <mesh ref={torsoRef} position={[0, 1.01, 0]}>
          <cylinderGeometry args={[0.286, 0.224, 0.54, 28, 1]} />
          <meshStandardMaterial color={SHIRT} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.77, 0]} scale={[1, 0.6, 0.8]}>
          <cylinderGeometry args={[0.226, 0.226, 0.05, 24]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.78} />
        </mesh>

        {/* Rounded shoulders */}
        <mesh position={[-0.27, 1.235, 0]} scale={[0.17, 0.115, 0.14]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color={SHIRT} roughness={0.72} />
        </mesh>
        <mesh position={[0.27, 1.235, 0]} scale={[0.17, 0.115, 0.14]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color={SHIRT} roughness={0.72} />
        </mesh>

        {/* Open collar */}
        <mesh position={[0, 1.285, 0.145]} scale={[0.064, 0.075, 0.028]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh
          position={[-0.061, 1.302, 0.185]}
          rotation={[0.1, 0.1, 0.42]}
        >
          <boxGeometry args={[0.088, 0.016, 0.16]} />
          <meshStandardMaterial color={SHIRT_LIGHT} roughness={0.66} />
        </mesh>
        <mesh
          position={[0.061, 1.302, 0.185]}
          rotation={[0.1, -0.1, -0.42]}
        >
          <boxGeometry args={[0.088, 0.016, 0.16]} />
          <meshStandardMaterial color={SHIRT_LIGHT} roughness={0.66} />
        </mesh>

        {/* Placket, buttons and chest pocket. */}
        <mesh position={[0, 1.04, 0.224]}>
          <boxGeometry args={[0.018, 0.43, 0.012]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.72} />
        </mesh>
        {[1.2, 1.105, 1.01, 0.915, 0.82].map((y) => (
          <mesh key={y} position={[0, y, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.006, 14]} />
            <meshStandardMaterial color="#b9c4ca" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0.12, 1.075, 0.226]}>
          <boxGeometry args={[0.105, 0.008, 0.006]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.72} />
        </mesh>
        <mesh position={[0.12, 1.03, 0.226]}>
          <boxGeometry args={[0.105, 0.008, 0.006]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.72} />
        </mesh>
        <mesh position={[0.173, 1.053, 0.226]}>
          <boxGeometry args={[0.008, 0.052, 0.006]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.72} />
        </mesh>

        {/* Arms: white sleeves, cuffs, skin hands on the keyboard. */}
        <Limb
          start={[-0.29, 1.235, 0.02]}
          end={[-0.34, 0.95, 0.14]}
          radius={0.066}
          color={SHIRT}
        />
        <Limb
          start={[0.29, 1.235, 0.02]}
          end={[0.34, 0.95, 0.14]}
          radius={0.066}
          color={SHIRT}
        />
        <mesh position={[-0.34, 0.945, 0.14]}>
          <sphereGeometry args={[0.068, 16, 12]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.74} />
        </mesh>
        <mesh position={[0.34, 0.945, 0.14]}>
          <sphereGeometry args={[0.068, 16, 12]} />
          <meshStandardMaterial color={SHIRT_SHADE} roughness={0.74} />
        </mesh>
        <Limb
          start={[-0.34, 0.945, 0.14]}
          end={[-0.14, 0.74, 0.32]}
          radius={0.054}
          color={SHIRT}
        />
        <Limb
          start={[0.34, 0.945, 0.14]}
          end={[0.14, 0.74, 0.32]}
          radius={0.054}
          color={SHIRT}
        />
        <mesh
          position={[-0.14, 0.745, 0.32]}
          rotation={[0.35, 0, 0]}
        >
          <cylinderGeometry args={[0.056, 0.056, 0.035, 16]} />
          <meshStandardMaterial color={SHIRT_LIGHT} roughness={0.66} />
        </mesh>
        <mesh
          position={[0.14, 0.745, 0.32]}
          rotation={[0.35, 0, 0]}
        >
          <cylinderGeometry args={[0.056, 0.056, 0.035, 16]} />
          <meshStandardMaterial color={SHIRT_LIGHT} roughness={0.66} />
        </mesh>

        {/* Hands positioned directly over keyboard keys */}
        <Hand side={-1} position={[-0.14, 0.715, 0.35]} handRef={leftHandRef} />
        <Hand side={1} position={[0.14, 0.715, 0.35]} handRef={rightHandRef} />

        {/* Neck + head */}
        <group ref={neckRef} position={[0, 1.34, 0]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.079, 0.094, 0.19, 18]} />
            <meshStandardMaterial color={SKIN} roughness={0.58} />
          </mesh>

          <group ref={headRef} position={[0, 0.22, 0.005]}>
            {/* Realistic head shape: base cranium */}
            <mesh position={[0, 0.03, 0.01]} scale={[0.94, 1.06, 0.96]}>
              <sphereGeometry args={[0.235, 32, 28]} />
              <meshStandardMaterial color={SKIN} roughness={0.52} />
            </mesh>

            {/* Jawline & cheek contouring */}
            <mesh position={[-0.10, -0.06, 0.08]} rotation={[0.2, 0.25, -0.1]}>
              <capsuleGeometry args={[0.048, 0.12, 4, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.55} />
            </mesh>
            <mesh position={[0.10, -0.06, 0.08]} rotation={[0.2, -0.25, 0.1]}>
              <capsuleGeometry args={[0.048, 0.12, 4, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.55} />
            </mesh>

            {/* Defined clean-shaven chin */}
            <mesh position={[0, -0.132, 0.075]} scale={[0.16, 0.11, 0.14]}>
              <sphereGeometry args={[1, 24, 20]} />
              <meshStandardMaterial color={SKIN_LIGHT} roughness={0.54} />
            </mesh>

            {/* Ears */}
            <mesh position={[-0.226, 0.015, 0.01]} scale={[0.5, 1.05, 0.72]}>
              <sphereGeometry args={[0.052, 18, 16]} />
              <meshStandardMaterial color={SKIN} roughness={0.6} />
            </mesh>
            <mesh position={[0.226, 0.015, 0.01]} scale={[0.5, 1.05, 0.72]}>
              <sphereGeometry args={[0.052, 18, 16]} />
              <meshStandardMaterial color={SKIN} roughness={0.6} />
            </mesh>
            <mesh
              position={[-0.238, 0.012, 0.026]}
              scale={[0.44, 0.72, 0.4]}
            >
              <sphereGeometry args={[0.028, 12, 10]} />
              <meshStandardMaterial color={SKIN_SHADOW} roughness={0.7} />
            </mesh>
            <mesh
              position={[0.238, 0.012, 0.026]}
              scale={[0.44, 0.72, 0.4]}
            >
              <sphereGeometry args={[0.028, 12, 10]} />
              <meshStandardMaterial color={SKIN_SHADOW} roughness={0.7} />
            </mesh>

            {/* Hair: modern styled textured haircut with clean fade sides & styled quiff */}
            <mesh position={[0, 0.065, -0.01]} scale={[1.02, 1.02, 1.02]}>
              <sphereGeometry args={[0.248, 32, 24, 0, TAU, 0, 1.4]} />
              <meshStandardMaterial color={HAIR} roughness={0.88} />
            </mesh>
            <mesh position={[0, 0.04, -0.08]} scale={[0.98, 0.94, 0.85]}>
              <sphereGeometry args={[0.235, 24, 20]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            {/* Top textured quiff volume */}
            <mesh position={[0, 0.22, 0.06]} rotation={[-0.15, 0.1, 0]} scale={[1.08, 0.45, 0.9]}>
              <sphereGeometry args={[0.18, 20, 16]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            {curls.map((curl, index) => (
              <mesh
                key={index}
                position={curl.position}
                scale={[1, 0.88, 1]}
              >
                <sphereGeometry args={[curl.radius, 12, 10]} />
                <meshStandardMaterial color={HAIR} roughness={0.92} />
              </mesh>
            ))}
            <mesh position={[-0.21, 0.075, 0.052]} rotation={[0.1, 0, 0.12]}>
              <capsuleGeometry args={[0.018, 0.045, 4, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[0.21, 0.075, 0.052]} rotation={[0.1, 0, -0.12]}>
              <capsuleGeometry args={[0.018, 0.045, 4, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>

            {/* Brows */}
            <mesh
              position={[-0.082, 0.104, 0.222]}
              rotation={[0, 0, 0.08]}
            >
              <boxGeometry args={[0.078, 0.014, 0.012]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            <mesh
              position={[0.082, 0.104, 0.222]}
              rotation={[0, 0, -0.08]}
            >
              <boxGeometry args={[0.078, 0.014, 0.012]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>

            {/* Eyes: Sclera + Iris + Pupils + Specular */}
            <mesh position={[-0.082, 0.03, 0.21]} scale={[1, 0.82, 0.42]}>
              <sphereGeometry args={[0.036, 20, 16]} />
              <meshStandardMaterial color="#f7f2ea" roughness={0.35} />
            </mesh>
            <mesh position={[0.082, 0.03, 0.21]} scale={[1, 0.82, 0.42]}>
              <sphereGeometry args={[0.036, 20, 16]} />
              <meshStandardMaterial color="#f7f2ea" roughness={0.35} />
            </mesh>
            <mesh position={[-0.082, 0.03, 0.226]}>
              <sphereGeometry args={[0.018, 16, 14]} />
              <meshStandardMaterial color={IRIS} roughness={0.28} />
            </mesh>
            <mesh position={[0.082, 0.03, 0.226]}>
              <sphereGeometry args={[0.018, 16, 14]} />
              <meshStandardMaterial color={IRIS} roughness={0.28} />
            </mesh>
            <mesh ref={leftPupilRef} position={[-0.082, 0.03, 0.235]}>
              <sphereGeometry args={[0.0095, 14, 12]} />
              <meshStandardMaterial color="#080706" roughness={0.2} />
            </mesh>
            <mesh ref={rightPupilRef} position={[0.082, 0.03, 0.235]}>
              <sphereGeometry args={[0.0095, 14, 12]} />
              <meshStandardMaterial color="#080706" roughness={0.2} />
            </mesh>
            <mesh position={[-0.086, 0.037, 0.242]}>
              <sphereGeometry args={[0.0042, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.078, 0.037, 0.242]}>
              <sphereGeometry args={[0.0042, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Nose: natural human proportions */}
            <mesh position={[0, 0.045, 0.236]} rotation={[0.07, 0, 0]}>
              <capsuleGeometry args={[0.016, 0.048, 4, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.56} />
            </mesh>
            <mesh position={[0, -0.002, 0.252]} scale={[1, 0.8, 1.08]}>
              <sphereGeometry args={[0.033, 18, 14]} />
              <meshStandardMaterial color={SKIN_LIGHT} roughness={0.54} />
            </mesh>
            <mesh position={[-0.018, -0.028, 0.244]}>
              <sphereGeometry args={[0.0055, 8, 8]} />
              <meshStandardMaterial color={SKIN_SHADOW} roughness={0.7} />
            </mesh>
            <mesh position={[0.018, -0.028, 0.244]}>
              <sphereGeometry args={[0.0055, 8, 8]} />
              <meshStandardMaterial color={SKIN_SHADOW} roughness={0.7} />
            </mesh>

            {/* Clean-shaven smile + defined lips */}
            <mesh position={[0, -0.082, 0.236]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.052, 0.0065, 8, 28, Math.PI]} />
              <meshStandardMaterial color="#683d34" roughness={0.68} />
            </mesh>
            <mesh position={[0, -0.124, 0.234]} scale={[1, 0.45, 0.6]}>
              <sphereGeometry args={[0.043, 16, 12]} />
              <meshStandardMaterial color={SKIN_LIGHT} roughness={0.58} />
            </mesh>

            {/* Square Glasses: stylish modern acetate black frames */}
            {[-1, 1].map((side) => (
              <group
                key={side}
                position={[side * 0.083, 0.032, 0.254]}
              >
                <mesh position={[0, 0.038, 0]}>
                  <boxGeometry args={[0.118, 0.0075, 0.009]} />
                  <meshStandardMaterial
                    color={FRAME}
                    roughness={0.28}
                    metalness={0.3}
                  />
                </mesh>
                <mesh position={[0, -0.038, 0]}>
                  <boxGeometry args={[0.118, 0.0075, 0.009]} />
                  <meshStandardMaterial
                    color={FRAME}
                    roughness={0.28}
                    metalness={0.3}
                  />
                </mesh>
                <mesh position={[-0.055, 0, 0]}>
                  <boxGeometry args={[0.0075, 0.083, 0.009]} />
                  <meshStandardMaterial
                    color={FRAME}
                    roughness={0.28}
                    metalness={0.3}
                  />
                </mesh>
                <mesh position={[0.055, 0, 0]}>
                  <boxGeometry args={[0.0075, 0.083, 0.009]} />
                  <meshStandardMaterial
                    color={FRAME}
                    roughness={0.28}
                    metalness={0.3}
                  />
                </mesh>
                {[
                  [-0.055, 0.038],
                  [0.055, 0.038],
                  [-0.055, -0.038],
                  [0.055, -0.038],
                ].map(([x, y], index) => (
                  <mesh key={index} position={[x, y, 0]}>
                    <sphereGeometry args={[0.0055, 8, 8]} />
                    <meshStandardMaterial
                      color={FRAME}
                      roughness={0.28}
                      metalness={0.3}
                    />
                  </mesh>
                ))}
                <mesh position={[0, 0, -0.004]}>
                  <boxGeometry args={[0.103, 0.068, 0.0015]} />
                  <meshStandardMaterial
                    color="#e0f2fe"
                    transparent
                    opacity={0.16}
                    roughness={0.06}
                    metalness={0.2}
                    depthWrite={false}
                  />
                </mesh>
                <mesh
                  position={[side * -0.014, 0.017, 0.003]}
                  rotation={[0, 0, -0.5]}
                >
                  <boxGeometry args={[0.052, 0.004, 0.0012]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                  />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 0.036, 0.254]}>
              <boxGeometry args={[0.034, 0.0075, 0.008]} />
              <meshStandardMaterial
                color={FRAME}
                roughness={0.28}
                metalness={0.3}
              />
            </mesh>
            <mesh position={[-0.148, 0.038, 0.19]} rotation={[0, 0.08, 0]}>
              <boxGeometry args={[0.006, 0.007, 0.13]} />
              <meshStandardMaterial
                color={FRAME}
                roughness={0.28}
                metalness={0.3}
              />
            </mesh>
            <mesh position={[0.148, 0.038, 0.19]} rotation={[0, -0.08, 0]}>
              <boxGeometry args={[0.006, 0.007, 0.13]} />
              <meshStandardMaterial
                color={FRAME}
                roughness={0.28}
                metalness={0.3}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Sleek dark obsidian developer desk */}
      <mesh position={[0, 0.62, 0.32]}>
        <boxGeometry args={[2.25, 0.08, 0.92]} />
        <meshStandardMaterial color="#161c28" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Desk edge cyan highlight */}
      <mesh position={[0, 0.655, 0.778]}>
        <boxGeometry args={[2.22, 0.006, 0.005]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>
      {[
        [-0.98, 0.3, 0.05],
        [0.98, 0.3, 0.05],
        [-0.98, 0.3, 0.62],
        [0.98, 0.3, 0.62],
      ].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]}>
          <boxGeometry args={[0.07, 0.6, 0.07]} />
          <meshStandardMaterial color="#0f1420" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* Laptop: correctly oriented on desk between Shlok and viewer */}
      <group position={[0, 0.665, 0.35]}>
        {/* Laptop base */}
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.64, 0.026, 0.40]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.4} roughness={0.35} />
        </mesh>
        {/* Trackpad (nearest to Shlok, at -z) */}
        <mesh position={[0, 0.03, -0.11]}>
          <boxGeometry args={[0.20, 0.002, 0.12]} />
          <meshStandardMaterial color="#b4bac4" roughness={0.45} metalness={0.3} />
        </mesh>
        {/* Keyboard recess (in the middle) */}
        <mesh position={[0, 0.03, 0.04]}>
          <boxGeometry args={[0.55, 0.002, 0.22]} />
          <meshStandardMaterial color="#141822" roughness={0.7} />
        </mesh>
        {/* Keyboard key rows */}
        {[-0.04, 0.00, 0.04, 0.08, 0.12].map((z, rowIdx) => (
          <mesh key={rowIdx} position={[0, 0.033, z]}>
            <boxGeometry args={[0.52, 0.004, 0.028]} />
            <meshStandardMaterial
              color="#1e2432"
              roughness={0.65}
              emissive="#0e2338"
              emissiveIntensity={0.35}
            />
          </mesh>
        ))}

        {/* Laptop hinge (at far edge away from Shlok, +z) */}
        <mesh position={[0, 0.028, 0.18]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.58, 16]} />
          <meshStandardMaterial color="#8e95a2" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Laptop screen lid (tilted slightly back away from Shlok, towards +z) */}
        <group position={[0, 0.03, 0.18]} rotation={[0.22, 0, 0]}>
          {/* Outer aluminum lid */}
          <mesh position={[0, 0.19, 0]}>
            <boxGeometry args={[0.64, 0.38, 0.018]} />
            <meshStandardMaterial color="#c9ced6" metalness={0.45} roughness={0.35} />
          </mesh>

          {/* Glowing logo on the back of the lid (facing +z towards viewer in front of desk) */}
          <mesh position={[0, 0.19, 0.01]}>
            <circleGeometry args={[0.045, 20]} />
            <meshStandardMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>

          {/* Inner screen display (facing -z towards Shlok and keyboard) */}
          <group position={[0, 0.19, -0.01]}>
            {/* Dark display bezel */}
            <mesh rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[0.60, 0.35]} />
              <meshStandardMaterial color="#080c16" roughness={0.5} />
            </mesh>

            {/* Glowing active code lines in IDE */}
            <group rotation={[0, Math.PI, 0]}>
              {[
                { y: 0.12, w: 0.28, color: "#38bdf8" },
                { y: 0.08, w: 0.44, color: "#4ade80" },
                { y: 0.04, w: 0.36, color: "#f43f5e" },
                { y: 0.00, w: 0.50, color: "#38bdf8" },
                { y: -0.04, w: 0.34, color: "#fbbf24" },
                { y: -0.08, w: 0.42, color: "#c084fc" },
                { y: -0.12, w: 0.26, color: "#4ade80" },
              ].map((line, idx) => (
                <mesh key={idx} position={[-0.24 + line.w / 2, line.y, 0.001]}>
                  <planeGeometry args={[line.w, 0.014]} />
                  <meshBasicMaterial color={line.color} />
                </mesh>
              ))}

              {/* Active blinking cursor */}
              <mesh position={[-0.24 + 0.28, -0.12, 0.002]}>
                <planeGeometry args={[0.008, 0.018]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>

            {/* Cyan display glow illuminating Shlok and hands */}
            <pointLight position={[0, 0, -0.15]} color="#38bdf8" intensity={1.8} distance={1.8} />
          </group>
        </group>
      </group>

      {/* Mouse and notebook under the visible hands. */}
      <mesh position={[0.48, 0.672, 0.2]} scale={[0.085, 0.028, 0.115]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color="#e7ebee" roughness={0.42} />
      </mesh>
      <mesh position={[-0.48, 0.663, 0.2]}>
        <boxGeometry args={[0.2, 0.012, 0.15]} />
        <meshStandardMaterial color="#15202b" roughness={0.75} />
      </mesh>
      <mesh position={[-0.48, 0.671, 0.2]}>
        <boxGeometry args={[0.17, 0.004, 0.006]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.5} />
      </mesh>

      {/* Desk props */}
      <mesh position={[0.72, 0.71, 0.42]}>
        <cylinderGeometry args={[0.07, 0.06, 0.16, 14]} />
        <meshStandardMaterial color="#f1ede5" roughness={0.7} />
      </mesh>
      <mesh position={[-0.78, 0.74, 0.4]}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 14]} />
        <meshStandardMaterial color="#b07a52" roughness={0.8} />
      </mesh>
      <mesh position={[-0.78, 0.87, 0.4]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#4f8a5c" roughness={0.8} />
      </mesh>
    </group>
  );
}
