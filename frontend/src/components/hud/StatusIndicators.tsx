import { AssistantState, WindowsAgentStatus } from '../../types';
import { HardDrive, Cpu, Database, BatteryCharging } from 'lucide-react';

interface StatusIndicatorsProps {
  state: AssistantState;
  agentStatus: WindowsAgentStatus;
}

export function StatusIndicators({ state, agentStatus }: StatusIndicatorsProps) {
  const isVoiceActive = state === 'listening' || state === 'speaking';

  // Waveform bars
  const waveHeights = [24, 48, 16, 60, 32, 72, 40, 84, 55, 30, 68, 20];

  return (
    <div className="flex flex-col space-y-3">
      {/* Live Voice Waveform HUD panel */}
      <div className="hud-panel p-3 rounded-lg border border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono tracking-wider text-cyan-400 uppercase">
            Ovoz Spektri (Audio Waveform)
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            isVoiceActive ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 animate-pulse' : 'text-cyan-600 bg-black/40'
          }`}>
            {state === 'speaking' ? 'TRANSMITTING' : state === 'listening' ? 'CAPTURING' : 'STANDBY'}
          </span>
        </div>

        {/* Dynamic Waveform Bars */}
        <div className="flex items-center justify-center space-x-1.5 h-12 px-2 bg-black/40 rounded border border-cyan-500/10">
          {waveHeights.map((h, idx) => {
            const dynamicScale = isVoiceActive
              ? Math.max(0.2, (Math.sin((idx * 0.5) + performance.now() * 0.008) + 1.2) * 0.5)
              : 0.15;
            const currentHeight = Math.max(4, Math.round(h * dynamicScale));

            return (
              <div
                key={idx}
                style={{ height: `${currentHeight}px` }}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  state === 'speaking'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : state === 'listening'
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,243,255,0.7)]'
                    : 'bg-cyan-900/40'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Windows Telemetry HUD Widget */}
      <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 text-xs">
        <div className="flex items-center justify-between mb-2 border-b border-cyan-500/20 pb-1.5">
          <span className="font-mono text-cyan-400 tracking-wider text-[11px] uppercase">
            Windows Tizim Telemetriyasi
          </span>
          <span className="font-mono text-[10px] text-cyan-300/70">
            {agentStatus.running ? 'ULANGAN (127.0.0.1:8001)' : 'OFLINE'}
          </span>
        </div>

        {agentStatus.running ? (
          <div className="space-y-2 font-mono">
            {/* CPU Bar */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-cyan-200/80 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" /> CPU Yuklamasi
                </span>
                <span className="text-cyan-300 font-semibold">{agentStatus.cpuPercent ?? 0}%</span>
              </div>
              <div className="w-full bg-cyan-950/40 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                <div
                  className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,243,255,0.5)]"
                  style={{ width: `${Math.min(100, agentStatus.cpuPercent ?? 0)}%` }}
                />
              </div>
            </div>

            {/* RAM Bar */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-cyan-200/80 flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" /> Operativ Xotira (RAM)
                </span>
                <span className="text-cyan-300 font-semibold">
                  {agentStatus.memoryPercent ?? 0}% ({agentStatus.memoryTotalGb ?? 0} GB)
                </span>
              </div>
              <div className="w-full bg-cyan-950/40 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                <div
                  className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                  style={{ width: `${Math.min(100, agentStatus.memoryPercent ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Disk & Battery Info */}
            <div className="flex items-center justify-between text-[10px] text-cyan-300/70 pt-1 border-t border-cyan-500/10">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" /> Disk: {agentStatus.diskPercent ?? 0}% band
              </span>
              {agentStatus.battery && (
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" /> Batareya: {agentStatus.battery.percent}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300/90 text-[11px] space-y-1">
            <p>Windows agenti ishga tushmagan.</p>
            <p className="text-[10px] text-amber-200/70 font-mono">
              Ishga tushirish uchun: <code>windows-agent/start-agent.bat</code> ni bosing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
