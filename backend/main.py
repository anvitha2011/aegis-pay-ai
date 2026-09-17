import asyncio
import json
import time
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.db.telemetry_store import init_db, execute_sql_query
from backend.simulation.event_bus import bus
from backend.simulation.payment_traffic_generator import traffic_simulator
from backend.agents.langgraph_orchestrator import orchestrator

active_connections: Set[WebSocket] = set()

async def broadcast_ws(message: Dict[str, Any]):
    dead = set()
    for ws in list(active_connections):
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.add(ws)
    for ws in dead:
        active_connections.discard(ws)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Subscribe to event bus for WebSocket broadcasting
    async def on_metric(frame):
        await broadcast_ws(frame)
    bus.subscribe("network.metrics", on_metric)

    # Start background payment traffic loop
    traffic_task = asyncio.create_task(traffic_simulator.start_streaming())
    print("AegisPay AI Engine Online. Traffic generator active.")
    try:
        yield
    finally:
        traffic_simulator.running = False
        traffic_task.cancel()

app = FastAPI(title="AegisPay AI Control Center", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChaosRequest(BaseModel):
    node: str = "HDFC_CBS_01"
    failure_type: str = "POOL_EXHAUSTION"

class ChatRequest(BaseModel):
    query: str

@app.get("/api/status")
async def get_status():
    return {
        "status": "ONLINE",
        "service": "AegisPay AI National Payment Control Center",
        "system_state": bus.get_key("system_state", "HEALTHY"),
        "tps": traffic_simulator.national_tps,
        "success_rate": traffic_simulator.national_sr,
        "latency_ms": traffic_simulator.avg_latency_ms,
        "active_ws_clients": len(active_connections)
    }

@app.post("/api/chaos/trigger")
async def trigger_chaos(req: ChaosRequest):
    traffic_simulator.inject_incident(req.node)
    alert_event = {
        "type": "INCIDENT_DECLARED",
        "timestamp": time.time(),
        "node": req.node,
        "failure_type": req.failure_type,
        "severity": "CRITICAL"
    }
    await broadcast_ws(alert_event)
    return {"status": "INCIDENT_TRIGGERED", "target_node": req.node}

@app.post("/api/chaos/resolve")
async def resolve_chaos():
    traffic_simulator.resolve_incident()
    resolve_event = {
        "type": "INCIDENT_RESOLVED",
        "timestamp": time.time(),
        "status": "ALL_SYSTEMS_NOMINAL"
    }
    await broadcast_ws(resolve_event)
    return {"status": "RESOLVED"}

@app.post("/api/agent/investigate")
async def run_investigation():
    target = traffic_simulator.degraded_node or "HDFC_CBS_01"
    
    async def stream_reasoning():
        async for step in orchestrator.execute_investigation(target):
            msg = {
                "type": "AGENT_REASONING_STEP",
                "timestamp": time.time(),
                "step_data": step
            }
            await broadcast_ws(msg)
            if step["step"] == "AUTONOMOUS_ENFORCEMENT":
                traffic_simulator.apply_mitigation()
    
    asyncio.create_task(stream_reasoning())
    return {"status": "INVESTIGATION_INITIATED", "target_node": target}

@app.post("/api/agent/chat")
async def agent_chat(req: ChatRequest):
    q = req.query.lower()
    if "hdfc" in q or "incident" in q or "fail" in q or "why" in q:
        reply = (
            "**Incident Analysis (HDFC_CBS_01)**:\n"
            "- **Primary Root Cause**: HikariCP connection pool exhaustion (300/300 active connections in `WAITING_FOR_LOCK` state).\n"
            "- **Impact**: Cascading 504 Gateway Timeouts across NPCI UPI Switch. National SR dropped to ~71.2%.\n"
            "- **Autonomous Mitigation Applied**: LangGraph orchestrator tripped circuit breaker `ACT_HDFC_CBS_01_CIRCUIT_TRIP` and dynamically reallocated 95% volume across SBI, ICICI, and Axis standby CBS switches."
        )
    elif "sql" in q or "query" in q or "database" in q:
        reply = (
            "**Executed Telemetry SQL**:\n"
            "```sql\n"
            "SELECT bank_switch, status, error_code, COUNT(*) as failed_txns, AVG(latency_ms) as latency\n"
            "FROM transactions WHERE bank_switch = 'HDFC_CBS_01' AND status != 'SUCCESS'\n"
            "GROUP BY bank_switch, error_code ORDER BY failed_txns DESC;\n"
            "```\n"
            "Found 14,820 timeout events isolated to HikariCP pool lock contention on ledger settlement shard #4."
        )
    elif "reroute" in q or "traffic" in q or "weights" in q:
        reply = f"Current traffic distribution: {bus.get_all_weights()}. Standby switches (ICICI & Axis) absorbing redirected volume under adaptive circuit breaker protection."
    else:
        reply = (
            "AegisPay AI autonomous agent monitoring national payment rails (UPI, IMPS, Cards). "
            "All telemetry streams are correlated with zero-drift statistical z-score models. How can I assist you with the infrastructure status?"
        )
    return {"reply": reply}

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        # Send initial handshake frame
        initial_frame = {
            "type": "INITIAL_HANDSHAKE",
            "timestamp": time.time(),
            "service": "AegisPay AI Control Center",
            "national_tps": traffic_simulator.national_tps,
            "success_rate": traffic_simulator.national_sr,
            "avg_latency_ms": traffic_simulator.avg_latency_ms,
            "system_state": bus.get_key("system_state", "HEALTHY"),
            "circuit_breakers": bus.get_all_breakers(),
            "weights": bus.get_all_weights()
        }
        await websocket.send_text(json.dumps(initial_frame))
        while True:
            data = await websocket.receive_text()
            # Handle client commands if any
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "TRIGGER_INCIDENT":
                    traffic_simulator.inject_incident(cmd.get("node", "HDFC_CBS_01"))
                elif cmd.get("action") == "RUN_INVESTIGATION":
                    target = traffic_simulator.degraded_node or "HDFC_CBS_01"
                    async for step in orchestrator.execute_investigation(target):
                        await broadcast_ws({"type": "AGENT_REASONING_STEP", "step_data": step})
                        if step["step"] == "AUTONOMOUS_ENFORCEMENT":
                            traffic_simulator.apply_mitigation()
                elif cmd.get("action") == "RESOLVE_INCIDENT":
                    traffic_simulator.resolve_incident()
            except Exception as e:
                print(f"WS Command parse error: {e}")
    except WebSocketDisconnect:
        active_connections.discard(websocket)
    except Exception as e:
        print(f"WS Exception: {e}")
        active_connections.discard(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)