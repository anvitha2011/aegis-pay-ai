import { Flame, Bot, RotateCcw, X, Zap } from "lucide-react";
import { TelemetryFrame } from "../../types/telemetry";

interface ChaosControlsProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryFrame;
  onTriggerIncident: (node: string) => void;
  onRunInvestigation: () => void;
  onResolve: () => void;
}

export function ChaosControls({
  isOpen,
  onClose,
  telemetry,
  onTriggerIncident,
  onRunInvestigation,
  onResolve
}: ChaosControlsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="cyber-glass rounded-3xl border border-amber-500/50 max-w-md w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-mono font-bold text-slate-100">
                CHAOS & AI EXPERIMENTATION LAB
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Simulate national payment infrastructure outages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chaos Scenarios */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Select Failure Scenario
          </div>

          <button
            onClick={() => {
              onTriggerIncident("HDFC_CBS_01");
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 to-red-900/40 border border-red-500/40 hover:border-red-400 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-red-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400 group-hover:animate-bounce" />
                HDFC CBS HikariPool Deadlock (P0)
              </div>
              <span className="text-[10px] bg-red-600/30 px-2 py-0.5 rounded text-red-300 font-mono">
                1,840ms Latency
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-mono">
              Saturates HikariCP pool (300/300 connections locked). Simulates nationwide UPI SR drop to 71.2%.
            </p>
          </button>

          <button
            onClick={() => {
              onTriggerIncident("SBI_CORE_02");
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-purple-900/40 border border-purple-500/40 hover:border-purple-400 text-left transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-purple-400" />
                SBI Finacle DR Overload Surge
              </div>
              <span className="text-[10px] bg-purple-600/30 px-2 py-0.5 rounded text-purple-300 font-mono">
                45,000 TPS Surge
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-mono">
              Injects sudden festive burst traffic exceeding switch buffer queue limits.
            </p>
          </button>
        </div>

        {/* AI & Remediation Actions */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Agent Actions
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onRunInvestigation();
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              Run LangGraph Swarm
            </button>

            <button
              onClick={() => {
                onResolve();
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Nominal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}