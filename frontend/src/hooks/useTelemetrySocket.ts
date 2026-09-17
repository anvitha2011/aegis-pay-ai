import { useState, useEffect, useRef, useCallback } from "react";
import type { TelemetryFrame, AgentReasoningStep } from "../types/telemetry";

const INITIAL_TELEMETRY: TelemetryFrame = {
  type: "TELEMETRY_FRAME",
  timestamp: Date.now(),
  national_tps: 84250,
  success_rate: 99.98,
  avg_latency_ms: 24.5,
  system_state: "HEALTHY",
  incident_active: false,
  degraded_node: null,
  mitigated: false,
  circuit_breakers: {
    HDFC_CBS_01: "CLOSED",
    SBI_CORE_02: "CLOSED",
    ICICI_CBS_01: "CLOSED",
    AXIS_CBS_01: "CLOSED"
  },
  weights: {
    HDFC_CBS_01: 0.35,
    SBI_CORE_02: 0.25,
    ICICI_CBS_01: 0.25,
    AXIS_CBS_01: 0.15
  },
  latest_transaction: {
    timestamp: Date.now(),
    txn_id: "TXN_9842_HDFC_UPI",
    amount: 2450.00,
    payer_vpa: "rohit.verma@okhdfcbank",
    payee_vpa: "swiggy.merchant@razorpay",
    rail: "UPI_2_0",
    bank_switch: "HDFC_CBS_01",
    gateway: "RAZORPAY_GW",
    status: "SUCCESS",
    latency_ms: 23.4
  }
};

export function useTelemetrySocket(scrollStageIndex: number) {
  const [telemetry, setTelemetry] = useState<TelemetryFrame>(INITIAL_TELEMETRY);
  const [reasoningSteps, setReasoningSteps] = useState<AgentReasoningStep[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "agent"; text: string }>>([
    {
      role: "agent",
      text: "Aegis AI Control Engine initialized. Real-time telemetry monitoring 85,000+ national transactions/sec across UPI, IMPS, and RuPay rails."
    }
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Declare callbacks first before useEffects
  const triggerIncident = useCallback(async (node = "HDFC_CBS_01") => {
    setTelemetry((prev) => ({
      ...prev,
      incident_active: true,
      degraded_node: node,
      mitigated: false,
      system_state: "CRITICAL_OUTAGE"
    }));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "TRIGGER_INCIDENT", node }));
    } else {
      try {
        await fetch("/api/chaos/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ node, failure_type: "POOL_EXHAUSTION" })
        });
      } catch {}
    }
  }, []);

  const runInvestigation = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "RUN_INVESTIGATION" }));
    } else {
      try {
        await fetch("/api/agent/investigate", { method: "POST" });
      } catch {}
    }

    const simulatedSteps: AgentReasoningStep[] = [
      {
        step: "ANOMALY_DETECTION",
        agent: "TelemetryWatcherAgent",
        status: "ALERT_TRIGGERED",
        timestamp: Date.now(),
        data: {
          incident_id: `INC-PAY-${Date.now()}`,
          node: "HDFC_CBS_01",
          metric: "p99_latency_ms",
          observed_value: 1840.5,
          baseline_value: 24.2,
          z_score: 5.82,
          severity: "CRITICAL",
          message: "CRITICAL: Severe latency explosion detected on node HDFC_CBS_01. National UPI SR degraded to 71.2%."
        }
      },
      {
        step: "SQL_INVESTIGATION",
        agent: "SQLAnalystAgent",
        status: "QUERYING_DATABASE",
        timestamp: Date.now() + 600,
        data: {
          generated_query: "SELECT bank_switch, status, error_code, COUNT(*) as failed_txns, AVG(latency_ms) as latency FROM transactions WHERE bank_switch = 'HDFC_CBS_01' AND status != 'SUCCESS' GROUP BY bank_switch, error_code ORDER BY failed_txns DESC;",
          reasoning: "Querying payment telemetry to inspect status codes and error messages from HDFC_CBS_01."
        }
      },
      {
        step: "SQL_RESULTS_ANALYSIS",
        agent: "SQLAnalystAgent",
        status: "EVIDENCE_COLLECTED",
        timestamp: Date.now() + 1200,
        data: {
          summary: "14,820 timeout errors isolated to connection pool deadlock on Shard #4.",
          sample_records: [
            { bank_switch: "HDFC_CBS_01", status: "TIMEOUT", error_code: "ERR_CBS_TIMEOUT_504", latency: "1840.5ms" }
          ],
          affected_gateways: ["RAZORPAY_GW", "CASHFREE_GW", "PINE_LABS"]
        }
      },
      {
        step: "ROOT_CAUSE_SYNTHESIS",
        agent: "RCAReasonerAgent",
        status: "ROOT_CAUSE_IDENTIFIED",
        timestamp: Date.now() + 1800,
        data: {
          root_cause_type: "CBS_HIKARICP_POOL_EXHAUSTION",
          subsystem: "Oracle RAC / PostgreSQL Settlement Ledger Shard #4",
          diagnosis: "HDFC_CBS_01 connection pool saturated (300/300 active connections locked). Cascading timeout in NPCI UPI response router.",
          confidence_score: 0.985
        }
      },
      {
        step: "MITIGATION_POLICY_PROPOSAL",
        agent: "MitigationPlannerAgent",
        status: "POLICY_FORMULATED",
        timestamp: Date.now() + 2400,
        data: {
          action_id: "ACT_HDFC_CBS_01_CIRCUIT_TRIP",
          circuit_breaker: { HDFC_CBS_01: "OPEN_TRIPPED" },
          new_traffic_weights: { HDFC_CBS_01: 0.05, SBI_CORE_02: 0.35, ICICI_CBS_01: 0.35, AXIS_CBS_01: 0.25 },
          policy: "Diverted 95% traffic from HDFC_CBS_01 to ICICI and Axis standby CBS switches."
        }
      },
      {
        step: "AUTONOMOUS_ENFORCEMENT",
        agent: "ExecutionEngineAgent",
        status: "REMEDIATION_ACTIVE",
        timestamp: Date.now() + 3000,
        data: {
          action: "CIRCUIT_BREAKER_TRIPPED",
          traffic_rerouted: "95% routed to ICICI_CBS_01 and AXIS_CBS_01 standbys",
          remediation_status: "Traffic restored. National SR rising back to 99.98%."
        }
      }
    ];

    simulatedSteps.forEach((step, i) => {
      setTimeout(() => {
        setReasoningSteps((prev) => {
          if (prev.some((p) => p.step === step.step)) return prev;
          return [...prev, step];
        });

        if (step.step === "MITIGATION_POLICY_PROPOSAL") {
          setTelemetry((prev) => ({
            ...prev,
            circuit_breakers: {
              ...prev.circuit_breakers,
              HDFC_CBS_01: "OPEN_TRIPPED"
            },
            weights: {
              HDFC_CBS_01: 0.05,
              SBI_CORE_02: 0.35,
              ICICI_CBS_01: 0.35,
              AXIS_CBS_01: 0.25
            }
          }));
        }

        if (step.step === "AUTONOMOUS_ENFORCEMENT") {
          setTelemetry((prev) => ({
            ...prev,
            mitigated: true,
            system_state: "AUTONOMOUSLY_MITIGATED"
          }));
        }
      }, i * 650);
    });
  }, []);

  const resolveIncident = useCallback(async () => {
    setTelemetry((prev) => ({
      ...prev,
      incident_active: false,
      degraded_node: null,
      mitigated: false,
      system_state: "HEALTHY",
      circuit_breakers: {
        HDFC_CBS_01: "CLOSED",
        SBI_CORE_02: "CLOSED",
        ICICI_CBS_01: "CLOSED",
        AXIS_CBS_01: "CLOSED"
      },
      weights: {
        HDFC_CBS_01: 0.35,
        SBI_CORE_02: 0.25,
        ICICI_CBS_01: 0.25,
        AXIS_CBS_01: 0.15
      }
    }));
    setReasoningSteps([]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "RESOLVE_INCIDENT" }));
    } else {
      try {
        await fetch("/api/chaos/resolve", { method: "POST" });
      } catch {}
    }
  }, []);

  const sendAgentChat = useCallback(async (query: string) => {
    setChatMessages((prev) => [...prev, { role: "user", text: query }]);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "agent", text: data.reply }]);
    } catch {
      setTimeout(() => {
        let reply = "Aegis AI Agent telemetry engine is actively monitoring national switches. All statistical indicators are normal.";
        const q = query.toLowerCase();
        if (q.includes("hdfc") || q.includes("fail") || q.includes("incident") || q.includes("why")) {
          reply = "Incident Summary for HDFC_CBS_01:\n- HikariCP pool exhaustion (300/300 threads blocked on ledger shard #4 mutex).\n- Autonomous mitigation diverted 95% traffic across ICICI and Axis CBS switches.\n- National success rate recovered from 71.2% back to 99.98%.";
        } else if (q.includes("sql") || q.includes("query")) {
          reply = "AI Telemetry SQL executed:\nSELECT status, error_code, count(*) FROM transactions WHERE bank_switch = 'HDFC_CBS_01' GROUP BY status, error_code;\nResult: 14,820 timeout errors recorded.";
        }
        setChatMessages((prev) => [...prev, { role: "agent", text: reply }]);
      }, 500);
    }
  }, []);

  // 2. Synchronize scroll stage with incident triggers
  useEffect(() => {
    if (scrollStageIndex >= 3 && !telemetry.incident_active && !telemetry.mitigated) {
      triggerIncident("HDFC_CBS_01");
    }
    if (scrollStageIndex >= 4 && telemetry.incident_active && reasoningSteps.length === 0) {
      runInvestigation();
    }
  }, [scrollStageIndex, telemetry.incident_active, telemetry.mitigated, reasoningSteps.length, triggerIncident, runInvestigation]);

  // 3. Connect to WebSocket
  useEffect(() => {
    let ws: WebSocket;
    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname === "localhost" ? "127.0.0.1:8000" : window.location.host;
        ws = new WebSocket(`${protocol}//${host}/ws/telemetry`);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "TELEMETRY_FRAME" || data.type === "INITIAL_HANDSHAKE") {
              setTelemetry((prev) => ({
                ...prev,
                ...data,
                latest_transaction: data.latest_transaction || prev.latest_transaction
              }));
            } else if (data.type === "AGENT_REASONING_STEP") {
              setReasoningSteps((prev) => {
                const step = data.step_data;
                const exists = prev.some((s) => s.step === step.step);
                if (exists) return prev;
                return [...prev, step];
              });
            } else if (data.type === "INCIDENT_DECLARED") {
              setTelemetry((prev) => ({
                ...prev,
                incident_active: true,
                degraded_node: data.node,
                system_state: "CRITICAL_OUTAGE"
              }));
            } else if (data.type === "INCIDENT_RESOLVED") {
              setTelemetry((prev) => ({
                ...prev,
                incident_active: false,
                degraded_node: null,
                mitigated: true,
                system_state: "HEALTHY"
              }));
            }
          } catch (e) {
            console.error("Failed to parse WS message", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(connect, 3000);
        };
        ws.onerror = () => setIsConnected(false);
      } catch {
        setIsConnected(false);
      }
    };

    connect();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // 4. Client-side telemetry simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let tps = prev.national_tps;
        let sr = prev.success_rate;
        let lat = prev.avg_latency_ms;

        if (prev.incident_active && !prev.mitigated) {
          sr = Math.max(71.2, sr - (Math.random() * 3.5 + 1.2));
          lat = Math.min(1840.0, lat + (Math.random() * 180 + 80));
          tps = Math.max(62400, tps - (Math.random() * 1200 + 400));
        } else if (prev.mitigated) {
          sr = Math.min(99.99, sr + (Math.random() * 4.2 + 2.1));
          lat = Math.max(23.8, lat - (Math.random() * 220 + 100));
          tps = Math.min(85200, tps + (Math.random() * 1400 + 500));
        } else {
          sr = Number(Math.min(99.99, Math.max(99.92, sr + (Math.random() * 0.04 - 0.02))).toFixed(2));
          lat = Number(Math.min(26.5, Math.max(22.0, lat + (Math.random() * 0.8 - 0.4))).toFixed(1));
          tps = Math.round(Math.min(86500, Math.max(82500, tps + (Math.random() * 400 - 200))));
        }

        const isIncident = prev.incident_active && !prev.mitigated;
        const simulatedTxn = {
          timestamp: Date.now(),
          txn_id: `TXN_${Math.floor(Math.random() * 900000 + 100000)}`,
          amount: Number((Math.random() * 4500 + 50).toFixed(2)),
          payer_vpa: `user_${Math.floor(Math.random() * 899 + 100)}@okhdfcbank`,
          payee_vpa: `merchant_${Math.floor(Math.random() * 49 + 10)}@razorpay`,
          rail: "UPI_2_0",
          bank_switch: isIncident ? "HDFC_CBS_01" : ["HDFC_CBS_01", "SBI_CORE_02", "ICICI_CBS_01"][Math.floor(Math.random() * 3)],
          gateway: "RAZORPAY_GW",
          status: isIncident && Math.random() < 0.85 ? ("TIMEOUT" as const) : ("SUCCESS" as const),
          latency_ms: isIncident ? Number((Math.random() * 1200 + 900).toFixed(1)) : Number((Math.random() * 15 + 18).toFixed(1)),
          error_code: isIncident ? "ERR_CBS_TIMEOUT_504" : null,
          error_message: isIncident ? "HikariCP pool timeout: Ledger_Shard_4 lock contention" : null
        };

        return {
          ...prev,
          national_tps: tps,
          success_rate: Number(sr.toFixed(2)),
          avg_latency_ms: Number(lat.toFixed(1)),
          latest_transaction: simulatedTxn
        };
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return {
    telemetry,
    reasoningSteps,
    chatMessages,
    isConnected,
    triggerIncident,
    runInvestigation,
    resolveIncident,
    sendAgentChat
  };
}