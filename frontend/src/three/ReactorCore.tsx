import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AssistantState } from '../types';

interface ReactorCoreProps {
  state: AssistantState;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
}

export function ReactorCore({
  state,
  scale = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
}: ReactorCoreProps) {
  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    // Rotation speed based on state
    let speedMult = 1.0;
    if (state === 'thinking') speedMult = 3.5;
    if (state === 'speaking') speedMult = 2.0;
    if (state === 'listening') speedMult = 1.4;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += 0.4 * delta * speedMult;
      outerRingRef.current.rotation.x += 0.2 * delta * speedMult;
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.z -= 0.6 * delta * speedMult;
      midRingRef.current.rotation.y += 0.3 * delta * speedMult;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= 0.8 * delta * speedMult;
      innerRingRef.current.rotation.x += 0.5 * delta * speedMult;
    }

    // Core pulsing effect
    if (coreRef.current) {
      const pulseBase = state === 'speaking' ? 0.3 : state === 'listening' ? 0.2 : 0.08;
      const pulseSpeed = state === 'speaking' ? 8 : state === 'listening' ? 5 : 2;
      const s = 1 + Math.sin(performance.now() * 0.003 * pulseSpeed) * pulseBase;
      coreRef.current.scale.set(s, s, s);
    }

    // Particles slow orbit
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.15 * delta;
    }
  });

  // Dynamic colors based on state
  let coreColor = '#00f3ff';
  let emissiveColor = '#0088cc';
  let emissiveIntensity = 1.5;

  if (state === 'listening') {
    coreColor = '#38bdf8';
    emissiveColor = '#0284c7';
    emissiveIntensity = 2.4;
  } else if (state === 'thinking') {
    coreColor = '#818cf8';
    emissiveColor = '#4f46e5';
    emissiveIntensity = 3.0;
  } else if (state === 'speaking') {
    coreColor = '#22d3ee';
    emissiveColor = '#06b6d4';
    emissiveIntensity = 3.2;
  } else if (state === 'gesture-active') {
    coreColor = '#f43f5e';
    emissiveColor = '#e11d48';
    emissiveIntensity = 2.8;
  }

  // Particle positions
  const particleCount = 180;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.4 + Math.random() * 1.6;
    const height = (Math.random() - 0.5) * 1.5;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = height;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Mark VII Central Glowing Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.1}
          metalness={0.9}
          wireframe={state === 'thinking'}
        />
      </mesh>

      {/* Holographic Inner Ring */}
      <group ref={innerRingRef}>
        <mesh>
          <torusGeometry args={[0.9, 0.035, 16, 64]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00b4d8"
            emissiveIntensity={1.8}
            wireframe
          />
        </mesh>
      </group>

      {/* Futuristic Mid Segmented Ring */}
      <group ref={midRingRef}>
        <mesh>
          <torusGeometry args={[1.35, 0.045, 16, 48]} />
          <meshStandardMaterial
            color="#0077b6"
            emissive="#00f3ff"
            emissiveIntensity={1.2}
          />
        </mesh>
        {/* Arc reactor style segments */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.12, 0.08, 0.08]} />
              <meshStandardMaterial
                color="#00f3ff"
                emissive="#00f3ff"
                emissiveIntensity={2.0}
              />
            </mesh>
          );
        })}
      </group>

      {/* Outer Holographic HUD Ring */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[1.85, 0.03, 16, 80]} />
          <meshStandardMaterial
            color="#00b4d8"
            emissive="#0077b6"
            emissiveIntensity={1.0}
            wireframe
          />
        </mesh>
        {/* Compass markings */}
        {[0, 90, 180, 270].map((deg, idx) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh key={idx} position={[Math.cos(rad) * 1.85, Math.sin(rad) * 1.85, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#00f3ff" emissiveIntensity={2} />
            </mesh>
          );
        })}
      </group>

      {/* Orbiting energy particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={coreColor}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Central point light for dramatic holographic glow */}
      <pointLight color={coreColor} intensity={4} distance={6} />
    </group>
  );
}
