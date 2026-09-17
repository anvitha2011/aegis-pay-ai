import { NodeComponentData } from "../types/telemetry";

export const INITIAL_NETWORK_NODES: NodeComponentData[] = [
  {
    id: "NPCI_UPI_SWITCH",
    name: "NPCI Central Switch",
    type: "SWITCH",
    subsystem: "National Clearing & Router Matrix (Mumbai DC-1)",
    status: "HEALTHY",
    tps: 84250,
    latency_ms: 12.4,
    position: [0, 0, 0],
    color: "#06b6d4", // Cyan
    internalDetails: {
      connectionPool: { active: 1420, max: 4000, waiting: 0 },
      cpuLoad: 38.5,
      memoryMb: 128400,
      p99Latency: 18.2,
      activeThreads: 240,
      lockContention: "None (Zero Deadlocks)",
      subsystems: ["ISO 8583 Engine", "UPI 2.0 XML Parser", "Active-Active Geo-Replication"],
      logs: [
        "[07:25:01] NPCI Core Switch active on primary fiber ring",
        "[07:25:02] Multi-bank routing table synchronizing (0.4ms delta)",
        "[07:25:03] Cleared 1,480,200 transactions in current 60s epoch"
      ]
    }
  },
  {
    id: "HDFC_CBS_01",
    name: "HDFC Core Banking (CBS)",
    type: "BANK_CBS",
    subsystem: "CBS Cluster Alpha - Oracle RAC Ledger Shard #4",
    status: "HEALTHY", // Changes to DEGRADED during incident
    tps: 29500,
    latency_ms: 24.8,
    position: [-6, 3, -4],
    color: "#3b82f6", // Blue -> turns #ef4444 red in incident
    internalDetails: {
      connectionPool: { active: 300, max: 300, waiting: 1482 },
      cpuLoad: 98.4,
      memoryMb: 64200,
      p99Latency: 1840.5,
      activeThreads: 300,
      lockContention: "CRITICAL: Row Lock on ledger_shard_4 (TXN_MUTEX_WAIT)",
      subsystems: ["HikariCP Pool (300 conn)", "Oracle RAC Node 2", "HSM Security Module"],
      logs: [
        "[ALERT] HikariPool-1 - Connection is not available, request timed out after 30000ms",
        "[ERROR] Thread 284 waiting for monitor lock held by Thread 142",
        "[CRITICAL] Cascading 504 Gateway Timeout propagated to NPCI gateway switch"
      ]
    }
  },
  {
    id: "SBI_CORE_02",
    name: "SBI Finacle Core Switch",
    type: "BANK_CBS",
    subsystem: "SBI Enterprise Finacle Engine (Hyderabad DR)",
    status: "HEALTHY",
    tps: 22100,
    latency_ms: 22.1,
    position: [6, 3, -4],
    color: "#3b82f6",
    internalDetails: {
      connectionPool: { active: 180, max: 800, waiting: 0 },
      cpuLoad: 42.1,
      memoryMb: 98000,
      p99Latency: 28.5,
      activeThreads: 180,
      lockContention: "None",
      subsystems: ["Finacle 11.8 Core", "INB Middleware", "UPI Adaptor"],
      logs: [
        "[INFO] Normal transaction debit/credit flow executing",
        "[INFO] Standby buffer ready for dynamic load absorption"
      ]
    }
  },
  {
    id: "ICICI_CBS_01",
    name: "ICICI Core Switch",
    type: "BANK_CBS",
    subsystem: "ICICI Core API & Host Switch (BKC Mumbai)",
    status: "HEALTHY",
    tps: 18900,
    latency_ms: 19.5,
    position: [-8, -3, -3],
    color: "#3b82f6",
    internalDetails: {
      connectionPool: { active: 140, max: 600, waiting: 0 },
      cpuLoad: 31.2,
      memoryMb: 52000,
      p99Latency: 22.0,
      activeThreads: 120,
      lockContention: "None",
      subsystems: ["ICICI iMobile Gateway", "CBS Host Switch", "Redis Cache Layer"],
      logs: [
        "[INFO] Adaptive rerouting ready. Channel capacity 45,000 TPS"
      ]
    }
  },
  {
    id: "AXIS_CBS_01",
    name: "Axis Bank Switch",
    type: "BANK_CBS",
    subsystem: "Axis UPI Gateway & Core Ledger",
    status: "HEALTHY",
    tps: 13750,
    latency_ms: 21.0,
    position: [8, -3, -3],
    color: "#3b82f6",
    internalDetails: {
      connectionPool: { active: 95, max: 500, waiting: 0 },
      cpuLoad: 28.4,
      memoryMb: 41000,
      p99Latency: 24.1,
      activeThreads: 95,
      lockContention: "None",
      subsystems: ["Axis Unified UPI API", "Core Host Engine"],
      logs: [
        "[INFO] Normal queue processing; 0 deadlocks"
      ]
    }
  },
  {
    id: "RAZORPAY_GW",
    name: "Razorpay Gateway Core",
    type: "GATEWAY",
    subsystem: "Smart Router & Merchant Ingestion",
    status: "HEALTHY",
    tps: 41200,
    latency_ms: 16.8,
    position: [-4, 6, 2],
    color: "#8b5cf6", // Purple
    internalDetails: {
      connectionPool: { active: 450, max: 2000, waiting: 0 },
      cpuLoad: 48.0,
      memoryMb: 32000,
      p99Latency: 20.4,
      activeThreads: 320,
      lockContention: "None",
      subsystems: ["Dynamic Routing Engine", "Token Vault", "Instant Webhook Dispatcher"],
      logs: [
        "[INFO] Smart Router active across 14 payment switches"
      ]
    }
  },
  {
    id: "CASHFREE_GW",
    name: "Cashfree Router",
    type: "GATEWAY",
    subsystem: "Payouts & Dynamic Merchant Checkout",
    status: "HEALTHY",
    tps: 24800,
    latency_ms: 18.2,
    position: [4, 6, 2],
    color: "#8b5cf6",
    internalDetails: {
      connectionPool: { active: 280, max: 1500, waiting: 0 },
      cpuLoad: 41.5,
      memoryMb: 28000,
      p99Latency: 22.8,
      activeThreads: 180,
      lockContention: "None",
      subsystems: ["Auto-Collect Engine", "UPI Intent Handler"],
      logs: [
        "[INFO] Traffic flowing across dual availability zones"
      ]
    }
  },
  {
    id: "RUPAY_TOKEN_SWITCH",
    name: "RuPay / Card Token Rail",
    type: "RAIL",
    subsystem: "RBI CoFT Token Vault & Card Network Switch",
    status: "HEALTHY",
    tps: 12400,
    latency_ms: 15.0,
    position: [0, -6, 2],
    color: "#10b981", // Emerald
    internalDetails: {
      connectionPool: { active: 110, max: 800, waiting: 0 },
      cpuLoad: 25.1,
      memoryMb: 24000,
      p99Latency: 17.5,
      activeThreads: 90,
      lockContention: "None",
      subsystems: ["Hardware Security Module (HSM)", "Card Token Resolver"],
      logs: [
        "[INFO] Token cryptogram verification latency: 4.2ms"
      ]
    }
  },
  {
    id: "LANGGRAPH_AI_NERVE",
    name: "Aegis LangGraph Swarm Core",
    type: "AI_CORE",
    subsystem: "Autonomous Resiliency & Incident Remediation Swarm",
    status: "HEALTHY",
    tps: 84250,
    latency_ms: 2.1,
    position: [0, 8, -6],
    color: "#f59e0b", // Amber/Gold
    internalDetails: {
      connectionPool: { active: 64, max: 256, waiting: 0 },
      cpuLoad: 18.2,
      memoryMb: 36000,
      p99Latency: 4.8,
      activeThreads: 32,
      lockContention: "None",
      subsystems: [
        "Anomaly Detection Engine (Z-Score & ARIMA)",
        "SQL Analyst Reasoning Agent",
        "Adaptive Circuit Breaker Synthesizer",
        "Kafka Event Bus Streamer"
      ],
      logs: [
        "[AI] Swarm listening to 100,000 TPS real-time telemetry buffer",
        "[AI] Dynamic prompt context: 14 bank switches, 6 gateways",
        "[AI] Ready for sub-second incident classification and autonomous mitigation"
      ]
    }
  }
];