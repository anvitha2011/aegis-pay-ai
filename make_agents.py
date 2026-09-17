anomaly_code = '''import numpy as np
from typing import Dict, Any, List

class AnomalyDetector:
    """Detects statistical latency and error rate spikes using z-scores and sliding windows."""
    def __init__(self, window_size: int = 50, z_threshold: float = 2.5):
        self.window_size = window_size
        self.z_threshold = z_threshold
        self.latency_history: List[float] = [22.0] * 30
        self.failure_history: List[int] = [0] * 30

    def record_observation(self, latency_ms: float, is_failure: bool) -> Dict[str, Any]:
        self.latency_history.append(latency_ms)
        self.failure_history.append(1 if is_failure else 0)
        
        if len(self.latency_history) > self.window_size:
            self.latency_history.pop(0)
            self.failure_history.pop(0)

        mean_lat = float(np.mean(self.latency_history[:-1]))
        std_lat = float(np.std(self.latency_history[:-1])) or 1.0
        current_z = (latency_ms - mean_lat) / std_lat

        fail_rate = sum(self.failure_history) / len(self.failure_history)

        is_anomaly = (current_z > self.z_threshold) or (fail_rate > 0.15)
        severity = "NORMAL"
        if is_anomaly:
            severity = "CRITICAL" if (current_z > 4.0 or fail_rate > 0.4) else "WARNING"

        return {
            "is_anomaly": is_anomaly,
            "severity": severity,
            "current_latency": latency_ms,
            "mean_latency": round(mean_lat, 2),
            "z_score": round(current_z, 2),
            "failure_rate": round(fail_rate * 100, 1),
        }
'''
with open('backend/agents/anomaly_detector.py', 'w', encoding='utf-8') as f:
    f.write(anomaly_code)

sql_analyst_code = '''from typing import Dict, Any, List
from backend.db.telemetry_store import execute_sql_query

class SQLAnalystAgent:
    """AI Agent tool that inspects the database to isolate root cause anomalies."""
    
    def run_investigation_queries(self, target_node: str) -> Dict[str, Any]:
        results = {}
        
        # 1. Error distribution by bank switch
        q1 = """
        SELECT bank_switch, status, error_code, COUNT(*) as count, AVG(latency_ms) as avg_latency
        FROM transactions
        WHERE timestamp >= (SELECT MAX(timestamp) - 60 FROM transactions)
        GROUP BY bank_switch, status, error_code
        ORDER BY count DESC
        LIMIT 10
        """
        try:
            results["error_breakdown"] = execute_sql_query(q1)
        except Exception as e:
            results["error_breakdown"] = [{"error": str(e)}]

        # 2. Detailed metrics for degraded node
        q2 = f"""
        SELECT status, error_code, error_message, count(*) as count, round(avg(latency_ms), 1) as avg_lat
        FROM transactions
        WHERE bank_switch = '{target_node}'
          AND timestamp >= (SELECT MAX(timestamp) - 60 FROM transactions)
        GROUP BY status, error_code, error_message
        """
        try:
            results["target_node_detail"] = execute_sql_query(q2)
        except Exception as e:
            results["target_node_detail"] = [{"error": str(e)}]

        # 3. Affected VPAs / Gateway distribution
        q3 = f"""
        SELECT gateway, rail, count(*) as fail_count
        FROM transactions
        WHERE bank_switch = '{target_node}' AND status != 'SUCCESS'
          AND timestamp >= (SELECT MAX(timestamp) - 60 FROM transactions)
        GROUP BY gateway, rail
        ORDER BY fail_count DESC
        """
        try:
            results["impacted_gateways"] = execute_sql_query(q3)
        except Exception as e:
            results["impacted_gateways"] = [{"error": str(e)}]

        return results
'''
with open('backend/agents/sql_analyst.py', 'w', encoding='utf-8') as f:
    f.write(sql_analyst_code)

mitigation_code = '''from typing import Dict, Any
from backend.simulation.event_bus import bus

class MitigationPlannerAgent:
    """Devises and enforces circuit breaker trips and dynamic traffic rebalancing."""
    
    def formulate_mitigation(self, degraded_node: str, root_cause: str) -> Dict[str, Any]:
        # Formulate dynamic diversion
        healthy_nodes = ["SBI_CORE_02", "ICICI_CBS_01", "AXIS_CBS_01"]
        if degraded_node in healthy_nodes:
            healthy_nodes.remove(degraded_node)

        rerouted_weights = {degraded_node: 0.05}
        remaining_weight = 0.95
        share = round(remaining_weight / len(healthy_nodes), 3)
        for node in healthy_nodes:
            rerouted_weights[node] = share
            
        action = {
            "action_id": f"ACT_{degraded_node}_CIRCUIT_TRIP",
            "circuit_breaker": {
                degraded_node: "OPEN_TRIPPED",
                "healthy_standbys": healthy_nodes
            },
            "new_traffic_weights": rerouted_weights,
            "policy": f"Diverted 95% traffic from {degraded_node} to alternate CBS switches. Rate-limiting non-critical webhooks.",
            "status": "ENFORCED"
        }
        
        # Apply to Redis state
        bus.set_key(f"circuit_breaker:{degraded_node}", "OPEN_TRIPPED")
        for k, v in rerouted_weights.items():
            bus.set_key(f"weights:{k}", v)
        bus.set_key("system_state", "DEGRADED_MITIGATED")

        return action
'''
with open('backend/agents/mitigation_planner.py', 'w', encoding='utf-8') as f:
    f.write(mitigation_code)

print('agents created.')
