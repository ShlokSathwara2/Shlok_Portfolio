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

      {/* Laptop: Photorealistic CNC anodized Space Gray developer workstation */}
      <group position={[0, 0.665, 0.35]}>
        {/* Laptop chassis base (anodized space-gray aluminum with slim profile) */}
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[0.66, 0.02, 0.42]} />
          <meshStandardMaterial color="#1c212b" metalness={0.82} roughness={0.26} />
        </mesh>

        {/* Front thumb notch groove */}
        <mesh position={[0, 0.019, -0.208]}>
          <boxGeometry args={[0.11, 0.005, 0.006]} />
          <meshStandardMaterial color="#0f131a" roughness={0.7} />
        </mesh>

        {/* Large glass precision trackpad */}
        <mesh position={[0, 0.023, -0.115]}>
          <boxGeometry args={[0.22, 0.002, 0.135]} />
          <meshStandardMaterial color="#232936" roughness={0.32} metalness={0.4} />
        </mesh>
        {/* Trackpad subtle border rim */}
        <mesh position={[0, 0.0225, -0.115]}>
          <boxGeometry args={[0.224, 0.001, 0.139]} />
          <meshStandardMaterial color="#384355" roughness={0.5} />
        </mesh>

        {/* Recessed keyboard deck */}
        <mesh position={[0, 0.0225, 0.055]}>
          <boxGeometry args={[0.56, 0.002, 0.22]} />
          <meshStandardMaterial color="#0c0f16" roughness={0.8} />
        </mesh>

        {/* Left speaker grille strip */}
        <mesh position={[-0.30, 0.023, 0.055]}>
          <boxGeometry args={[0.025, 0.002, 0.20]} />
          <meshStandardMaterial color="#141822" roughness={0.85} />
        </mesh>
        {/* Right speaker grille strip */}
        <mesh position={[0.30, 0.023, 0.055]}>
          <boxGeometry args={[0.025, 0.002, 0.20]} />
          <meshStandardMaterial color="#141822" roughness={0.85} />
        </mesh>

        {/* Individual chiclet keyboard key rows with cyber backlighting */}
        {[-0.035, 0.008, 0.052, 0.095, 0.138].map((z, rowIdx) => (
          <mesh key={rowIdx} position={[0, 0.026, z]}>
            <boxGeometry args={[0.53, 0.004, 0.032]} />
            <meshStandardMaterial
              color="#171d28"
              roughness={0.45}
              metalness={0.2}
              emissive="#38bdf8"
              emissiveIntensity={0.22}
            />
          </mesh>
        ))}

        {/* Titanium magnetic hinge cylinder at back edge (+z) */}
        <mesh position={[0, 0.026, 0.198]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.010, 0.010, 0.60, 24]} />
          <meshStandardMaterial color="#2d3340" metalness={0.88} roughness={0.2} />
        </mesh>

        {/* Laptop screen lid (ergonomic ~105° open angle, tilted back towards +z) */}
        <group position={[0, 0.028, 0.198]} rotation={[0.22, 0, 0]}>
          {/* Outer aluminum display shell */}
          <mesh position={[0, 0.20, 0]}>
            <boxGeometry args={[0.66, 0.40, 0.012]} />
            <meshStandardMaterial color="#1c212b" metalness={0.82} roughness={0.26} />
          </mesh>

          {/* Iconic HP Premium 4-Slash Minimalist Chrome Logo on lid exterior */}
          <group position={[0, 0.20, 0.007]} rotation={[0, 0, -0.44]}>
            {/* 4 Angled Chrome Slits of the iconic HP Spectre logo */}
            <mesh position={[-0.021, -0.010, 0]}>
              <planeGeometry args={[0.005, 0.044]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.08} />
            </mesh>
            <mesh position={[-0.007, 0.008, 0]}>
              <planeGeometry args={[0.005, 0.070]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.08} />
            </mesh>
            <mesh position={[0.007, -0.008, 0]}>
              <planeGeometry args={[0.005, 0.070]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.08} />
            </mesh>
            <mesh position={[0.021, 0.010, 0]}>
              <planeGeometry args={[0.005, 0.044]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.08} />
            </mesh>
          </group>

          {/* Interactive Retina IDE Screen */}
          <InteractiveIdeScreen />
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

function InteractiveIdeScreen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const tabRef = useRef<0 | 1>(0);
  const charIndexRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const flashRef = useRef(0);

  const snippets = useMemo(
    () => [
      {
        filename: "SurplusShareController.java",
        lang: "Java 21",
        path: "surplusshare  >  src  >  main  >  java  >  SurplusShareController.java",
        tree: [
          { name: "SURPLUSSHARE", indent: 0, folder: true, open: true },
          { name: "src/main/java", indent: 1, folder: true, open: true },
          { name: "SurplusShareController.java", indent: 2, active: true },
          { name: "DispatchService.java", indent: 2 },
          { name: "JwtAuthFilter.java", indent: 2 },
          { name: "pom.xml", indent: 1 },
          { name: "SHOPWISE-ML", indent: 0, folder: true, open: true },
          { name: "hybrid_pipeline.py", indent: 1 },
          { name: "main.py", indent: 1 },
        ],
        lines: [
          "package com.shlok.surplusshare.controller;",
          "",
          "@RestController",
          "@RequestMapping(\"/api/v1/dispatch\")",
          "public class SurplusShareController {",
          "  private final DispatchService dispatchService;",
          "",
          "  @PostMapping(\"/claim/{id}\")",
          "  public ResponseEntity<ClaimResult> claimFood(",
          "      @AuthenticationPrincipal User receiver,",
          "      @PathVariable Long id) {",
          "    var claim = dispatchService.lockAndAssign(id, receiver);",
          "    notificationService.broadcast(claim.getDonor());",
          "    return ResponseEntity.ok(new ClaimResult(claim));",
          "  }",
          "}",
        ],
        terminalCmd: "shlok@macbook:~/SurplusShare (main) $ ./mvnw test -Dtest=SmokeTest",
        terminalOut: [
          "[INFO] Running com.shlok.surplusshare.SmokeTest",
          "[INFO] Tests run: 36, Failures: 0, Errors: 0, Time: 0.88 s",
          "[INFO] BUILD SUCCESS — JWT & Auto-Reject workflow verified",
        ],
      },
      {
        filename: "hybrid_pipeline.py",
        lang: "Python 3.11",
        path: "shopwise-ml  >  recommender  >  hybrid_pipeline.py",
        tree: [
          { name: "SURPLUSSHARE", indent: 0, folder: true, open: false },
          { name: "SHOPWISE-ML", indent: 0, folder: true, open: true },
          { name: "recommender", indent: 1, folder: true, open: true },
          { name: "hybrid_pipeline.py", indent: 2, active: true },
          { name: "svd_model.py", indent: 2 },
          { name: "tfidf_encoder.py", indent: 2 },
          { name: "main.py", indent: 1 },
          { name: "requirements.txt", indent: 1 },
        ],
        lines: [
          "from fastapi import FastAPI, Query",
          "from recommender.hybrid import TunedHybridEngine",
          "",
          "app = FastAPI(title=\"Shopwise Recommender API\")",
          "engine = TunedHybridEngine.load(\"artifacts/uci_hybrid.pkl\")",
          "",
          "@app.post(\"/api/v2/recommend/{user_id}\")",
          "async def predict_items(user_id: int, top_k: int = Query(5)):",
          "    # Tuned hybrid: Popularity + TF-IDF + Item-CF + SVD",
          "    recs = engine.predict(user_id=user_id, k=top_k)",
          "    return {",
          "        \"user_id\": user_id,",
          "        \"recommendations\": recs,",
          "        \"median_latency_ms\": 14.2",
          "    }",
        ],
        terminalCmd: "shlok@macbook:~/Shopwise (main) $ uvicorn main:app --port 8000",
        terminalOut: [
          "INFO:     Loaded UCI Online Retail II (7,463 orders)",
          "INFO:     Uvicorn running on http://127.0.0.1:8000",
          "INFO:     POST /api/v2/recommend/14820 200 OK (14.2ms)",
        ],
      },
    ],
    []
  );

  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1280;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    textureRef.current = tex;
    return tex;
  }, []);

  useFrame((state) => {
    const canvas = canvasRef.current;
    const tex = textureRef.current;
    if (!canvas || !tex) return;

    const now = state.clock.elapsedTime;
    if (now - lastUpdateRef.current < 0.045) return;
    lastUpdateRef.current = now;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    charIndexRef.current += 1;
    const activeTab = tabRef.current;
    const snippet = snippets[activeTab];

    const W = 2048;
    const H = 1280;

    // 1. Classy High-End Developer Wallpaper (Deep midnight silk wave gradient)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#070c18");
    bgGrad.addColorStop(0.35, "#0b172d");
    bgGrad.addColorStop(0.65, "#081020");
    bgGrad.addColorStop(1, "#03060c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle ambient wallpaper light ribbons
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    ctx.bezierCurveTo(W * 0.35, H * 0.45, W * 0.65, H * 0.85, W, H * 0.4);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    const ribbonGrad = ctx.createLinearGradient(0, H * 0.5, W, H);
    ribbonGrad.addColorStop(0, "rgba(56, 189, 248, 0.08)");
    ribbonGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.07)");
    ribbonGrad.addColorStop(1, "rgba(168, 85, 247, 0.05)");
    ctx.fillStyle = ribbonGrad;
    ctx.fill();
    ctx.restore();

    // 2. Classy Desktop Top Menu Bar
    ctx.fillStyle = "rgba(10, 15, 25, 0.85)";
    ctx.fillRect(0, 0, W, 42);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(0, 41, W, 1);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("Code", 28, 26);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillText("File     Edit     Selection     View     Go     Run     Terminal     Help", 85, 26);

    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Vadodara, IN   ·   17:30   ·   HP Spectre x360   ·   [⚡ 98%]", W - 490, 26);

    // 3. Floating VS Code Application Window (with luxury dropshadow & rounded border)
    const winX = 110;
    const winY = 68;
    const winW = 1828;
    const winH = 1100;
    const r = 14;

    // Window shadow
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.roundRect(winX - 8, winY - 4, winW + 16, winH + 16, r + 4);
    ctx.fill();
    ctx.restore();

    // Window clip & base
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, r);
    ctx.clip();

    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(winX, winY, winW, winH);

    // Window Titlebar (#181818)
    ctx.fillStyle = "#181818";
    ctx.fillRect(winX, winY, winW, 48);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(winX, winY + 47, winW, 1);

    // Traffic light dots
    [
      { x: winX + 28, c: "#ff5f57" },
      { x: winX + 54, c: "#febc2e" },
      { x: winX + 80, c: "#28c840" },
    ].forEach((dot) => {
      ctx.fillStyle = dot.c;
      ctx.beginPath();
      ctx.arc(dot.x, winY + 24, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Command palette search
    ctx.fillStyle = "#242424";
    ctx.fillRect(winX + 520, winY + 9, 680, 30);
    ctx.strokeStyle = "#383838";
    ctx.lineWidth = 1;
    ctx.strokeRect(winX + 520, winY + 9, 680, 30);
    ctx.fillStyle = "#8b949e";
    ctx.font = "15px system-ui, -apple-system, sans-serif";
    ctx.fillText("SurplusShare — Visual Studio Code", winX + 740, winY + 29);

    // Activity Bar (Leftmost 64px inside window)
    ctx.fillStyle = "#181818";
    ctx.fillRect(winX, winY + 48, 64, winH - 82);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(winX + 63, winY + 48, 1, winH - 82);

    ctx.fillStyle = "#007acc";
    ctx.fillRect(winX, winY + 68, 3, 44);
    ctx.strokeStyle = "#d4d4d4";
    ctx.lineWidth = 2;
    ctx.strokeRect(winX + 20, winY + 76, 22, 28);
    ctx.strokeStyle = "#6e7681";
    ctx.beginPath();
    ctx.arc(winX + 31, winY + 155, 10, 0, Math.PI * 2);
    ctx.stroke();

    // File Explorer Sidebar (x: winX + 64 .. winX + 340)
    ctx.fillStyle = "#181818";
    ctx.fillRect(winX + 64, winY + 48, 276, winH - 82);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(winX + 339, winY + 48, 1, winH - 82);

    ctx.fillStyle = "#bbbbbb";
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText("EXPLORER", winX + 86, winY + 82);

    snippet.tree.forEach((item, idx) => {
      const iy = winY + 118 + idx * 34;
      if (item.active) {
        ctx.fillStyle = "#37373d";
        ctx.fillRect(winX + 64, iy - 22, 275, 32);
      }
      ctx.fillStyle = item.active ? "#ffffff" : item.folder ? "#cccccc" : "#9da5b4";
      ctx.font = item.folder
        ? "600 15px system-ui, -apple-system, sans-serif"
        : "15px system-ui, -apple-system, sans-serif";
      const prefix = item.folder ? (item.open ? "▾ " : "▸ ") : "  ";
      ctx.fillText(prefix + item.name, winX + 86 + item.indent * 20, iy);
    });

    // Editor Tabs Bar
    const editorX = winX + 340;
    const editorW = winW - 340;
    ctx.fillStyle = "#181818";
    ctx.fillRect(editorX, winY + 48, editorW, 50);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(editorX, winY + 97, editorW, 1);

    snippets.forEach((s, idx) => {
      const isCurrent = idx === activeTab;
      const tabX = editorX + idx * 300;
      ctx.fillStyle = isCurrent ? "#1f1f1f" : "#181818";
      ctx.fillRect(tabX, winY + 48, 300, 49);
      if (isCurrent) {
        ctx.fillStyle = "#007acc";
        ctx.fillRect(tabX, winY + 48, 300, 3);
      }
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(tabX + 299, winY + 48, 1, 49);

      ctx.fillStyle = isCurrent ? "#ffffff" : "#8b949e";
      ctx.font = "16px system-ui, -apple-system, sans-serif";
      ctx.fillText(s.filename, tabX + 22, winY + 79);
    });

    // Breadcrumb bar
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(editorX, winY + 98, editorW, 36);
    ctx.fillStyle = "#8b949e";
    ctx.font = "15px system-ui, -apple-system, sans-serif";
    ctx.fillText(snippet.path, editorX + 24, winY + 122);

    // Code Editor Area
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(editorX, winY + 134, editorW, 640);

    // Indent guides
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(editorX + 96, winY + 148, 1, 610);
    ctx.fillRect(editorX + 136, winY + 148, 1, 610);

    const lineHeight = 38;
    let drawnChars = 0;
    const maxChars = charIndexRef.current;

    for (let i = 0; i < snippet.lines.length; i++) {
      const line = snippet.lines[i];
      const lineY = winY + 176 + i * lineHeight;

      // Active line highlight
      if (drawnChars < maxChars && drawnChars + line.length >= maxChars) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        ctx.fillRect(editorX, lineY - 26, editorW - 120, lineHeight);
      }

      // Line number
      ctx.fillStyle = "#6e7681";
      ctx.font = "17px 'JetBrains Mono', Consolas, monospace";
      ctx.fillText(String(i + 1).padStart(2, " "), editorX + 24, lineY);

      if (drawnChars < maxChars) {
        const charsToDraw = Math.min(line.length, maxChars - drawnChars);
        const sub = line.slice(0, charsToDraw);

        if (sub.trim().startsWith("//") || sub.trim().startsWith("#")) {
          ctx.fillStyle = "#6a9955";
        } else if (sub.trim().startsWith("@")) {
          ctx.fillStyle = "#dcdcaa";
        } else if (
          sub.trim().startsWith("package") ||
          sub.trim().startsWith("import") ||
          sub.trim().startsWith("from") ||
          sub.trim().startsWith("public") ||
          sub.trim().startsWith("async") ||
          sub.trim().startsWith("return")
        ) {
          ctx.fillStyle = "#c586c0";
        } else if (sub.includes("\"")) {
          ctx.fillStyle = "#ce9178";
        } else if (sub.includes("ResponseEntity") || sub.includes("FastAPI") || sub.includes("DispatchService")) {
          ctx.fillStyle = "#4ec9b0";
        } else {
          ctx.fillStyle = "#d4d4d4";
        }

        ctx.font = "20px 'JetBrains Mono', Consolas, monospace";
        ctx.fillText(sub, editorX + 76, lineY);
        drawnChars += line.length;

        // Thin authentic caret
        if (drawnChars >= maxChars && Math.floor(now * 2.6) % 2 === 0) {
          const textWidth = ctx.measureText(sub).width;
          ctx.fillStyle = "#aeafad";
          ctx.fillRect(editorX + 78 + textWidth, lineY - 20, 2.5, 24);
        }
      }
    }

    if (drawnChars >= snippet.lines.join("").length + 80) {
      charIndexRef.current = 0;
      tabRef.current = activeTab === 0 ? 1 : 0;
    }

    // Code Minimap (Right edge)
    const minimapX = editorX + editorW - 110;
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(minimapX, winY + 134, 110, 640);
    for (let m = 0; m < 22; m++) {
      ctx.fillStyle = m % 4 === 0 ? "#4ec9b0" : m % 3 === 0 ? "#c586c0" : "#555555";
      ctx.globalAlpha = 0.32;
      ctx.fillRect(minimapX + 12, winY + 152 + m * 13, 36 + ((m * 17) % 50), 4);
    }
    ctx.globalAlpha = 1;

    // Integrated Terminal Panel
    const termY = winY + 774;
    const termH = winH - 808;
    ctx.fillStyle = "#181818";
    ctx.fillRect(editorX, termY, editorW, termH);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(editorX, termY, editorW, 1);

    ctx.fillStyle = "#8b949e";
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillText("PROBLEMS     OUTPUT     DEBUG CONSOLE", editorX + 24, termY + 30);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("TERMINAL", editorX + 348, termY + 30);
    ctx.fillStyle = "#007acc";
    ctx.fillRect(editorX + 348, termY + 37, 72, 2);

    ctx.fillStyle = "#4ec9b0";
    ctx.font = "18px 'JetBrains Mono', Consolas, monospace";
    ctx.fillText(snippet.terminalCmd, editorX + 24, termY + 76);

    snippet.terminalOut.forEach((tLine, idx) => {
      ctx.fillStyle = tLine.includes("SUCCESS") || tLine.includes("200 OK") ? "#4ade80" : "#cccccc";
      ctx.font = "17px 'JetBrains Mono', Consolas, monospace";
      ctx.fillText(tLine, editorX + 24, termY + 114 + idx * 30);
    });

    // VS Code Blue Status Bar at bottom of window
    ctx.fillStyle = "#007acc";
    ctx.fillRect(winX, winY + winH - 34, winW, 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px system-ui, -apple-system, sans-serif";
    ctx.fillText("⎇ main*    ⊗ 0   ⚠ 0", winX + 20, winY + winH - 12);
    ctx.fillText(`Ln 12, Col 42     Spaces: 4     UTF-8     ${snippet.lang}`, winX + winW - 460, winY + winH - 12);

    ctx.restore(); // End window clip

    // 4. Classy Desktop Dock at screen bottom
    const dockW = 460;
    const dockH = 68;
    const dockX = (W - dockW) / 2;
    const dockY = H - 86;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(dockX, dockY, dockW, dockH, 20);
    ctx.fill();
    ctx.stroke();

    // Dock app icons
    const apps = [
      { name: "Finder", color: "#38bdf8" },
      { name: "Terminal", color: "#1e293b" },
      { name: "VS Code", color: "#007acc", active: true },
      { name: "Chrome", color: "#ea4335" },
      { name: "GitHub", color: "#8b5cf6" },
      { name: "Settings", color: "#64748b" },
    ];

    apps.forEach((app, idx) => {
      const ax = dockX + 26 + idx * 72;
      const ay = dockY + 14;

      ctx.fillStyle = app.color;
      ctx.beginPath();
      ctx.roundRect(ax, ay, 40, 40, 10);
      ctx.fill();

      if (app.active) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ax + 20, dockY + 60, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashRef.current * 0.12})`;
      ctx.fillRect(0, 0, W, H);
      flashRef.current -= 0.08;
    }

    tex.needsUpdate = true;
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    tabRef.current = tabRef.current === 0 ? 1 : 0;
    charIndexRef.current = 0;
    flashRef.current = 1.0;
  };

  return (
    <group position={[0, 0.20, -0.007]} onClick={handleClick}>
      {/* Piano-black glass bezel */}
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.645, 0.388]} />
        <meshStandardMaterial color="#05080f" metalness={0.92} roughness={0.14} />
      </mesh>

      {/* Centered HD camera aperture & lens dot */}
      <mesh position={[0, 0.183, -0.0015]}>
        <circleGeometry args={[0.0035, 16]} />
        <meshBasicMaterial color="#020408" />
      </mesh>
      <mesh position={[-0.001, 0.184, -0.002]}>
        <circleGeometry args={[0.001, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0.012, 0.183, -0.0015]}>
        <circleGeometry args={[0.0012, 12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* Physically shaded backlit IPS/OLED display */}
      {texture && (
        <mesh position={[0, -0.004, -0.0018]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.612, 0.354]} />
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={0.88}
            roughness={0.22}
            metalness={0.08}
          />
        </mesh>
      )}

      {/* Subtle anti-reflective glass coating */}
      <mesh position={[0, -0.004, -0.003]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.612, 0.354]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          roughness={0.08}
          metalness={0.4}
        />
      </mesh>

      {/* Natural screen ambient glow on hands and keyboard */}
      <pointLight position={[0, 0, -0.18]} color="#7dd3fc" intensity={1.8} distance={1.8} />
    </group>
  );
}
