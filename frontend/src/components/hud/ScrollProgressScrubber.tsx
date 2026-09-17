import { STAGE_MILESTONES } from "../../hooks/useScrollStage";

interface ScrollProgressScrubberProps {
  progress: number;
  stageIndex: number;
  onJumpToStage: (index: number) => void;
}

export function ScrollProgressScrubber({
  progress,
  stageIndex,
  onJumpToStage
}: ScrollProgressScrubberProps) {
  return (
    <nav
      aria-label="Incident Journey Milestones"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-2xl w-[92%] sm:w-auto"
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/55 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.15)]">
        
        {STAGE_MILESTONES.map((m, idx) => {
          const isActive = stageIndex === idx;
          const isPassed = stageIndex > idx;

          return (
            <button
              key={m.stage}
              onClick={() => onJumpToStage(idx)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-105"
                  : isPassed
                  ? "text-slate-300 hover:text-white hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {/* Micro Glowing Beacon */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee] ring-2 ring-cyan-400/30"
                    : isPassed
                    ? "bg-emerald-400"
                    : "bg-slate-700"
                }`}
              />

              <span className="hidden md:inline font-medium tracking-tight text-[11px]">
                {idx + 1}. {m.name}
              </span>
              <span className="md:hidden font-medium text-[11px]">
                {idx + 1}
              </span>
            </button>
          );
        })}

        {/* Global Progress Dial */}
        <div className="flex items-center px-2.5 py-0.5 border-l border-white/10 text-[10px] font-mono text-cyan-400 font-bold tabular-nums">
          {Math.round(progress * 100)}%
        </div>

      </div>
    </nav>
  );
}