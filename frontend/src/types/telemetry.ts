export type ScrollStage = 
  | "HERO"          // 0.00 - 0.20: India Macro Grid
  | "TXN_ZOOM"      // 0.20 - 0.38: Single Transaction Focus
  | "TOPOLOGY"      // 0.38 - 0.55: Network Node Expansion
  | "INCIDENT"      // 0.55 - 0.72: CBS Latency Explosion
  | "AI_SWARM"      // 0.72 - 0.88: LangGraph Autonomous Reasoning
  | "RESOLUTION";   // 0.88 - 1.00: Dynamic Reroute & Self-Healing

export interface Transaction {
  timestamp: number;
  txn_id: string;
  amount: number;
  payer_vpa: string;
  payee_vpa: string;
  rail: string;
  bank_switch: string;
  gateway: string;
  status: "SUCCESS" | "TIMEOUT" | "FAILED" | "THROTTLED";
  latency_ms: number;
  error_code?: string | null;
  error_message?: string | null;
}

export interface TelemetryFrame {
  type: string;
  timestamp: number;
  national_tps: number;
  success_rate: number;
  avg_latency_ms: number;
  system_state: "HEALTHY" | "CRITICAL_OUTAGE" | "AUTONOMOUSLY_MITIGATED" | "DEGRADED_MITIGATED";
  incident_active: boolean;
  degraded_node: string | null;
  mitigated: boolean;
  circuit_breakers: Record<string, string>;
  weights: Record<string, number>;
  latest_transaction?: Transaction;
}

export interface AgentReasoningStep {
  step: 
    | "ANOMALY_DETECTION" 
    | "SQL_INVESTIGATION" 
    | "SQL_RESULTS_ANALYSIS" 
    | "ROOT_CAUSE_SYNTHESIS" 
    | "MITIGATION_POLICY_PROPOSAL" 
    | "AUTONOMOUS_ENFORCEMENT";
  agent: string;
  status: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface NodeComponentData {
  id: string;
  name: string;
  type: "SWITCH" | "BANK_CBS" | "GATEWAY" | "RAIL" | "AI_CORE";
  subsystem: string;
  status: "HEALTHY" | "DEGRADED" | "STANDBY" | "MITIGATED";
  tps: number;
  latency_ms: number;
  position: [number, number, number];
  color: string;
  internalDetails: {
    connectionPool: { active: number; max: number; waiting: number };
    cpuLoad: number;
    memoryMb: number;
    p99Latency: number;
    activeThreads: number;
    lockContention: string;
    subsystems: string[];
    logs: string[];
  };
}