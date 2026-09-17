import { useState } from "react";
import type { AgentReasoningStep } from "../../types/telemetry";
import { Database, ShieldAlert, Cpu, Sparkles, Send, CheckCircle2, ChevronDown, ChevronUp, Bot, X } from "lucide-react";

interface AgentReasoningCockpitProps {
  reasoningSteps: AgentReasoningStep[];
  onTriggerInvestigation: () => void;
  chatMessages: Array<{ role: "user" | "agent"; text: string }>;
  onSendMessage: (msg: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function AgentReasoningCockpit({
  reasoningSteps,
  onTriggerInvestigation,
  chatMessages,
  onSendMessage,
  isOpen,
  onToggleOpen
}: AgentReasoningCockpitProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"timeline" | "chat">("timeline");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    onSendMessage(inputQuery.trim());
    setInputQuery("");
  };

  return (
    <aside aria-label="LangGraph Autonomous Reasoning Cockpit" className="fixed right-4 bottom-16 z-30 pointer-events-auto transition-all duration-300">
      {!isOpen ? (
        // Sleek Docked Floating Intelligence Capsule
        <button
          onClick={onToggleOpen}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-amber-500/40 hover:border-amber-400 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 transform hover:scale-105"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <Bot className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-mono font-bold text-slate-100 tracking-tight">
            LangGraph Swarm
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {reasoningSteps.length} Steps
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-colors" />
        </button>
      ) : (
        // Expanded Glassy Terminal Drawer
        <div className="w-[94vw] sm:w-[410px] rounded-3xl bg-black/65 backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_28px_rgba(6,182,212,0.15)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Bar */}
          <div className="p-3.5 bg-slate-900/60 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2">
                  <span>LANGGRAPH SWARM</span>
                  {reasoningSteps.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Autonomous Resiliency Engine
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-700/40">
                {reasoningSteps.length} Steps
              </span>
              <button
                onClick={onToggleOpen}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-3.5 max-h-[420px] flex flex-col">
            
            {/* Minimalist Switcher */}
            <div className="flex items-center gap-1.5 mb-3 p-1 rounded-xl bg-slate-950/60 border border-white/5">
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono transition-all text-center ${
                  activeTab === "timeline"
                    ? "bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Traces ({reasoningSteps.length})
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono transition-all text-center ${
                  activeTab === "chat"
                    ? "bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Live Copilot Chat
              </button>
            </div>

            {activeTab === "timeline" ? (
              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                {reasoningSteps.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-mono text-xs space-y-3">
                    <p>Swarm monitoring national telemetry.</p>
                    <button
                      onClick={onTriggerInvestigation}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/80 to-cyan-600/80 hover:from-amber-500 hover:to-cyan-500 text-white font-mono text-xs font-semibold shadow-md transition-all"
                    >
                      Trigger Autonomous RCA
                    </button>
                  </div>
                ) : (
                  reasoningSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-slate-950/70 border border-white/5 text-xs font-mono space-y-1.5 transition-all hover:border-cyan-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                          {step.step === "ANOMALY_DETECTION" && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                          {step.step.includes("SQL") && <Database className="w-3.5 h-3.5 text-amber-400" />}
                          {step.step === "ROOT_CAUSE_SYNTHESIS" && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
                          {step.step.includes("MITIGATION") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {step.step.includes("ENFORCEMENT") && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                          <span>{step.agent}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 uppercase bg-white/5 px-1.5 py-0.5 rounded">
                          {step.status}
                        </span>
                      </div>

                      {step.step === "ANOMALY_DETECTION" && (
                        <div className="text-slate-300 text-[11px] bg-red-950/30 p-2 rounded-xl border border-red-900/40">
                          {step.data.message}
                          <div className="text-[10px] text-red-400 mt-1 font-semibold">
                            Z-SCORE: +{step.data.z_score}σ (Observed: {step.data.observed_value}ms)
                          </div>
                        </div>
                      )}

                      {step.step === "SQL_INVESTIGATION" && (
                        <div className="text-slate-300 text-[11px]">
                          <div className="text-amber-400 text-[10px] mb-1 font-semibold">AI SQL Tool Call:</div>
                          <pre className="bg-black/90 p-2 rounded-xl border border-amber-500/20 text-amber-200 text-[10px] overflow-x-auto whitespace-pre-wrap font-mono">
                            {step.data.generated_query}
                          </pre>
                        </div>
                      )}

                      {step.step === "SQL_RESULTS_ANALYSIS" && (
                        <div className="text-slate-300 text-[11px] bg-slate-900/60 p-2 rounded-xl">
                          <div>{step.data.summary}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Gateways: {step.data.affected_gateways?.join(", ")}
                          </div>
                        </div>
                      )}

                      {step.step === "ROOT_CAUSE_SYNTHESIS" && (
                        <div className="text-purple-200 text-[11px] bg-purple-950/30 p-2 rounded-xl border border-purple-800/40">
                          <div className="font-bold text-[11px]">{step.data.root_cause_type}</div>
                          <div className="text-slate-300 mt-0.5 text-[10px]">{step.data.diagnosis}</div>
                        </div>
                      )}

                      {step.step === "MITIGATION_POLICY_PROPOSAL" && (
                        <div className="text-emerald-200 text-[11px] bg-emerald-950/30 p-2 rounded-xl border border-emerald-800/40">
                          <div className="font-bold text-[11px]">{step.data.action_id}</div>
                          <div className="text-slate-300 mt-0.5 text-[10px]">{step.data.policy}</div>
                        </div>
                      )}

                      {step.step === "AUTONOMOUS_ENFORCEMENT" && (
                        <div className="text-cyan-200 text-[11px] bg-cyan-950/40 p-2 rounded-xl border border-cyan-800/40">
                          <div className="font-bold text-emerald-400">✓ REMEDIATION ACTIVE</div>
                          <div className="text-slate-300 text-[10px]">{step.data.remediation_status}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto space-y-2 flex-1 pr-1 mb-2.5 max-h-56">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-2xl text-xs font-mono ${
                        msg.role === "user"
                          ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 ml-4"
                          : "bg-slate-900/80 border border-white/10 text-slate-200 mr-2"
                      }`}
                    >
                      <div className="text-[9px] text-slate-400 mb-1 font-bold">
                        {msg.role === "user" ? "OPERATOR" : "AEGIS AI"}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-[11px]">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask: 'Why did HDFC fail?'..."
                    className="flex-1 bg-black/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      )}
    </aside>
  );
}