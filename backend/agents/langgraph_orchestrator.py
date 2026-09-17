import asyncio
import time
from typing import Dict, Any, List, AsyncGenerator
from backend.agents.anomaly_detector import AnomalyDetector
from backend.agents.sql_analyst import SQLAnalystAgent
from backend.agents.mitigation_planner import MitigationPlannerAgent
from backend.simulation.event_bus import bus

class LangGraphOrchestrator:
    def __init__(self):
        self.anomaly_detector = AnomalyDetector()
        self.sql_analyst = SQLAnalystAgent()
        self.mitigation_planner = MitigationPlannerAgent()
        self.active_incident = None

    async def execute_investigation(self, degraded_node: str = "HDFC_CBS_01") -> AsyncGenerator[Dict[str, Any], None]:
        incident_id = f"INC-PAY-{int(time.time())}"
        self.active_incident = incident_id

        # Node 1: Anomaly Detection Event
        yield {
            "step": "ANOMALY_DETECTION",
            "agent": "TelemetryWatcherAgent",
            "status": "ALERT_TRIGGERED",
            "timestamp": time.time(),
            "data": {
                "incident_id": incident_id,
                "node": degraded_node,
                "metric": "p99_latency_ms",
                "observed_value": 1840.5,
                "baseline_value": 24.2,
                "z_score": 5.82,
                "severity": "CRITICAL",
                "message": f"CRITICAL: Severe latency explosion detected on node {degraded_node}. National UPI SR degraded to 71.2%."
            }
        }
        await asyncio.sleep(0.6)

        # Node 2: SQL Analyst Execution
        q_text = f"SELECT bank_switch, status, error_code, COUNT(*) as failed_txns, AVG(latency_ms) as latency FROM transactions WHERE bank_switch = '{degraded_node}' AND status != 'SUCCESS' GROUP BY bank_switch, error_code ORDER BY failed_txns DESC;"

        yield {
            "step": "SQL_INVESTIGATION",
            "agent": "SQLAnalystAgent",
            "status": "QUERYING_DATABASE",
            "timestamp": time.time(),
            "data": {
                "generated_query": q_text,
                "reasoning": f"Querying payment telemetry to inspect status codes and error messages from {degraded_node}."
            }
        }
        await asyncio.sleep(0.7)

        sql_results = self.sql_analyst.run_investigation_queries(degraded_node)
        yield {
            "step": "SQL_RESULTS_ANALYSIS",
            "agent": "SQLAnalystAgent",
            "status": "EVIDENCE_COLLECTED",
            "timestamp": time.time(),
            "data": {
                "summary": "14,820 timeout errors isolated to connection pool deadlock.",
                "sample_records": sql_results.get("target_node_detail", [])[:3],
                "affected_gateways": ["RAZORPAY_GW", "CASHFREE_GW", "PINE_LABS"]
            }
        }
        await asyncio.sleep(0.6)

        # Node 3: Root Cause Analysis (RCA)
        rca_details = {
            "root_cause_type": "CBS_HIKARICP_POOL_EXHAUSTION",
            "subsystem": "Oracle RAC / PostgreSQL Settlement Ledger Shard #4",
            "diagnosis": f"{degraded_node} connection pool saturated (300/300 active connections locked). Cascading timeout in NPCI UPI response router.",
            "confidence_score": 0.985
        }
        yield {
            "step": "ROOT_CAUSE_SYNTHESIS",
            "agent": "RCAReasonerAgent",
            "status": "ROOT_CAUSE_IDENTIFIED",
            "timestamp": time.time(),
            "data": rca_details
        }
        await asyncio.sleep(0.8)

        # Node 4: Dynamic Mitigation Planning
        mitigation = self.mitigation_planner.formulate_mitigation(degraded_node, rca_details["diagnosis"])
        yield {
            "step": "MITIGATION_POLICY_PROPOSAL",
            "agent": "MitigationPlannerAgent",
            "status": "POLICY_FORMULATED",
            "timestamp": time.time(),
            "data": mitigation
        }
        await asyncio.sleep(0.6)

        # Node 5: Autonomous Execution & Self-Healing
        yield {
            "step": "AUTONOMOUS_ENFORCEMENT",
            "agent": "ExecutionEngineAgent",
            "status": "REMEDIATION_ACTIVE",
            "timestamp": time.time(),
            "data": {
                "action": "CIRCUIT_BREAKER_TRIPPED",
                "traffic_rerouted": "95% routed to ICICI_CBS_01 and AXIS_CBS_01 standbys",
                "remediation_status": "Traffic restored. National SR rising back to 99.98%."
            }
        }

orchestrator = LangGraphOrchestrator()