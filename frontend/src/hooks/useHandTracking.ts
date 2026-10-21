import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { DetectedHand, LandmarkPoint } from '../types';

interface UseHandTrackingProps {
  onFingertipMove?: (hand: 'Left' | 'Right', coords: [number, number, number], gesture: string) => void;
  onTwoHandTransform?: (distanceDelta: number, angleDelta: number, centerDelta: [number, number, number]) => void;
}

export function useHandTracking({ onFingertipMove, onTwoHandTransform }: UseHandTrackingProps = {}) {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedHands, setDetectedHands] = useState<DetectedHand[]>([]);
  const [fps, setFps] = useState<number>(0);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [sensitivity, setSensitivity] = useState<number>(1.2);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastFrameTimestampRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Smoothing buffers for hands
  const prevPointsRef = useRef<{ [key: string]: [number, number, number] }>({});
  const prevTwoHandDistRef = useRef<number | null>(null);
  const prevTwoHandAngleRef = useRef<number | null>(null);
  const prevTwoHandCenterRef = useRef<[number, number, number] | null>(null);

  // Load MediaPipe Model
  const initModel = async (): Promise<HandLandmarker | null> => {
    if (handLandmarkerRef.current) return handLandmarkerRef.current;
    try {
      setIsModelLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      handLandmarkerRef.current = landmarker;
      setIsModelLoading(false);
      return landmarker;
    } catch (err: any) {
      console.error('MediaPipe yuklanishida xatolik:', err);
      setIsModelLoading(false);
      setCameraError(`Sun'iy intellekt modeli yuklanmadi: ${err.message || 'Internet aloqasini tekshiring'}`);
      return null;
    }
  };

  // Distance helper
  const dist = (p1: LandmarkPoint, p2: LandmarkPoint) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // Recognize hand gesture
  const classifyGesture = (landmarks: LandmarkPoint[]): string => {
    if (!landmarks || landmarks.length < 21) return 'NOMA\'LUM';

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    // Pinch: Thumb Tip va Index Tip bir-biriga yaqin
    const pinchDist = dist(thumbTip, indexTip);
    if (pinchDist < 0.065) {
      return 'PINCH (USHSHASH)';
    }

    // Barmoqlar ochiq/yopiq holati (wristdan uzoqlik)
    const indexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.25;
    const middleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.25;
    const ringExtended = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.25;
    const pinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.25;
    const thumbExtended = dist(thumbTip, wrist) > dist(thumbMcp, wrist) * 1.2;

    // Ko'rsatkich barmog'i ochiq, qolganlari bukilgan -> CHIZISH
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'KO\'RSATKICH (CHIZISH)';
    }

    // Barcha barmoqlar ochiq -> OCHIQ KAFT
    if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      return 'OCHIQ KAFT (PAUZA)';
    }

    // Barcha barmoqlar bukilgan -> MUSHT
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'MUSHT (REJIM)';
    }

    return 'FAOL HARAKAT';
  };

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      const landmarker = await initModel();
      if (!landmarker) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          renderLoop();
        };
      }
    } catch (err: any) {
      console.error('Kamera ruxsatida xatolik:', err);
      let msg = 'Kamerani yoqish imkoni bo\'lmadi.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Kameradan foydalanishga brauzerda ruxsat berilmadi. Iltimos, kamera ruxsatini yoqing.';
      } else if (err.name === 'NotFoundError') {
        msg = 'Qurilmada kamera topilmadi.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Kamera boshqa dastur tomonidan band qilingan.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setDetectedHands([]);
    prevTwoHandDistRef.current = null;
    prevTwoHandAngleRef.current = null;
    prevTwoHandCenterRef.current = null;

    // Canvas tozalash
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Draw hand skeleton on canvas
  const drawSkeleton = (ctx: CanvasRenderingContext2D, hands: DetectedHand[], width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], // Palm bridge
    ];

    hands.forEach((hand) => {
      const isRight = hand.handedness === 'Right';
      const mainColor = isRight ? '#00f3ff' : '#ec4899';
      const glowColor = isRight ? 'rgba(0, 243, 255, 0.5)' : 'rgba(236, 72, 153, 0.5)';

      // Chiziqlarni chizish
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = mainColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      connections.forEach(([start, end]) => {
        const p1 = hand.landmarks[start];
        const p2 = hand.landmarks[end];
        if (!p1 || !p2) return;

        const x1 = isMirrored ? (1 - p1.x) * width : p1.x * width;
        const y1 = p1.y * height;
        const x2 = isMirrored ? (1 - p2.x) * width : p2.x * width;
        const y2 = p2.y * height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Nuqtalarni chizish
      hand.landmarks.forEach((p, idx) => {
        const x = isMirrored ? (1 - p.x) * width : p.x * width;
        const y = p.y * height;
        const isTip = [4, 8, 12, 16, 20].includes(idx);

        ctx.beginPath();
        ctx.arc(x, y, isTip ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? '#ffffff' : mainColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isTip ? 12 : 6;
        ctx.fill();

        // Index uchi uchun maxsus nur
        if (idx === 8) {
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    });
  };

  // Processing loop
  const renderLoop = () => {
    if (!videoRef.current || !handLandmarkerRef.current) return;

    const video = videoRef.current;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const startTimeMs = performance.now();

      // Detect hands
      const result: HandLandmarkerResult = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

      // FPS hisoblash
      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastFrameTimestampRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFrameTimestampRef.current = now;
      }

      // Hands ma'lumotlarini qayta ishlash
      const detected: DetectedHand[] = [];
      if (result.landmarks && result.landmarks.length > 0) {
        result.landmarks.forEach((landmarks, idx) => {
          const rawHandedness = result.handednesses[idx]?.[0]?.categoryName || (idx === 0 ? 'Right' : 'Left');
          // MediaPipe video self-cam qaraganda handedness teskari bo'lishi mumkin
          const handedness = rawHandedness === 'Right' ? 'Right' : 'Left';
          const confidence = result.handednesses[idx]?.[0]?.score || 0.9;
          const gesture = classifyGesture(landmarks);

          detected.push({
            handedness,
            landmarks,
            gesture,
            confidence: Math.round(confidence * 100),
          });

          // 3D fazoga ko'chirish: index barmoq uchi (landmark 8)
          const indexTip = landmarks[8];
          if (indexTip) {
            // Normalizatsiya (-3 dan +3 gacha)
            const normX = isMirrored ? (indexTip.x - 0.5) * 6 * sensitivity : (0.5 - indexTip.x) * 6 * sensitivity;
            const normY = (0.5 - indexTip.y) * 4.5 * sensitivity;
            const normZ = -(indexTip.z || 0) * 10;

            // Exponential smoothing
            const prev = prevPointsRef.current[handedness] || [normX, normY, normZ];
            const smoothX = prev[0] * 0.4 + normX * 0.6;
            const smoothY = prev[1] * 0.4 + normY * 0.6;
            const smoothZ = prev[2] * 0.4 + normZ * 0.6;
            prevPointsRef.current[handedness] = [smoothX, smoothY, smoothZ];

            onFingertipMove?.(handedness, [smoothX, smoothY, smoothZ], gesture);
          }
        });
      }

      setDetectedHands(detected);

      // Ikkala qo'l aniqlanganda o'zaro transformatsiya (scale, rotate, translate)
      if (detected.length >= 2) {
        const h1 = detected[0].landmarks[0]; // Wrist 1
        const h2 = detected[1].landmarks[0]; // Wrist 2
        if (h1 && h2) {
          const currentDist = dist(h1, h2);
          const currentAngle = Math.atan2(h2.y - h1.y, h2.x - h1.x);
          const currentCenter: [number, number, number] = [
            ((h1.x + h2.x) / 2 - 0.5) * 5,
            (0.5 - (h1.y + h2.y) / 2) * 4,
            0
          ];

          if (prevTwoHandDistRef.current !== null && prevTwoHandAngleRef.current !== null && prevTwoHandCenterRef.current !== null) {
            const distanceDelta = currentDist - prevTwoHandDistRef.current;
            const angleDelta = currentAngle - prevTwoHandAngleRef.current;
            const centerDelta: [number, number, number] = [
              currentCenter[0] - prevTwoHandCenterRef.current[0],
              currentCenter[1] - prevTwoHandCenterRef.current[1],
              0
            ];

            onTwoHandTransform?.(distanceDelta, angleDelta, centerDelta);
          }

          prevTwoHandDistRef.current = currentDist;
          prevTwoHandAngleRef.current = currentAngle;
          prevTwoHandCenterRef.current = currentCenter;
        }
      } else {
        prevTwoHandDistRef.current = null;
        prevTwoHandAngleRef.current = null;
        prevTwoHandCenterRef.current = null;
      }

      // Skeletni Canvasda aks ettirish
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawSkeleton(ctx, detected, canvas.width, canvas.height);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraActive,
    isModelLoading,
    cameraError,
    detectedHands,
    fps,
    isMirrored,
    setIsMirrored,
    sensitivity,
    setSensitivity,
    startCamera,
    stopCamera,
  };
}
