import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Square, Trash2, Bot, User, Globe, AlertTriangle } from 'lucide-react';
import { AssistantState, ChatMessageItem } from '../../types';

interface VoiceConversationPanelProps {
  messages: ChatMessageItem[];
  assistantState: AssistantState;
  isListening: boolean;
  isSpeaking: boolean;
  speechSupported: boolean;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onSelectVoice: (uri: string) => void;
  wakeWordActive: boolean;
  onToggleWakeWord: () => void;
  voiceError: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  onExecuteSuggestedAction?: (action: string, payload?: any) => void;
}

export function VoiceConversationPanel({
  messages,
  assistantState,
  isListening,
  isSpeaking,
  speechSupported,
  selectedLanguage,
  onSelectLanguage,
  availableVoices,
  selectedVoiceURI,
  onSelectVoice,
  wakeWordActive,
  onToggleWakeWord,
  voiceError,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onSendMessage,
  onClearHistory,
  onExecuteSuggestedAction,
}: VoiceConversationPanelProps) {
  const [inputText, setInputText] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
            Muloqot Paneli (JARVIS Voice & Chat)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Clear history button */}
          <button
            onClick={onClearHistory}
            title="Tarixni tozalash"
            className="p-1 rounded border border-cyan-500/20 text-cyan-400/60 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice and Language Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-black/30 border border-cyan-500/10 text-xs font-mono mb-2">
        {/* Language selector */}
        <div className="flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value)}
            className="bg-cyan-950/40 border border-cyan-500/30 rounded px-2 py-0.5 text-cyan-300 text-[11px] focus:outline-none focus:border-cyan-400"
          >
            <option value="uz-UZ">O'zbekcha (uz-UZ)</option>
            <option value="en-US">English (en-US)</option>
            <option value="ru-RU">Русский (ru-RU)</option>
          </select>
        </div>

        {/* Wake Word Toggle */}
        <button
          onClick={onToggleWakeWord}
          className={`px-2 py-0.5 rounded border text-[10px] transition-colors ${
            wakeWordActive
              ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
              : 'border-cyan-500/20 text-cyan-400/60'
          }`}
          title="Salom JARVIS deb chaqirganda javob berish"
        >
          Wake-word: {wakeWordActive ? 'ON' : 'OFF'}
        </button>

        {/* Voice selector (agar mavjud bo'lsa) */}
        {availableVoices.length > 0 && (
          <select
            value={selectedVoiceURI}
            onChange={(e) => onSelectVoice(e.target.value)}
            className="max-w-[140px] truncate bg-cyan-950/40 border border-cyan-500/30 rounded px-1.5 py-0.5 text-cyan-300 text-[10px] focus:outline-none"
          >
            {availableVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Warning if Speech Recognition is unsupported */}
      {!speechSupported && (
        <div className="p-2 mb-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Ushbu brauzerda Web Speech API to'liq qo'llab-quvvatlanmaydi. Matnli rejimdan foydalaning.</span>
        </div>
      )}

      {/* Voice Error notice */}
      {voiceError && (
        <div className="p-2 mb-2 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
          {voiceError}
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-cyan-300/50 text-xs font-mono">
            <Bot className="w-8 h-8 text-cyan-500/40 mb-2 animate-pulse" />
            <p>JARVIS tayyor holatda, Janob.</p>
            <p className="text-[11px] text-cyan-400/40 mt-1">
              Mikrofonni bosib gapiring yoki quyidagi maydonga xabar yozing.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-2.5 text-xs font-mono leading-relaxed border ${
                  m.role === 'user'
                    ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-100 rounded-tr-none'
                    : 'border-indigo-500/40 bg-indigo-950/30 text-cyan-50 rounded-tl-none shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-cyan-400/70 border-b border-cyan-500/10 pb-1">
                  {m.role === 'user' ? (
                    <>
                      <User className="w-3 h-3 text-cyan-400" />
                      <span>SIZ</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-cyan-300" />
                      <span className="text-cyan-300 font-semibold">JARVIS</span>
                    </>
                  )}
                  {m.timestamp && <span className="opacity-60 ml-auto">{m.timestamp.slice(11, 16)}</span>}
                </div>
                <p className="whitespace-pre-wrap">{m.content}</p>

                {/* Suggested Action Button (masalan Notepad yoki Kalkulyator ochish taklifi) */}
                {m.action && (
                  <div className="mt-2 pt-1.5 border-t border-cyan-500/20">
                    <button
                      onClick={() => onExecuteSuggestedAction?.(m.action!, m.actionPayload)}
                      className="px-2.5 py-1 rounded border border-cyan-400/60 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60 transition-colors text-[10px] flex items-center space-x-1 shadow-[0_0_8px_rgba(0,243,255,0.3)]"
                    >
                      <span>⚡ {m.action.toUpperCase()} dasturini ochish</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {assistantState === 'thinking' && (
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 p-2 rounded bg-indigo-950/20 border border-indigo-500/30 animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>JARVIS tahlil qilmoqda...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Spoken Audio Controls (Stop Speaking) */}
      {isSpeaking && (
        <div className="flex items-center justify-between p-2 mt-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs font-mono animate-pulse">
          <span>JARVIS gapirmoqda...</span>
          <button
            onClick={onStopSpeaking}
            className="px-2.5 py-0.5 rounded border border-amber-500/50 bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 flex items-center space-x-1"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>To'xtatish</span>
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="mt-2 flex items-center space-x-2">
        {/* Microphone Button */}
        <button
          type="button"
          onClick={isListening ? onStopListening : onStartListening}
          className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
            isListening
              ? 'border-rose-500 bg-rose-950/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
              : 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,243,255,0.4)]'
          }`}
          title={isListening ? 'Mikrofonni o\'chirish' : 'Ovoz bilan gapirish'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="JARVISga savol yoki buyruq yozing..."
          className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,243,255,0.3)] transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || assistantState === 'thinking'}
          className="p-2.5 rounded-lg border border-cyan-400/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-[0_0_10px_rgba(0,243,255,0.25)]"
          title="Yuborish"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
