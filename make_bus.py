# Event Bus (simulating Kafka & Redis)
event_bus_code = '''import asyncio
import json
from typing import Callable, Dict, List, Any
import time

class EventBus:
    """Async event bus mimicking Kafka topics with pub/sub and Redis-style state."""
    def __init__(self):
        self.subscribers: Dict[str, List[Callable[[Dict[str, Any]], Any]]] = {}
        # In-memory Redis simulation
        self.kv_store: Dict[str, Any] = {
            "circuit_breaker:HDFC_CBS_01": "CLOSED",
            "circuit_breaker:SBI_CORE_02": "CLOSED",
            "circuit_breaker:ICICI_CBS_01": "CLOSED",
            "circuit_breaker:AXIS_CBS_01": "CLOSED",
            "weights:HDFC_CBS_01": 0.35,
            "weights:SBI_CORE_02": 0.25,
            "weights:ICICI_CBS_01": 0.25,
            "weights:AXIS_CBS_01": 0.15,
            "system_state": "HEALTHY"
        }
    
    def subscribe(self, topic: str, callback: Callable[[Dict[str, Any]], Any]):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)
        
    async def publish(self, topic: str, message: Dict[str, Any]):
        if topic in self.subscribers:
            for cb in self.subscribers[topic]:
                try:
                    if asyncio.iscoroutinefunction(cb):
                        await cb(message)
                    else:
                        cb(message)
                except Exception as e:
                    print(f"Error invoking subscriber on {topic}: {e}")

    def set_key(self, key: str, value: Any):
        self.kv_store[key] = value

    def get_key(self, key: str, default=None):
        return self.kv_store.get(key, default)

    def get_all_breakers(self) -> Dict[str, str]:
        return {k.replace("circuit_breaker:", ""): v for k, v in self.kv_store.items() if k.startswith("circuit_breaker:")}

    def get_all_weights(self) -> Dict[str, float]:
        return {k.replace("weights:", ""): v for k, v in self.kv_store.items() if k.startswith("weights:")}

bus = EventBus()
'''
with open('backend/simulation/event_bus.py', 'w', encoding='utf-8') as f:
    f.write(event_bus_code)

print('event_bus.py written.')
