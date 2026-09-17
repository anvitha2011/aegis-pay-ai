import asyncio
import random
import time
from typing import Dict, Any
from backend.db.telemetry_store import record_transaction
from backend.simulation.event_bus import bus

class PaymentTrafficSimulator:
    def __init__(self):
        self.running = False
        self.incident_active = False
        self.degraded_node = None
        self.mitigated = False
        self.national_tps = 84250.0
        self.national_sr = 99.98
        self.avg_latency_ms = 24.5

    def inject_incident(self, node: str = "HDFC_CBS_01"):
        self.incident_active = True
        self.degraded_node = node
        self.mitigated = False
        bus.set_key("system_state", "CRITICAL_OUTAGE")

    def resolve_incident(self):
        self.incident_active = False
        self.degraded_node = None
        self.mitigated = True
        bus.set_key("system_state", "HEALTHY")
        for k in ["HDFC_CBS_01", "SBI_CORE_02", "ICICI_CBS_01", "AXIS_CBS_01"]:
            bus.set_key(f"circuit_breaker:{k}", "CLOSED")
            bus.set_key(f"weights:{k}", 0.25)

    def apply_mitigation(self):
        self.mitigated = True
        bus.set_key("system_state", "AUTONOMOUSLY_MITIGATED")

    async def start_streaming(self):
        self.running = True
        banks = ["HDFC_CBS_01", "SBI_CORE_02", "ICICI_CBS_01", "AXIS_CBS_01"]
        gateways = ["RAZORPAY_GW", "CASHFREE_GW", "PINE_LABS", "STRIPE_IN"]
        rails = ["UPI_2_0", "IMPS", "RUPAY_TOKEN"]

        while self.running:
            try:
                # Dynamic health metrics adjustment
                if self.incident_active and not self.mitigated:
                    # Degrading metrics
                    self.national_sr = max(71.2, self.national_sr - random.uniform(2.5, 4.5))
                    self.avg_latency_ms = min(1840.0, self.avg_latency_ms + random.uniform(120.0, 250.0))
                    self.national_tps = max(62000.0, self.national_tps - random.uniform(800.0, 1500.0))
                elif self.mitigated and self.incident_active:
                    # Healing metrics under mitigation
                    self.national_sr = min(99.95, self.national_sr + random.uniform(3.0, 5.5))
                    self.avg_latency_ms = max(28.0, self.avg_latency_ms - random.uniform(150.0, 280.0))
                    self.national_tps = min(84500.0, self.national_tps + random.uniform(900.0, 1800.0))
                else:
                    # Healthy baseline jitter
                    self.national_sr = round(min(99.99, max(99.92, self.national_sr + random.uniform(-0.02, 0.02))), 2)
                    self.avg_latency_ms = round(min(28.0, max(21.0, self.avg_latency_ms + random.uniform(-0.5, 0.5))), 1)
                    self.national_tps = round(min(86000.0, max(82000.0, self.national_tps + random.uniform(-300.0, 300.0))), 0)

                # Determine target bank based on weights
                weights = bus.get_all_weights()
                bank_keys = list(weights.keys())
                bank_probs = [weights.get(k, 0.25) for k in bank_keys]
                selected_bank = random.choices(bank_keys, weights=bank_probs, k=1)[0]
                gw = random.choice(gateways)
                rail = random.choice(rails)

                # Simulate transaction outcome
                is_fail = False
                err_code = None
                err_msg = None
                lat = round(random.uniform(18.0, 32.0), 1)

                if self.incident_active and selected_bank == self.degraded_node and not self.mitigated:
                    if random.random() < 0.85:
                        is_fail = True
                        lat = round(random.uniform(1200.0, 2400.0), 1)
                        err_code = "ERR_CBS_TIMEOUT_504"
                        err_msg = "HikariPool-1 connection timeout (30000ms). Lock contention on Ledger_Shard_4"

                status = "TIMEOUT" if (is_fail and "TIMEOUT" in str(err_code)) else ("FAILED" if is_fail else "SUCCESS")

                txn = {
                    "timestamp": time.time(),
                    "txn_id": f"TXN_{random.randint(10000000, 99999999)}",
                    "amount": round(random.uniform(20.0, 8500.0), 2),
                    "payer_vpa": f"user{random.randint(1000, 9999)}@{selected_bank.lower().split('_')[0]}",
                    "payee_vpa": f"merchant_{random.randint(10, 80)}@razorpay",
                    "rail": rail,
                    "bank_switch": selected_bank,
                    "gateway": gw,
                    "status": status,
                    "latency_ms": lat,
                    "error_code": err_code,
                    "error_message": err_msg
                }

                # Record in SQLite and publish to stream
                record_transaction(txn)
                await bus.publish("payment.transactions", txn)

                # Broadcast current macro telemetry frame
                telemetry_frame = {
                    "type": "TELEMETRY_FRAME",
                    "timestamp": time.time(),
                    "national_tps": round(self.national_tps, 0),
                    "success_rate": round(self.national_sr, 2),
                    "avg_latency_ms": round(self.avg_latency_ms, 1),
                    "system_state": bus.get_key("system_state", "HEALTHY"),
                    "incident_active": self.incident_active,
                    "degraded_node": self.degraded_node,
                    "mitigated": self.mitigated,
                    "circuit_breakers": bus.get_all_breakers(),
                    "weights": bus.get_all_weights(),
                    "latest_transaction": txn
                }
                await bus.publish("network.metrics", telemetry_frame)

                await asyncio.sleep(0.12)
            except Exception as e:
                print(f"Error in traffic simulator: {e}")
                await asyncio.sleep(0.5)

traffic_simulator = PaymentTrafficSimulator()