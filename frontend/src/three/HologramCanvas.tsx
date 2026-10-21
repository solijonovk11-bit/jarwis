import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ReactorCore } from './ReactorCore';
import { DrawingLayer } from './DrawingLayer';
import { HandCursors } from './HandCursors';
import { AssistantState, DrawnStroke } from '../types';

interface HologramCanvasProps {
  state: AssistantState;
  reactorScale: number;
  reactorRotation: [number, number, number];
  reactorPosition: [number, number, number];
  strokes: DrawnStroke[];
  currentLeftStroke: [number, number, number][];
  currentRightStroke: [number, number, number][];
  leftHandPos: [number, number, number] | null;
  rightHandPos: [number, number, number] | null;
  leftGesture?: string;
  rightGesture?: string;
  colorLeft?: string;
  colorRight?: string;
  controlsEnabled?: boolean;
}

export function HologramCanvas({
  state,
  reactorScale,
  reactorRotation,
  reactorPosition,
  strokes,
  currentLeftStroke,
  currentRightStroke,
  leftHandPos,
  rightHandPos,
  leftGesture,
  rightGesture,
  colorLeft = '#ec4899',
  colorRight = '#00f3ff',
  controlsEnabled = true,
}: HologramCanvasProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 7]} intensity={1.2} />
          <directionalLight position={[-5, -10, -7]} intensity={0.5} color="#0066ff" />

          {/* Central Reactor Core */}
          <ReactorCore
            state={state}
            scale={reactorScale}
            rotation={reactorRotation}
            position={reactorPosition}
          />

          {/* 3D Drawings */}
          <DrawingLayer
            strokes={strokes}
            currentLeftStroke={currentLeftStroke}
            currentRightStroke={currentRightStroke}
            colorLeft={colorLeft}
            colorRight={colorRight}
          />

          {/* 3D Hand Cursors */}
          <HandCursors
            leftPos={leftHandPos}
            rightPos={rightHandPos}
            leftGesture={leftGesture}
            rightGesture={rightGesture}
          />

          {/* Mouse / Orbit Controls when gestures aren't taking over */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            enabled={controlsEnabled}
            maxDistance={12}
            minDistance={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
