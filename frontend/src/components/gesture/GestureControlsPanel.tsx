import { Pencil, Trash2, RotateCcw, Hand, Circle, Triangle, Square, Spline } from 'lucide-react';
import { DrawShape } from '../../types';

interface GestureControlsPanelProps {
  activeShape: DrawShape;
  onChangeShape: (shape: DrawShape) => void;
  colorLeft: string;
  onChangeColorLeft: (color: string) => void;
  colorRight: string;
  onChangeColorRight: (color: string) => void;
  onClearDrawings: () => void;
  onResetScene: () => void;
  isDrawingEnabled: boolean;
  onToggleDrawingMode: () => void;
  strokesCount: number;
}

export function GestureControlsPanel({
  activeShape,
  onChangeShape,
  colorLeft,
  onChangeColorLeft,
  colorRight,
  onChangeColorRight,
  onClearDrawings,
  onResetScene,
  isDrawingEnabled,
  onToggleDrawingMode,
  strokesCount,
}: GestureControlsPanelProps) {
  const shapes: { id: DrawShape; label: string; icon: any }[] = [
    { id: 'freehand', label: 'Erkin chiziq', icon: Spline },
    { id: 'circle', label: 'Doira', icon: Circle },
    { id: 'triangle', label: 'Uchburchak', icon: Triangle },
    { id: 'rectangle', label: 'To\'rtburchak', icon: Square },
  ];

  return (
    <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 flex flex-col space-y-3 text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Pencil className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold tracking-wider text-cyan-300 uppercase">
            3D Fazoviy Chizish & Imo-Ishoralar
          </span>
        </div>
        <button
          onClick={onToggleDrawingMode}
          className={`px-2.5 py-1 rounded border text-[11px] transition-all ${
            isDrawingEnabled
              ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-[0_0_10px_rgba(0,243,255,0.4)]'
              : 'border-cyan-500/20 text-cyan-400/60 hover:border-cyan-400/40'
          }`}
        >
          {isDrawingEnabled ? 'CHIZISH REJIMI: FAOL' : 'CHIZISH REJIMI: PAUZA'}
        </button>
      </div>

      {/* Shape Selector */}
      <div>
        <label className="text-[10px] text-cyan-300/70 block mb-1.5 uppercase tracking-wider">
          Chizish shakli:
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {shapes.map((s) => {
            const Icon = s.icon;
            const isSelected = activeShape === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onChangeShape(s.id)}
                className={`p-1.5 rounded border flex flex-col items-center justify-center space-y-1 transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_8px_rgba(0,243,255,0.3)]'
                    : 'border-cyan-500/20 bg-black/20 text-cyan-400/60 hover:border-cyan-400/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[9px] truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors for Hands */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cyan-500/10">
        <div>
          <label className="text-[10px] text-pink-400 block mb-1">Chap qo'l rangi:</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={colorLeft}
              onChange={(e) => onChangeColorLeft(e.target.value)}
              className="w-7 h-7 rounded border border-pink-500/40 bg-transparent cursor-pointer"
            />
            <span className="text-[10px] text-pink-300/80">{colorLeft}</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-cyan-400 block mb-1">O'ng qo'l rangi:</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={colorRight}
              onChange={(e) => onChangeColorRight(e.target.value)}
              className="w-7 h-7 rounded border border-cyan-500/40 bg-transparent cursor-pointer"
            />
            <span className="text-[10px] text-cyan-300/80">{colorRight}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-2 pt-1 border-t border-cyan-500/10">
        <button
          onClick={onClearDrawings}
          className="flex-1 px-3 py-1.5 rounded border border-rose-500/40 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30 transition-colors flex items-center justify-center space-x-1.5 text-[11px]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Tozalash ({strokesCount})</span>
        </button>

        <button
          onClick={onResetScene}
          className="flex-1 px-3 py-1.5 rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400 transition-colors flex items-center justify-center space-x-1.5 text-[11px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sahnani tiklash</span>
        </button>
      </div>

      {/* Futuristic Gesture Legend */}
      <div className="p-2 rounded bg-black/40 border border-cyan-500/15 text-[10px] space-y-1 text-cyan-200/70 font-mono">
        <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
          <Hand className="w-3 h-3" /> IMO-ISHORALAR QOIDALARI:
        </div>
        <p>• <span className="text-cyan-300">Ko'rsatkich barmog'i:</span> 3D fazoda chiziq va shakl chizish</p>
        <p>• <span className="text-cyan-300">Pinch (chimchilash):</span> 3D reaktorni ushlash va siljitish</p>
        <p>• <span className="text-cyan-300">Ikki qo'l yaqinlashishi / uzoqlashishi:</span> Reaktorni masshtablash (Scale)</p>
        <p>• <span className="text-cyan-300">Ochiq kaft:</span> Chizishni to'xtatish (Pauza)</p>
        <p>• <span className="text-cyan-300">Musht:</span> Rejimni almashtirish yoki qulflash</p>
      </div>
    </div>
  );
}
