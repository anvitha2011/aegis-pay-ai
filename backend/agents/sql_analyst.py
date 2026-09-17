from typing import Dict, Any, List
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
