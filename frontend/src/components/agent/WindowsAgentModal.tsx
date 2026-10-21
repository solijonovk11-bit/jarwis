import { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, FileText, Calculator, Globe, X } from 'lucide-react';
import { launchWindowsAction } from '../../services/agentApi';

interface WindowsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAction?: {
    action: 'notepad' | 'calc' | 'browser_url';
    title: string;
    description: string;
    payload?: any;
  } | null;
  agentToken?: string;
  onActionCompleted?: (success: boolean, message: string) => void;
}

export function WindowsAgentModal({
  isOpen,
  onClose,
  pendingAction,
  agentToken,
  onActionCompleted,
}: WindowsAgentModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen && !pendingAction) return null;

  const handleExecute = async (action: 'notepad' | 'calc' | 'browser_url', payload: any = {}) => {
    setLoading(true);
    setResultMsg(null);
    try {
      const res = await launchWindowsAction(action, payload, agentToken);
      setResultMsg({ success: res.success, text: res.message });
      onActionCompleted?.(res.success, res.message);
    } catch (err: any) {
      setResultMsg({ success: false, text: err.message || 'Xatolik yuz berdi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="hud-panel w-full max-w-md p-5 rounded-xl border border-cyan-400/50 shadow-[0_0_30px_rgba(0,243,255,0.25)] relative font-mono text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-sm text-cyan-300">
              WINDOWS AGENTI TASDIQLASH
            </h2>
            <p className="text-[11px] text-cyan-200/60">
              Mahalliy kompyuter operatsiyalari xavfsizligi
            </p>
          </div>
        </div>

        {/* If there is a pending action proposed by JARVIS */}
        {pendingAction ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-100">
              <p className="text-[11px] text-cyan-400 font-semibold mb-1">
                JARVIS quyidagi amalni bajarishni so'ramoqda:
              </p>
              <p className="text-sm font-bold text-white mb-1">{pendingAction.title}</p>
              <p className="text-[11px] text-cyan-200/80">{pendingAction.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                disabled={loading}
                onClick={() => handleExecute(pendingAction.action, pendingAction.payload)}
                className="flex-1 py-2 px-3 rounded border border-emerald-400/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition-all font-semibold flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{loading ? 'Bajarilmoqda...' : 'Tasdiqlash (Bajarish)'}</span>
              </button>

              <button
                disabled={loading}
                onClick={onClose}
                className="py-2 px-4 rounded border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 transition-all flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Bekor qilish</span>
              </button>
            </div>
          </div>
        ) : (
          /* Quick Allowlisted Actions Launcher */
          <div className="space-y-3">
            <p className="text-[11px] text-cyan-300/80 mb-2">
              Xavfsiz ruxsat etilgan ilovalarni ishga tushiring:
            </p>

            <button
              onClick={() => handleExecute('notepad')}
              disabled={loading}
              className="w-full p-2.5 rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/30 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Bloknot (Notepad.exe)</span>
              </div>
              <span className="text-[10px] text-cyan-400/60">Ochish →</span>
            </button>

            <button
              onClick={() => handleExecute('calc')}
              disabled={loading}
              className="w-full p-2.5 rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/30 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Kalkulyator (calc.exe)</span>
              </div>
              <span className="text-[10px] text-cyan-400/60">Ochish →</span>
            </button>

            <button
              onClick={() => handleExecute('browser_url', { url: 'https://google.com' })}
              disabled={loading}
              className="w-full p-2.5 rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/30 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Google.com (Brauzer)</span>
              </div>
              <span className="text-[10px] text-cyan-400/60">Ochish →</span>
            </button>
          </div>
        )}

        {/* Result Message Banner */}
        {resultMsg && (
          <div
            className={`mt-4 p-3 rounded border text-xs flex items-center space-x-2 ${
              resultMsg.success
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
            }`}
          >
            {resultMsg.success ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{resultMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
