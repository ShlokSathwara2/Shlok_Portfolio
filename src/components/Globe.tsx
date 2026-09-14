"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Trail } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function GlobeModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });
  return (
    <Trail width={0.6} length={8} color="#6366f1" attenuation={(w) => w * w}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </Trail>
  );
}

function FloatingRing({ radius, color }: { radius: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.2;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.01, 16, 100]} />
      <meshStandardMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <GlobeModel />
      <FloatingRing radius={2} color="#6366f1" />
      <FloatingRing radius={2.5} color="#a855f7" />
      <FloatingRing radius={3} color="#0ea5e9" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </>
  );
}

export default function Globe() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <GlobeScene />
      </Canvas>
    </div>
  );
}
