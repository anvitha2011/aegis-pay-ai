import { NodeComponentData } from "../../types/telemetry";
import { X, Server, Database, Cpu, AlertTriangle, CheckCircle2, Shield, RefreshCw } from "lucide-react";

interface ComponentDeepDiveModalProps {
  node: NodeComponentData | null;
  onClose: () => void;
  onFlushPool?: () => void;
  isDegraded: boolean;
}

export function ComponentDeepDiveModal({
  node,
  onClose,
  onFlushPool,
  isDegraded
}: ComponentDeepDiveModalProps) {
  if (!node) return null;

  const pool = node.internalDetails.connectionPool;
  const poolPercent = Math.min(100, Math.round((pool.active / pool.max) * 100));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="cyber-glass rounded-3xl border border-cyan-500/50 max-w-2xl w-full p-6 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl border"
              style={{
                backgroundColor: `${isDegraded ? "#ef4444" : node.color}20`,
                borderColor: `${isDegraded ? "#ef4444" : node.color}50`,
                color: isDegraded ? "#ef4444" : node.color
              }}
            >
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-black text-slate-100">
                  {node.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                  style={{
                    backgroundColor: `${isDegraded ? "#ef4444" : node.color}25`,
                    color: isDegraded ? "#ef4444" : node.color
                  }}
                >
                  {isDegraded ? "INCIDENT DEGRADED" : node.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {node.subsystem}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Internal Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Connection Pool Saturation */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                HikariCP Pool
              </span>
              <span className={isDegraded ? "text-red-400 font-bold" : "text-cyan-300 font-bold"}>
                {poolPercent}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isDegraded ? "bg-red-500" : "bg-cyan-400"
                }`}
                style={{ width: `${poolPercent}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Active: {pool.active}/{pool.max}</span>
              <span className={pool.waiting > 0 ? "text-red-400 font-bold" : ""}>
                Waiting: {pool.waiting}
              </span>
            </div>
          </div>

          {/* CPU & Memory Load */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Node CPU Core
              </span>
              <span className={node.internalDetails.cpuLoad > 85 ? "text-red-400 font-bold" : "text-purple-300 font-bold"}>
                {node.internalDetails.cpuLoad}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  node.internalDetails.cpuLoad > 85 ? "bg-red-500" : "bg-purple-400"
                }`}
                style={{ width: `${node.internalDetails.cpuLoad}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>RAM: {(node.internalDetails.memoryMb / 1024).toFixed(1)} GB</span>
              <span>Threads: {node.internalDetails.activeThreads}</span>
            </div>
          </div>

          {/* Lock Contention & P99 Latency */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              P99 Latency
            </div>
            <div className={`text-lg font-mono font-black ${
              isDegraded ? "text-red-400 glow-red" : "text-emerald-400"
            }`}>
              {isDegraded ? "1,840.5ms" : `${node.internalDetails.p99Latency}ms`}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {node.internalDetails.lockContention}
            </div>
          </div>

        </div>

        {/* Subsystems & Architecture Modules */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Active Subsystem Architecture
          </div>
          <div className="flex flex-wrap gap-2">
            {node.internalDetails.subsystems.map((sub, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-200"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Live Internal Server Logs */}
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Internal Kernel / Switch Event Stream
          </div>
          <div className="p-3 rounded-2xl bg-black/90 border border-slate-800 max-h-32 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
            {node.internalDetails.logs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes("[ERROR]") || log.includes("[ALERT]") || log.includes("[CRITICAL]")
                    ? "text-red-400"
                    : log.includes("[AI]")
                    ? "text-amber-400"
                    : "text-slate-400"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Component coordinates: [{node.position.join(", ")}]
          </div>
          <div className="flex items-center gap-2">
            {isDegraded && onFlushPool && (
              <button
                onClick={onFlushPool}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Flush HikariPool & Heal Node
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all"
            >
              Zoom Out to Topology
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}