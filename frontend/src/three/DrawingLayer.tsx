import { useMemo } from 'react';
import * as THREE from 'three';
import { DrawnStroke } from '../types';

interface DrawingLayerProps {
  strokes: DrawnStroke[];
  currentLeftStroke?: [number, number, number][];
  currentRightStroke?: [number, number, number][];
  colorLeft?: string;
  colorRight?: string;
}

export function DrawingLayer({
  strokes,
  currentLeftStroke = [],
  currentRightStroke = [],
  colorLeft = '#ec4899',
  colorRight = '#00f3ff',
}: DrawingLayerProps) {
  return (
    <group>
      {/* Saqlangan barcha chizmalar */}
      {strokes.map((stroke) => (
        <SingleStroke key={stroke.id} stroke={stroke} />
      ))}

      {/* Chap qo'l chizayotgan aktiv chiziq */}
      {currentLeftStroke.length > 1 && (
        <ActiveStroke points={currentLeftStroke} color={colorLeft} />
      )}

      {/* O'ng qo'l chizayotgan aktiv chiziq */}
      {currentRightStroke.length > 1 && (
        <ActiveStroke points={currentRightStroke} color={colorRight} />
      )}
    </group>
  );
}

function SingleStroke({ stroke }: { stroke: DrawnStroke }) {
  const lineObj = useMemo(() => {
    if (stroke.points.length < 2) return null;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(stroke.points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(stroke.color),
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Line(geometry, material);
  }, [stroke.points, stroke.color]);

  if (!lineObj) return null;

  return <primitive object={lineObj} />;
}

function ActiveStroke({ points, color }: { points: [number, number, number][]; color: string }) {
  const lineObj = useMemo(() => {
    if (points.length < 2) return null;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      linewidth: 4,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Line(geometry, material);
  }, [points, color]);

  if (!lineObj) return null;

  return <primitive object={lineObj} />;
}
