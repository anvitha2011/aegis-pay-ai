import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { TrendingUp, ShieldCheck, Minimize2, Maximize2 } from "lucide-react";

interface SelfHealingGraphProps {
  successRate: number;
  incidentActive: boolean;
  mitigated: boolean;
  scrollProgress: number;
}

export function SelfHealingGraph({
  successRate,
  incidentActive,
  mitigated,
  scrollProgress
}: SelfHealingGraphProps) {
  const [history, setHistory] = useState<number[]>([
    99.98, 99.97, 99.99, 99.98, 99.98, 99.96, 99.99
  ]);
  const [minimized, setMinimized] = useState(false);
  const hasTriggeredConfettiRef = useRef(false);

  const isVisible = scrollProgress >= 0.70 || mitigated || incidentActive;

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => [...prev.slice(-24), successRate]);
    }, 400);
    return () => clearInterval(interval);
  }, [successRate]);

  useEffect(() => {
    if (mitigated && successRate >= 99.8 && !hasTriggeredConfettiRef.current) {
      hasTriggeredConfettiRef.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.85 },
        colors: ["#10b981", "#06b6d4", "#38bdf8", "#a855f7"]
      });
    } else if (!mitigated && incidentActive) {
      hasTriggeredConfettiRef.current = false;
    }
  }, [mitigated, successRate, incidentActive]);

  if (!isVisible) return null;

  const width = 320;
  const height = 90;
  const minVal = 65;
  const maxVal = 100;

  const points = history.map((val, i) => {
    const x = (i / (history.length - 1 || 1)) * width;
    const norm = (val - minVal) / (maxVal - minVal);
    const y = height - norm * (height - 20) - 10;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const isDegraded = successRate < 90;

  return (
    <aside aria-label="Self-Healing Real-Time Resolution Graph" className="fixed left-4 bottom-16 z-30 pointer-events-auto transition-all duration-300">
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-emerald-500/40 text-xs font-mono text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)]"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Oscilloscope ({successRate.toFixed(2)}%)</span>
          <Maximize2 className="w-3 h-3 text-slate-400" />
        </button>
      ) : (
        <div className={`p-3.5 rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all duration-500 max-w-xs w-80 ${
          isDegraded
            ? "bg-red-950/60 border-red-500/50 shadow-red-500/20"
            : mitigated
            ? "bg-black/60 border-emerald-500/50 shadow-emerald-500/20"
            : "bg-black/60 border-cyan-500/30"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg border ${
                isDegraded
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}>
                {mitigated ? <ShieldCheck className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-slate-200">
                  {mitigated ? "DYNAMIC RECOVERY" : "SUCCESS RATE OSCILLOSCOPE"}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  NPCI UPI Clearings
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`text-sm font-mono font-black tabular-nums ${
                isDegraded ? "text-red-400 glow-red animate-pulse" : "text-emerald-400 glow-emerald"
              }`}>
                {successRate.toFixed(2)}%
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Oscilloscope Canvas */}
          <div className="relative h-[85px] w-full overflow-hidden rounded-xl bg-black/70 border border-white/5">
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradSuccess" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isDegraded ? "#ef4444" : "#10b981"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isDegraded ? "#ef4444" : "#10b981"} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={areaD} fill="url(#gradSuccess)" />
              <path
                d={pathD}
                fill="none"
                stroke={isDegraded ? "#ef4444" : "#10b981"}
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {points.length > 0 && (
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="3.5"
                  fill={isDegraded ? "#ef4444" : "#10b981"}
                  className="animate-ping"
                />
              )}
            </svg>

            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-1.5 opacity-25 text-[8px] font-mono text-slate-400">
              <div>100%</div>
              <div>85%</div>
              <div>70%</div>
            </div>
          </div>

          {mitigated && (
            <div className="mt-2 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
              <span>95% volume on ICICI/Axis standbys</span>
              <span className="font-bold">HEALED</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}