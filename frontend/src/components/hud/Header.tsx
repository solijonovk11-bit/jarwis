import { useState, useEffect } from 'react';
import { Shield, Cpu, Activity, Volume2, VolumeX, Settings, Radio } from 'lucide-react';
import { AssistantState } from '../../types';

interface HeaderProps {
  state: AssistantState;
  backendOnline: boolean;
  agentOnline: boolean;
  aiConfigured: boolean;
  provider: string;
  fps: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
}

export function Header({
  state,
  backendOnline,
  agentOnline,
  aiConfigured,
  provider,
  fps,
  isMuted,
  onToggleMute,
  onOpenSettings,
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('uz-UZ', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stateLabels: Record<AssistantState, { label: string; color: string }> = {
    idle: { label: 'KUTILMOQDA', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20' },
    listening: { label: 'ESHITILMOQDA...', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30 animate-pulse' },
    thinking: { label: 'O\'YLANMOQDA...', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30 animate-pulse' },
    speaking: { label: 'GAPIRMOQDA...', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
    'gesture-active': { label: 'IMO-ISHORA FAOL', color: 'text-pink-400 border-pink-500/40 bg-pink-950/30' },
  };

  return (
    <header className="w-full hud-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 z-20">
      {/* Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-cyan-400/50 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping absolute opacity-40"></div>
          <Shield className="w-5 h-5 text-cyan-300 relative z-10" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-orbitron font-extrabold text-lg tracking-wider text-cyan-300 neon-text-cyan">
              JARVIS
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/40 text-cyan-400 bg-cyan-950/30">
              MARK VII
            </span>
          </div>
          <p className="text-[11px] text-cyan-200/60 font-rajdhani tracking-wide">
            SHAXSIY INTELLEKTUAL TIZIM
          </p>
        </div>
      </div>

      {/* State & Clock */}
      <div className="flex items-center space-x-4">
        {/* Assistant state badge */}
        <div className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold tracking-wider flex items-center space-x-2 ${stateLabels[state].color}`}>
          <Radio className="w-3.5 h-3.5" />
          <span>{stateLabels[state].label}</span>
        </div>

        {/* Digital Clock */}
        <div className="hidden sm:flex items-center px-3 py-1 rounded border border-cyan-500/20 bg-black/40 text-cyan-300 font-mono text-sm tracking-widest shadow-inner">
          <Activity className="w-3.5 h-3.5 mr-2 text-cyan-400 animate-pulse" />
          <span>{timeStr || '00:00:00'}</span>
        </div>
      </div>

      {/* Telemetry Status Pills & Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
        {/* Backend Status */}
        <div
          title={backendOnline ? 'FastAPI Backend faol' : 'Backend uzilgan'}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded border ${
            backendOnline
              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
              : 'border-rose-500/40 text-rose-400 bg-rose-950/20'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
          <span className="font-mono">API: {backendOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Windows Agent Status */}
        <div
          title={agentOnline ? 'Windows Agent faol (127.0.0.1:8001)' : 'Windows Agent uzilgan'}
          className={`hidden md:flex items-center space-x-1 px-2.5 py-1 rounded border ${
            agentOnline
              ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20'
              : 'border-amber-500/40 text-amber-400 bg-amber-950/20'
          }`}
        >
          <Cpu className="w-3 h-3" />
          <span className="font-mono">AGENT: {agentOnline ? 'FAOL' : 'NOFAOL'}</span>
        </div>

        {/* FPS Counter */}
        <div className="hidden lg:flex items-center px-2 py-1 rounded border border-cyan-500/20 text-cyan-400/80 font-mono text-[11px]">
          <span>FPS: {fps}</span>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
          className={`p-1.5 rounded border transition-colors ${
            isMuted
              ? 'border-rose-500/50 bg-rose-950/30 text-rose-300'
              : 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Settings Toggle */}
        <button
          onClick={onOpenSettings}
          title="Sozlamalar"
          className="p-1.5 rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
