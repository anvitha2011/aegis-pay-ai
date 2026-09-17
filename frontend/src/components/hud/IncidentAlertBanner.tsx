import { AlertOctagon, ArrowRight, Bot } from "lucide-react";
import type { TelemetryFrame } from "../../types/telemetry";

interface IncidentAlertBannerProps {
  telemetry: TelemetryFrame;
  onDispatchAgent: () => void;
}

export function IncidentAlertBanner({
  telemetry,
  onDispatchAgent
}: IncidentAlertBannerProps) {
  if (!telemetry.incident_active || telemetry.mitigated) return null;

  return (
    <aside aria-label="Critical Infrastructure Outage Alert" className="fixed top-18 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-xl w-[92%] animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="p-3 rounded-2xl bg-red-950/70 backdrop-blur-2xl border border-red-500/50 shadow-[0_8px_32px_rgba(239,68,68,0.3)] flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/30 border border-red-500/50 text-red-400 animate-pulse">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-300 bg-red-900/60 px-1.5 py-0.5 rounded border border-red-500/30">
                P0 CBS LOCK
              </span>
              <span className="text-[11px] font-mono text-red-200 font-bold">
                HDFC_CBS_01 (1,840ms Latency)
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono mt-0.5">
              HikariCP deadlock • Cascading timeouts propagated across NPCI
            </p>
          </div>
        </div>

        <button
          onClick={onDispatchAgent}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>DISPATCH SWARM</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>
    </aside>
  );
}