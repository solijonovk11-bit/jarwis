import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/hud/Header';
import { StatusIndicators } from './components/hud/StatusIndicators';
import { CameraPanel } from './components/camera/CameraPanel';
import { GestureControlsPanel } from './components/gesture/GestureControlsPanel';
import { VoiceConversationPanel } from './components/voice/VoiceConversationPanel';
import { WindowsAgentModal } from './components/agent/WindowsAgentModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { HologramCanvas } from './three/HologramCanvas';
import { useHandTracking } from './hooks/useHandTracking';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import { checkBackendHealth, sendChatMessage, fetchHistory, clearChatHistory } from './services/api';
import { fetchAgentStatus } from './services/agentApi';
import {
  AssistantState,
  ChatMessageItem,
  DrawShape,
  DrawnStroke,
  GestureSettings,
  VoiceSettings,
  WindowsAgentStatus,
} from './types';

export function App() {
  // --- 1. General States ---
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<string>('Yuklanmoqda');
  const [aiModel, setAiModel] = useState<string>('Yuklanmoqda');
  const [agentStatus, setAgentStatus] = useState<WindowsAgentStatus>({ running: false });
  const [agentToken, setAgentToken] = useState<string>('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWindowsModalOpen, setIsWindowsModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    action: 'notepad' | 'calc' | 'browser_url';
    title: string;
    description: string;
    payload?: any;
  } | null>(null);

  // --- 2. 3D Reactor Transformations (Gesture Controlled) ---
  const [reactorScale, setReactorScale] = useState<number>(1);
  const [reactorRotation, setReactorRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [reactorPosition, setReactorPosition] = useState<[number, number, number]>([0, 0, 0]);

  // --- 3. 3D Spatial Drawing States ---
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState<boolean>(true);
  const [activeShape, setActiveShape] = useState<DrawShape>('freehand');
  const [colorLeft, setColorLeft] = useState<string>('#ec4899');
  const [colorRight, setColorRight] = useState<string>('#00f3ff');

  // Real-time active drawing points
  const [currentLeftStroke, setCurrentLeftStroke] = useState<[number, number, number][]>([]);
  const [currentRightStroke, setCurrentRightStroke] = useState<[number, number, number][]>([]);

  // 3D fingertip positions
  const [leftHandPos, setLeftHandPos] = useState<[number, number, number] | null>(null);
  const [rightHandPos, setRightHandPos] = useState<[number, number, number] | null>(null);
  const [leftGesture, setLeftGesture] = useState<string>('');
  const [rightGesture, setRightGesture] = useState<string>('');

  // Settings
  const [gestureSettings, setGestureSettings] = useState<GestureSettings>({
    sensitivity: 1.2,
    isMirrored: true,
    cooldownMs: 300,
    activeShape: 'freehand',
    colorLeft: '#ec4899',
    colorRight: '#00f3ff',
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: 'uz-UZ',
    voiceURI: '',
    wakeWordEnabled: false,
    pitch: 0.95,
    rate: 1.05,
    continuous: true,
  });

  // Helper to commit shape
  const finalizeShape = (points: [number, number, number][], hand: 'Left' | 'Right', shape: DrawShape): DrawnStroke | null => {
    if (points.length < 2) return null;
    let finalPoints = points;

    if (shape === 'circle' && points.length >= 3) {
      // Calculate center and radius
      const start = points[0];
      const end = points[points.length - 1];
      const r = Math.hypot(end[0] - start[0], end[1] - start[1]) / 2;
      const cx = (start[0] + end[0]) / 2;
      const cy = (start[1] + end[1]) / 2;
      const cz = (start[2] + end[2]) / 2;
      const circlePts: [number, number, number][] = [];
      for (let i = 0; i <= 24; i++) {
        const rad = (i / 24) * Math.PI * 2;
        circlePts.push([cx + Math.cos(rad) * r, cy + Math.sin(rad) * r, cz]);
      }
      finalPoints = circlePts;
    } else if (shape === 'triangle' && points.length >= 3) {
      const p1 = points[0];
      const p2 = points[Math.floor(points.length / 2)];
      const p3 = points[points.length - 1];
      finalPoints = [p1, p2, p3, p1];
    } else if (shape === 'rectangle' && points.length >= 3) {
      const p1 = points[0];
      const p3 = points[points.length - 1];
      const p2: [number, number, number] = [p3[0], p1[1], (p1[2] + p3[2]) / 2];
      const p4: [number, number, number] = [p1[0], p3[1], (p1[2] + p3[2]) / 2];
      finalPoints = [p1, p2, p3, p4, p1];
    }

    return {
      id: `stroke-${Date.now()}-${Math.random()}`,
      hand,
      points: finalPoints,
      color: hand === 'Left' ? colorLeft : colorRight,
      shape,
    };
  };

  // --- 4. Hand Tracking Callbacks ---
  const handleFingertipMove = useCallback(
    (hand: 'Left' | 'Right', coords: [number, number, number], gesture: string) => {
      if (hand === 'Left') {
        setLeftHandPos(coords);
        setLeftGesture(gesture);
      } else {
        setRightHandPos(coords);
        setRightGesture(gesture);
      }

      // Interaction 1: INDEX POINTING -> Draw glowing line
      if (gesture.includes('CHIZISH') && isDrawingEnabled) {
        if (hand === 'Left') {
          setCurrentLeftStroke((prev) => [...prev, coords]);
        } else {
          setCurrentRightStroke((prev) => [...prev, coords]);
        }
      } else {
        // If gesture ended (e.g. Open Palm or Pinch), finalize active stroke
        if (hand === 'Left') {
          setCurrentLeftStroke((prev) => {
            if (prev.length > 2) {
              const stroke = finalizeShape(prev, 'Left', activeShape);
              if (stroke) setStrokes((all) => [...all, stroke]);
            }
            return [];
          });
        } else {
          setCurrentRightStroke((prev) => {
            if (prev.length > 2) {
              const stroke = finalizeShape(prev, 'Right', activeShape);
              if (stroke) setStrokes((all) => [...all, stroke]);
            }
            return [];
          });
        }
      }

      // Interaction 2: PINCH -> Grab and move the 3D reactor object!
      if (gesture.includes('PINCH')) {
        setReactorPosition([coords[0] * 0.7, coords[1] * 0.7, coords[2] * 0.4]);
      }
    },
    [isDrawingEnabled, activeShape, colorLeft, colorRight]
  );

  // Interaction 3 & 4: TWO HAND TRANSFORM (Scale, Rotate, Translate)
  const handleTwoHandTransform = useCallback(
    (distanceDelta: number, angleDelta: number, centerDelta: [number, number, number]) => {
      // 1. Distance changes -> Scale reactor
      setReactorScale((prev) => Math.max(0.4, Math.min(3.0, prev + distanceDelta * 3.5)));

      // 2. Angle changes -> Rotate reactor
      setReactorRotation((prev) => [prev[0], prev[1], prev[2] + angleDelta * 1.5]);

      // 3. Movement of both hands -> Shift reactor position
      setReactorPosition((prev) => [
        Math.max(-3, Math.min(3, prev[0] + centerDelta[0] * 0.3)),
        Math.max(-2, Math.min(2, prev[1] + centerDelta[1] * 0.3)),
        prev[2],
      ]);
    },
    []
  );

  const {
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
  } = useHandTracking({
    onFingertipMove: handleFingertipMove,
    onTwoHandTransform: handleTwoHandTransform,
  });

  // --- 5. Voice Assistant ---
  const handleTranscriptReceived = (text: string) => {
    handleSendMessage(text);
  };

  const {
    isListening,
    isSpeaking,
    speechSupported,
    transcript,
    selectedLanguage,
    setSelectedLanguage,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    wakeWordActive,
    setWakeWordActive,
    isMuted,
    setIsMuted,
    voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  } = useVoiceAssistant({
    onTranscriptReceived: handleTranscriptReceived,
    language: voiceSettings.language,
  });

  // Sync state with assistant
  useEffect(() => {
    if (isSpeaking) {
      setAssistantState('speaking');
    } else if (isListening) {
      setAssistantState('listening');
    } else if (isCameraActive && detectedHands.length > 0) {
      setAssistantState('gesture-active');
    } else {
      setAssistantState('idle');
    }
  }, [isSpeaking, isListening, isCameraActive, detectedHands.length]);

  // --- 6. Send Message to AI Backend ---
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setAssistantState('thinking');

    const res = await sendChatMessage(text);

    const botMsg: ChatMessageItem = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: res.reply,
      timestamp: new Date().toISOString(),
      action: res.action,
      actionPayload: res.actionPayload,
    };
    setMessages((prev) => [...prev, botMsg]);

    // Speak response out loud in Uzbek!
    speakText(res.reply);

    // If an action was suggested (e.g. notepad, calc), trigger confirmation modal
    if (res.action) {
      const titles: Record<string, string> = {
        notepad: 'Bloknot (Notepad) dasturini ochish',
        calc: 'Kalkulyator dasturini ochish',
        browser: 'Google veb-sahifasini ochish',
      };
      setPendingAction({
        action: res.action === 'browser' ? 'browser_url' : (res.action as any),
        title: titles[res.action] || `${res.action.toUpperCase()} dasturini ishga tushirish`,
        description: 'Windows agenti ushbu amalni kompyuterda bajarish uchun tasdiq talab qilmoqda.',
        payload: res.actionPayload || (res.action === 'browser' ? { url: 'https://google.com' } : {}),
      });
      setIsWindowsModalOpen(true);
    }
  };

  // --- 7. Periodic Polling for Health and Windows Agent ---
  const checkTelemetry = async () => {
    // 1. Backend check
    const bHealth = await checkBackendHealth();
    setBackendOnline(bHealth.online);
    setAiConfigured(bHealth.aiConfigured);
    setAiProvider(bHealth.provider);
    setAiModel(bHealth.model);

    // 2. Windows agent check
    const aHealth = await fetchAgentStatus();
    setAgentStatus(aHealth);
    if (aHealth.token) {
      setAgentToken(aHealth.token);
    }
  };

  useEffect(() => {
    checkTelemetry();
    // Load initial chat history
    fetchHistory().then((hist) => {
      if (hist.length > 0) setMessages(hist);
    });

    const interval = setInterval(checkTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleClearHistory = async () => {
    await clearChatHistory();
    setMessages([]);
  };

  const handleResetScene = () => {
    setReactorScale(1);
    setReactorRotation([0, 0, 0]);
    setReactorPosition([0, 0, 0]);
    setStrokes([]);
    setCurrentLeftStroke([]);
    setCurrentRightStroke([]);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-cyan-50 flex flex-col relative overflow-hidden bg-grid-pattern">
      {/* 1. Futuristic Header HUD */}
      <Header
        state={assistantState}
        backendOnline={backendOnline}
        agentOnline={agentStatus.running}
        aiConfigured={aiConfigured}
        provider={aiProvider}
        fps={fps}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 z-10 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Camera, Skeleton & Gesture Controls (3.5 cols) */}
        <section className="lg:col-span-4 flex flex-col space-y-3">
          {/* Camera Feed with MediaPipe Skeleton */}
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            isModelLoading={isModelLoading}
            cameraError={cameraError}
            detectedHands={detectedHands}
            fps={fps}
            isMirrored={isMirrored}
            onToggleMirror={() => setIsMirrored(!isMirrored)}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />

          {/* 3D Spatial Gesture & Drawing Tools */}
          <GestureControlsPanel
            activeShape={activeShape}
            onChangeShape={setActiveShape}
            colorLeft={colorLeft}
            onChangeColorLeft={setColorLeft}
            colorRight={colorRight}
            onChangeColorRight={setColorRight}
            onClearDrawings={() => setStrokes([])}
            onResetScene={handleResetScene}
            isDrawingEnabled={isDrawingEnabled}
            onToggleDrawingMode={() => setIsDrawingEnabled(!isDrawingEnabled)}
            strokesCount={strokes.length}
          />

          {/* Windows Agent Quick Launcher Trigger */}
          <div className="hud-panel p-2.5 rounded-lg border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
            <span className="text-cyan-300">Windows Tezkor Buyruqlar:</span>
            <button
              onClick={() => {
                setPendingAction(null);
                setIsWindowsModalOpen(true);
              }}
              className="px-2.5 py-1 rounded border border-cyan-400/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 transition-colors shadow-[0_0_8px_rgba(0,243,255,0.3)]"
            >
              Ilovalar menyusi ↗
            </button>
          </div>
        </section>

        {/* Center Column: 3D Holographic Scene & Reactor Core (5 cols) */}
        <section className="lg:col-span-5 flex flex-col h-[650px] lg:h-auto relative">
          <div className="hud-panel rounded-xl border border-cyan-500/30 w-full h-full relative overflow-hidden flex flex-col">
            {/* Top HUD overlay overlaying 3D scene */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10 font-mono text-[11px] text-cyan-400/70">
              <span className="tracking-widest">HOLOGRAPHIC PROJECTION [3D]</span>
              <span>MASSHTAB: {reactorScale.toFixed(2)}x</span>
            </div>

            {/* Central 3D Interactive Canvas */}
            <div className="flex-1 w-full h-full">
              <HologramCanvas
                state={assistantState}
                reactorScale={reactorScale}
                reactorRotation={reactorRotation}
                reactorPosition={reactorPosition}
                strokes={strokes}
                currentLeftStroke={currentLeftStroke}
                currentRightStroke={currentRightStroke}
                leftHandPos={leftHandPos}
                rightHandPos={rightHandPos}
                leftGesture={leftGesture}
                rightGesture={rightGesture}
                colorLeft={colorLeft}
                colorRight={colorRight}
                controlsEnabled={!isCameraActive}
              />
            </div>

            {/* Bottom HUD bar in 3D viewport */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10 font-mono text-[10px] text-cyan-300/60 border-t border-cyan-500/15 pt-2">
              <span>HOLAT: {assistantState.toUpperCase()}</span>
              <span>CHIZMALAR: {strokes.length} ta ob'ekt</span>
              <span>QO'LLAR: {detectedHands.length} ta</span>
            </div>
          </div>
        </section>

        {/* Right Column: Audio Waveform, Telemetry & Voice Assistant (3.5 cols) */}
        <section className="lg:col-span-3 flex flex-col space-y-3">
          {/* Live Waveform & Windows Telemetry */}
          <StatusIndicators state={assistantState} agentStatus={agentStatus} />

          {/* Uzbek Voice Assistant Chat Log & Input */}
          <VoiceConversationPanel
            messages={messages}
            assistantState={assistantState}
            isListening={isListening}
            isSpeaking={isSpeaking}
            speechSupported={speechSupported}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            availableVoices={availableVoices}
            selectedVoiceURI={selectedVoiceURI}
            onSelectVoice={setSelectedVoiceURI}
            wakeWordActive={wakeWordActive}
            onToggleWakeWord={() => setWakeWordActive(!wakeWordActive)}
            voiceError={voiceError}
            onStartListening={startListening}
            onStopListening={stopListening}
            onStopSpeaking={stopSpeaking}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            onExecuteSuggestedAction={(action, payload) => {
              setPendingAction({
                action: action === 'browser' ? 'browser_url' : (action as any),
                title: `${action.toUpperCase()} ilovasini ochish`,
                description: 'Windows agenti orqali mahalliy kompyuterda dastur ishga tushiriladi.',
                payload: payload || (action === 'browser' ? { url: 'https://google.com' } : {}),
              });
              setIsWindowsModalOpen(true);
            }}
          />
        </section>
      </main>

      {/* 3. Windows Desktop Agent Confirmation Modal */}
      <WindowsAgentModal
        isOpen={isWindowsModalOpen}
        onClose={() => {
          setIsWindowsModalOpen(false);
          setPendingAction(null);
        }}
        pendingAction={pendingAction}
        agentToken={agentToken}
        onActionCompleted={(success, message) => {
          // Speak notification in Uzbek
          if (success) {
            speakText("Buyruq Windows tizimida muvaffaqiyatli bajarildi, Janob.");
          }
        }}
      />

      {/* 4. Full Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceSettings={voiceSettings}
        onVoiceSettingsChange={setVoiceSettings}
        gestureSettings={gestureSettings}
        onGestureSettingsChange={setGestureSettings}
        backendOnline={backendOnline}
        aiConfigured={aiConfigured}
        provider={aiProvider}
        model={aiModel}
        agentToken={agentToken}
        onAgentTokenChange={setAgentToken}
      />
    </div>
  );
}

export default App;
