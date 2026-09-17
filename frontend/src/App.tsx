import { useState } from "react";
import { Scene } from "./components/canvas/Scene";
import { MacroHUD } from "./components/hud/MacroHUD";
import { ScrollProgressScrubber } from "./components/hud/ScrollProgressScrubber";
import { IncidentAlertBanner } from "./components/hud/IncidentAlertBanner";
import { AgentReasoningCockpit } from "./components/hud/AgentReasoningCockpit";
import { SelfHealingGraph } from "./components/hud/SelfHealingGraph";
import { ComponentDeepDiveModal } from "./components/hud/ComponentDeepDiveModal";
import { ChaosControls } from "./components/hud/ChaosControls";

import { useScrollStage } from "./hooks/useScrollStage";
import { useTelemetrySocket } from "./hooks/useTelemetrySocket";
import { INITIAL_NETWORK_NODES } from "./data/mockNodes";
import type { NodeComponentData } from "./types/telemetry";
import { ArrowDown, Sparkles, AlertTriangle, ShieldCheck, Database, Layers, Eye, EyeOff } from "lucide-react";

export default function App() {
  const { progress, stageIndex, jumpToStage } = useScrollStage();
  const {
    telemetry,
    reasoningSteps,
    chatMessages,
    isConnected,
    triggerIncident,
    runInvestigation,
    resolveIncident,
    sendAgentChat
  } = useTelemetrySocket(stageIndex);

  const [nodes] = useState<NodeComponentData[]>(INITIAL_NETWORK_NODES);
  const [selectedNode, setSelectedNode] = useState<NodeComponentData | null>(null);
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isCockpitOpen, setIsCockpitOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [freeFlight, setFreeFlight] = useState(false);

  const handleFlushPool = () => {
    resolveIncident();
    setSelectedNode(null);
  };

  return (
    <div className="relative min-h-[550vh] bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      
      {/* 3D WebGL Background Canvas */}
      <Scene
        scrollProgress={progress}
        telemetry={telemetry}
        nodes={nodes}
        reasoningSteps={reasoningSteps}
        selectedNode={selectedNode}
        onSelectNode={setSelectedNode}
        freeFlight={freeFlight}
      />

      {/* Cyber Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none cyber-grid opacity-20 z-0" />

      {/* Zen Mode Toggle (Floating discreetly on bottom-left) */}
      <div className="fixed bottom-4 left-4 z-40 pointer-events-auto">
        <button
          onClick={() => setZenMode(!zenMode)}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-2xl border border-white/10 text-slate-400 hover:text-cyan-300 transition-all duration-300 shadow-xl"
          title={zenMode ? "Show HUD Controls" : "Zen View (Hide HUD)"}
        >
          {zenMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {!zenMode && (
        <>
          {/* Top Telemetry Macro HUD */}
          <MacroHUD
            telemetry={telemetry}
            isConnected={isConnected}
            onOpenChaos={() => setIsChaosOpen(true)}
            onToggleFreeFlight={() => setFreeFlight(!freeFlight)}
            freeFlight={freeFlight}
          />

          {/* Incident P0 Banner */}
          <IncidentAlertBanner
            telemetry={telemetry}
            onDispatchAgent={runInvestigation}
          />

          {/* Floating Scrollytelling Narrative Blade (Middle/Bottom Left, Non-Clumsy) */}
          <main className="fixed top-24 left-4 md:left-8 z-20 pointer-events-none max-w-sm w-[90%] transition-all duration-500">
            
            {/* Stage 1: Hero Macro View */}
            {progress <= 0.22 && (
              <div className="p-5 rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.1)] pointer-events-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Stage 01 // Sovereign Macro Grid
                </div>
                <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white leading-tight">
                  National Payment Mesh
                </h1>
                <p className="text-slate-300 text-xs mt-2 font-mono leading-relaxed">
                  Real-time clearing across India's primary financial corridors (Mumbai, Delhi, Bengaluru, Chennai). Monitoring 85,000+ TPS.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <span className="flex items-center gap-1.5 animate-bounce">
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                    SCROLL TO ZOOM IN
                  </span>
                  <button
                    onClick={() => jumpToStage(1)}
                    className="text-slate-400 hover:text-white underline text-[10px]"
                  >
                    Skip to Txn ➔
                  </button>
                </div>
              </div>
            )}

            {/* Stage 2: Single Txn & Topology Expansion */}
            {progress > 0.22 && progress <= 0.45 && (
              <div className="p-5 rounded-3xl bg-black/55 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] pointer-events-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Stage 02 // Network Topology
                </div>
                <h2 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white leading-tight">
                  Anatomy of a Transaction
                </h2>
                <p className="text-slate-300 text-xs mt-2 font-mono leading-relaxed">
                  Zooming into packet <strong className="text-cyan-300">TXN_9842_HDFC_UPI</strong> as nodes expand into NPCI Switch, Gateways, and Bank Core CBS switches.
                </p>
                <div className="mt-3.5 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                  💡 <em>Click any node in 3D to dive inside its microservice architecture!</em>
                </div>
              </div>
            )}

            {/* Stage 3: Incident Explosion */}
            {progress > 0.45 && progress <= 0.68 && (
              <div className="p-5 rounded-3xl bg-red-950/60 backdrop-blur-2xl border border-red-500/50 shadow-[0_16px_36px_rgba(239,68,68,0.3)] pointer-events-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Stage 03 // Incident Explosion
                </div>
                <h2 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white leading-tight">
                  Latency Propagation
                </h2>
                <p className="text-slate-200 text-xs mt-2 font-mono leading-relaxed">
                  <strong className="text-red-400">HDFC_CBS_01</strong> deadlocks on ledger settlement shard #4. Latency surges to 1,840ms and success rate drops to 71.2%.
                </p>
                <div className="mt-4 pt-3 border-t border-red-500/20 flex items-center justify-between">
                  <button
                    onClick={runInvestigation}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-[11px] font-bold shadow-md transition-all"
                  >
                    Dispatch AI Swarm ➔
                  </button>
                </div>
              </div>
            )}

            {/* Stage 4: LangGraph AI Agent Cockpit */}
            {progress > 0.68 && progress <= 0.85 && (
              <div className="p-5 rounded-3xl bg-black/60 backdrop-blur-2xl border border-amber-500/40 shadow-[0_16px_36px_rgba(245,158,11,0.2)] pointer-events-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Stage 04 // LangGraph AI Nerve Hub
                </div>
                <h2 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white leading-tight">
                  Autonomous Swarm
                </h2>
                <p className="text-slate-300 text-xs mt-2 font-mono leading-relaxed">
                  Anomaly detector flags Z-score spike (+5.82σ). SQL Analyst queries live telemetry database and devises circuit-breaker rerouting.
                </p>
                <div className="mt-3.5 text-[10px] font-mono text-amber-300">
                  ⚡ Real-time reasoning traces active on bottom-right ➔
                </div>
              </div>
            )}

            {/* Stage 5: Fluid Resolution */}
            {progress > 0.85 && (
              <div className="p-5 rounded-3xl bg-black/60 backdrop-blur-2xl border border-emerald-500/50 shadow-[0_16px_36px_rgba(16,185,129,0.2)] pointer-events-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Stage 05 // Self-Healing Restoration
                </div>
                <h2 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white leading-tight">
                  Resilience Restored
                </h2>
                <p className="text-slate-200 text-xs mt-2 font-mono leading-relaxed">
                  Traffic diverted 95% across ICICI and Axis standbys. Success rate fluidly repairs to <strong className="text-emerald-300 font-bold">99.99%</strong>.
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                  <button
                    onClick={() => jumpToStage(0)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold shadow-md transition-all"
                  >
                    Replay Scroll ↺
                  </button>
                </div>
              </div>
            )}

          </main>

          {/* Floating AI LangGraph Reasoning Timeline & Chat Cockpit */}
          <AgentReasoningCockpit
            reasoningSteps={reasoningSteps}
            onTriggerInvestigation={runInvestigation}
            chatMessages={chatMessages}
            onSendMessage={sendAgentChat}
            isOpen={isCockpitOpen}
            onToggleOpen={() => setIsCockpitOpen(!isCockpitOpen)}
          />

          {/* Stage 5 Fluid Self-Healing Oscilloscope */}
          <SelfHealingGraph
            successRate={telemetry.success_rate}
            incidentActive={telemetry.incident_active}
            mitigated={telemetry.mitigated}
            scrollProgress={progress}
          />

          {/* Interactive Bottom Scroll Progress Scrubber */}
          <ScrollProgressScrubber
            progress={progress}
            stageIndex={stageIndex}
            onJumpToStage={jumpToStage}
          />
        </>
      )}

      {/* "Go Inside Component" Deep Dive Modal */}
      <ComponentDeepDiveModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onFlushPool={handleFlushPool}
        isDegraded={Boolean(
          selectedNode &&
          telemetry.incident_active &&
          selectedNode.id === telemetry.degraded_node
        )}
      />

      {/* Chaos Lab Dialog */}
      <ChaosControls
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        telemetry={telemetry}
        onTriggerIncident={triggerIncident}
        onRunInvestigation={runInvestigation}
        onResolve={resolveIncident}
      />

    </div>
  );
}