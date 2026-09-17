import numpy as np
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
