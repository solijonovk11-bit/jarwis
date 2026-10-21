export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'gesture-active';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface DetectedHand {
  handedness: 'Left' | 'Right';
  landmarks: LandmarkPoint[];
  gesture: string;
  confidence: number;
}

export type DrawShape = 'freehand' | 'circle' | 'triangle' | 'rectangle';

export interface DrawnStroke {
  id: string;
  hand: 'Left' | 'Right';
  points: [number, number, number][];
  color: string;
  shape: DrawShape;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: string;
  actionPayload?: any;
}

export interface WindowsAgentStatus {
  running: boolean;
  token?: string;
  os?: string;
  cpuPercent?: number;
  memoryPercent?: number;
  memoryTotalGb?: number;
  diskPercent?: number;
  battery?: {
    percent: number;
    power_plugged: boolean;
  } | null;
  error?: string;
}

export interface VoiceSettings {
  language: string;
  voiceURI: string;
  wakeWordEnabled: boolean;
  pitch: number;
  rate: number;
  continuous: boolean;
}

export interface GestureSettings {
  sensitivity: number;
  isMirrored: boolean;
  cooldownMs: number;
  activeShape: DrawShape;
  colorLeft: string;
  colorRight: string;
}

export interface SystemMetrics {
  backendOnline: boolean;
  aiConfigured: boolean;
  provider: string;
  model: string;
  trackingFps: number;
  threeFps: number;
}
