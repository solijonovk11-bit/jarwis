import { Camera, CameraOff, FlipHorizontal, Sliders, AlertCircle, Sparkles } from 'lucide-react';
import { DetectedHand } from '../../types';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  isModelLoading: boolean;
  cameraError: string | null;
  detectedHands: DetectedHand[];
  fps: number;
  isMirrored: boolean;
  onToggleMirror: () => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export function CameraPanel({
  videoRef,
  canvasRef,
  isCameraActive,
  isModelLoading,
  cameraError,
  detectedHands,
  fps,
  isMirrored,
  onToggleMirror,
  sensitivity,
  onSensitivityChange,
  onStartCamera,
  onStopCamera,
}: CameraPanelProps) {
  const leftHand = detectedHands.find((h) => h.handedness === 'Left');
  const rightHand = detectedHands.find((h) => h.handedness === 'Right');

  return (
    <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 flex flex-col space-y-2.5">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
            Veb-Kamera & Qo'l Kuzatuv (MediaPipe)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isCameraActive && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/30">
              FPS: {fps}
            </span>
          )}
          <button
            onClick={isCameraActive ? onStopCamera : onStartCamera}
            disabled={isModelLoading}
            className={`px-3 py-1 text-xs font-mono rounded border transition-all flex items-center space-x-1.5 ${
              isCameraActive
                ? 'border-rose-500/50 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40'
                : 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 shadow-[0_0_12px_rgba(0,243,255,0.3)]'
            }`}
          >
            {isModelLoading ? (
              <span className="animate-pulse">Yuklanmoqda...</span>
            ) : isCameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>O'chirish</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Kamerani yoqish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {cameraError && (
        <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Video & Skeleton Canvas Container */}
      <div className="relative w-full aspect-video bg-black/60 rounded border border-cyan-500/20 overflow-hidden flex items-center justify-center">
        {/* Real Live Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${isCameraActive ? 'opacity-85' : 'opacity-0'}`}
        />

        {/* Real-time Skeleton Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {/* Camera Inactive Placeholder */}
        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center text-center p-4 z-0">
            <CameraOff className="w-8 h-8 text-cyan-500/40 mb-2" />
            <p className="text-xs text-cyan-300/70 font-mono">Kamera hozircha nofaol</p>
            <p className="text-[11px] text-cyan-200/50 max-w-xs mt-1">
              Ikkala qo'l bilan 3D boshqaruv va chizish uchun "Kamerani yoqish" tugmasini bosing.
            </p>
          </div>
        )}

        {/* Model loading indicator */}
        {isModelLoading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
            <span className="text-xs font-mono text-cyan-300">MediaPipe Vision modeli yuklanmoqda...</span>
          </div>
        )}
      </div>

      {/* Camera Tuning Controls */}
      {isCameraActive && (
        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <button
            onClick={onToggleMirror}
            className={`px-2 py-1 rounded border flex items-center space-x-1.5 transition-colors ${
              isMirrored
                ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                : 'border-cyan-500/20 text-cyan-400/60'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Ko'zgu rejimi: {isMirrored ? 'YOQILGAN' : 'O\'CHIQ'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 text-[11px]">Sezgirlik: {sensitivity.toFixed(1)}x</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={sensitivity}
              onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Two Hands Real Status & Gesture Display */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
        {/* Chap Qo'l (Left Hand) */}
        <div className={`p-2 rounded border ${
          leftHand ? 'border-pink-500/40 bg-pink-950/20' : 'border-cyan-500/10 bg-black/30'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-pink-400 font-semibold text-[11px]">CHAP QO'L</span>
            <span className="text-[10px] text-pink-300/70">
              {leftHand ? `${leftHand.confidence}% ishonch` : 'Aniqlanmadi'}
            </span>
          </div>
          <p className="text-[11px] text-pink-200/90 truncate font-mono">
            {leftHand ? leftHand.gesture : '—'}
          </p>
        </div>

        {/* O'ng Qo'l (Right Hand) */}
        <div className={`p-2 rounded border ${
          rightHand ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-cyan-500/10 bg-black/30'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-cyan-400 font-semibold text-[11px]">O'NG QO'L</span>
            <span className="text-[10px] text-cyan-300/70">
              {rightHand ? `${rightHand.confidence}% ishonch` : 'Aniqlanmadi'}
            </span>
          </div>
          <p className="text-[11px] text-cyan-200/90 truncate font-mono">
            {rightHand ? rightHand.gesture : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
