import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HandCursorsProps {
  leftPos: [number, number, number] | null;
  rightPos: [number, number, number] | null;
  leftGesture?: string;
  rightGesture?: string;
  isDrawingMode?: boolean;
}

export function HandCursors({
  leftPos,
  rightPos,
  leftGesture = '',
  rightGesture = '',
  isDrawingMode = false,
}: HandCursorsProps) {
  const leftRingRef = useRef<THREE.Mesh>(null);
  const rightRingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (leftRingRef.current) leftRingRef.current.rotation.z += 2 * delta;
    if (rightRingRef.current) rightRingRef.current.rotation.z -= 2 * delta;
  });

  return (
    <group>
      {/* Chap qo'l 3D ko'rsatkichi */}
      {leftPos && (
        <group position={leftPos}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ec4899"
              emissive="#ec4899"
              emissiveIntensity={3}
            />
          </mesh>
          <mesh ref={leftRingRef}>
            <ringGeometry args={[0.12, 0.16, 32]} />
            <meshBasicMaterial
              color="#ec4899"
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}

      {/* O'ng qo'l 3D ko'rsatkichi */}
      {rightPos && (
        <group position={rightPos}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#00f3ff"
              emissive="#00f3ff"
              emissiveIntensity={3}
            />
          </mesh>
          <mesh ref={rightRingRef}>
            <ringGeometry args={[0.12, 0.16, 32]} />
            <meshBasicMaterial
              color="#00f3ff"
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
