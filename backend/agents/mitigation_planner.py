from typing import Dict, Any
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
