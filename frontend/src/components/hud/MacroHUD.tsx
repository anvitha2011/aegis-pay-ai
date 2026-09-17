import { useState, useEffect } from "react";
import type { TelemetryFrame } from "../../types/telemetry";
import { Compass, Flame, Shield } from "lucide-react";

interface MacroHUDProps {
  telemetry: TelemetryFrame;
  isConnected: boolean;
  onOpenChaos: () => void;
  onToggleFreeFlight: () => void;
  freeFlight: boolean;
}

export function MacroHUD({
  telemetry,
  isConnected,
  onOpenChaos,
  onToggleFreeFlight,
  freeFlight
}: MacroHUDProps) {
  const isCritical = telemetry.incident_active && !telemetry.mitigated;
  const isMitigated = telemetry.mitigated;

  // Waveform bars oscillation for TPS visualizer
  const [waveHeights, setWaveHeights] = useState([40, 75, 55, 90, 60]);
  useEffect(() => {
    const timer = setInterval(() => {
      setWaveHeights([
        Math.floor(Math.random() * 60 + 30),
        Math.floor(Math.random() * 70 + 30),
        Math.floor(Math.random() * 60 + 40),
        Math.floor(Math.random() * 80 + 20),
        Math.floor(Math.random() * 50 + 35)
      ]);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  // Calculate success rate ring arc
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const clampedSr = Math.max(0, Math.min(100, telemetry.success_rate));
  const strokeDashoffset = circumference - (clampedSr / 100) * circumference;

  return (
    <header className="fixed top-3 left-0 right-0 z-30 pointer-events-none px-4 md:px-8">
      {/* 100% Transparent Floating Command Deck (Zero Heavy Glass/Blur Box, Maximum Smooth Scroll) */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto bg-transparent">
        
        {/* Left: Floating Brand Signature */}
        <div className="flex items-center gap-2.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping [animation-duration:3s]" />
            <div className="relative w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center">
              <Shield className="w-3 h-3 text-cyan-300" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-black text-sm tracking-wider text-white">
              AEGIS
            </span>
            <span className="font-mono text-cyan-400 font-black text-sm tracking-wider">
              // PAY AI
            </span>
            <span className="text-[9px] font-mono text-slate-400 ml-1 hidden sm:inline">
              v2.4
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ml-1 ${isConnected ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"}`} />
          </div>
        </div>

        {/* Center: Pure Floating Performance Metrics (No Background Box) */}
        <div className="flex items-center gap-5 sm:gap-7 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
          
          {/* 1. Throughput (TPS) */}
          <div className="flex items-center gap-2 group cursor-default">
            {/* Oscilloscope Micro-Bars */}
            <div className="flex items-end gap-0.5 h-4 w-3.5 py-0.5">
              {waveHeights.map((h, i) => (
                <span
                  key={i}
                  className="w-0.5 bg-cyan-300 rounded-t-sm transition-all duration-200"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                TPS
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums tracking-tight">
                {telemetry.national_tps.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/15" />

          {/* 2. Success Rate (Circular Sweep Radar) */}
          <div className="flex items-center gap-2 group cursor-default">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-white/10"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className={`transition-all duration-500 ${
                    isCritical
                      ? "stroke-red-500 drop-shadow-[0_0_6px_#ef4444]"
                      : isMitigated
                      ? "stroke-emerald-400 drop-shadow-[0_0_6px_#34d399]"
                      : "stroke-cyan-400 drop-shadow-[0_0_6px_#22d3ee]"
                  }`}
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className={`w-1.5 h-1.5 rounded-full absolute ${
                isCritical ? "bg-red-400 animate-ping" : "bg-emerald-400"
              }`} />
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Success
              </span>
              <span className={`font-mono text-sm font-bold tabular-nums tracking-tight ${
                isCritical
                  ? "text-red-400 glow-red animate-pulse"
                  : isMitigated
                  ? "text-emerald-400 glow-emerald"
                  : "text-emerald-300"
              }`}>
                {telemetry.success_rate.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/15" />

          {/* 3. Avg Latency */}
          <div className="flex items-center gap-2 group cursor-default">
            <div className={`w-2 h-2 rounded-full ${
              isCritical
                ? "bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping"
                : "bg-purple-400 shadow-[0_0_6px_#c084fc]"
            }`} />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Latency
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className={`font-mono text-sm font-bold tabular-nums tracking-tight ${
                  isCritical ? "text-red-400 glow-red" : "text-purple-200"
                }`}>
                  {telemetry.avg_latency_ms.toFixed(1)}
                </span>
                <span className="text-[9px] font-mono text-purple-400">ms</span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-white/15 hidden sm:block" />

          {/* 4. Minimalist State Capsule */}
          <div className="hidden sm:flex items-center">
            {isCritical ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                P0 CBS LOCK
              </span>
            ) : isMitigated ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                AUTO-REROUTED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded-full border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                NOMINAL
              </span>
            )}
          </div>

        </div>

        {/* Right: Floating Minimalist Cyber Controls */}
        <div className="flex items-center gap-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          <button
            onClick={onToggleFreeFlight}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all duration-300 flex items-center gap-1.5 border ${
              freeFlight
                ? "bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white border-white/15 hover:border-cyan-400/40"
            }`}
          >
            <Compass className="w-3 h-3" />
            <span className="hidden sm:inline">{freeFlight ? "Tracking" : "Free Flight"}</span>
          </button>

          <button
            onClick={onOpenChaos}
            className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all duration-300 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Chaos</span>
          </button>
        </div>

      </div>
    </header>
  );
}