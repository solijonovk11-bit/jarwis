import { useState } from 'react';
import { X, Key, Cpu, Mic, Sliders, Cloud, Check, Copy } from 'lucide-react';
import { VoiceSettings, GestureSettings } from '../../types';
import { SUPABASE_SQL_SCHEMA } from '../../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  gestureSettings: GestureSettings;
  onGestureSettingsChange: (settings: GestureSettings) => void;
  backendOnline: boolean;
  aiConfigured: boolean;
  provider: string;
  model: string;
  supabaseOnline?: boolean;
  agentToken?: string;
  onAgentTokenChange?: (token: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  voiceSettings,
  onVoiceSettingsChange,
  gestureSettings,
  onGestureSettingsChange,
  backendOnline,
  aiConfigured,
  provider,
  model,
  supabaseOnline = false,
  agentToken,
  onAgentTokenChange,
}: SettingsModalProps) {
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="hud-panel w-full max-w-lg p-5 rounded-xl border border-cyan-400/50 shadow-[0_0_30px_rgba(0,243,255,0.25)] relative font-mono text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h2 className="font-orbitron font-bold text-base text-cyan-300 mb-1">
          JARVIS TIZIM SOZLAMALARI
        </h2>
        <p className="text-[11px] text-cyan-200/60 mb-4">
          Sun'iy intellekt, Supabase buluti, ovoz va Windows agent parametrlarini sozlash
        </p>

        <div className="space-y-4">
          {/* Supabase Cloud Section */}
          <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                <Cloud className="w-4 h-4" />
                <span>Supabase Bulut Sinxronizatsiyasi</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                supabaseOnline
                  ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/40'
                  : 'border-rose-500/40 text-rose-300 bg-rose-950/30'
              }`}>
                {supabaseOnline ? 'ULANGAN (ONLINE)' : 'OFFLINE'}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-cyan-200/80">
              <p>• URL: <code className="text-emerald-300 text-[10px]">https://nlthpwovjcgizsjqllit.supabase.co</code></p>
              <p>• Holat: <span className="text-emerald-400">Autentifikatsiya muvaffaqiyatli ulangan</span></p>
            </div>

            <div className="pt-1.5 border-t border-emerald-500/20 flex items-center justify-between">
              <span className="text-[10px] text-cyan-300/70">Jadvallarni yaratish (SQL):</span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 flex items-center space-x-1.5 text-[10px] transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Nusxalandi!' : 'SQL Kodini nusxalash'}</span>
              </button>
            </div>
          </div>

          {/* AI Provider Section */}
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
              <Key className="w-4 h-4" />
              <span>Sun'iy Intellekt (AI) Holati</span>
            </div>
            <div className="space-y-1 text-[11px] text-cyan-200/80">
              <p>• Backend: <span className={backendOnline ? 'text-emerald-400 font-bold' : 'text-rose-400'}>{backendOnline ? 'Ulangan' : 'Uzilgan'}</span></p>
              <p>• AI Provayderi: <span className="text-cyan-300 font-bold">{provider}</span></p>
              <p>• Model: <span className="text-cyan-300 font-bold">{model}</span></p>
              <p>• API Kaliti: <span className={aiConfigured ? 'text-emerald-400' : 'text-amber-400'}>{aiConfigured ? 'Sozlangan (Faol)' : 'Kiritilmagan (Lokal rejim)'}</span></p>
            </div>
            {!aiConfigured && (
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-300/80 mt-2">
                ℹ️ Kengaytirilgan AI imkoniyatlari uchun <code>backend/.env</code> faylida <code>GROQ_API_KEY</code> yoki <code>OPENAI_API_KEY</code> ni kiriting.
              </div>
            )}
          </div>

          {/* Windows Agent Token Section */}
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
              <Cpu className="w-4 h-4" />
              <span>Windows Agent Xavfsizlik Tokeni</span>
            </div>
            <p className="text-[10px] text-cyan-200/70">
              Windows ilovalarini ochish uchun mahalliy 127.0.0.1 tokeni:
            </p>
            <input
              type="text"
              value={agentToken || ''}
              onChange={(e) => onAgentTokenChange?.(e.target.value)}
              placeholder="Masalan: e7a9c81f..."
              className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded p-1.5 text-cyan-200 text-[11px] font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Voice Settings Section */}
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
              <Mic className="w-4 h-4" />
              <span>Ovoz & Nutq Sozlamalari</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-cyan-200/80">Gapirish tezligi: {voiceSettings.rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => onVoiceSettingsChange({ ...voiceSettings, rate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-cyan-200/80">Ovoz balandligi (Pitch): {voiceSettings.pitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => onVoiceSettingsChange({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Gesture Settings Section */}
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
              <Sliders className="w-4 h-4" />
              <span>Imo-Ishoralar (Gestures) Kalibrovkasi</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-cyan-200/80">Qo'l harakati sezgirligi: {gestureSettings.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={gestureSettings.sensitivity}
                onChange={(e) => onGestureSettingsChange({ ...gestureSettings, sensitivity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-cyan-400 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/50 transition-colors font-semibold"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
