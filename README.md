# AegisPay AI - Autonomous National Payment Infrastructure Control Center

A high-performance, scroll-driven 3D AI control center for mission-critical payment infrastructure (UPI, IMPS, Cards, NetBanking), built with **React Three Fiber**, **Three.js**, **GSAP**, **Framer Motion**, **FastAPI**, and **LangGraph Multi-Agent Swarms**.

---

## 🚀 The 5-Stage Scroll-Driven Zoom Journey

1. **Stage 1: Sovereign Macro Grid (Hero)**
   - 3D geospatial particle grid across metropolitan corridors (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune).
   - High-throughput volumetric payment streams pulsing at 85,000+ national transactions/second.
   - Satellite orbital camera descent locking onto transaction `TXN_9842_HDFC_UPI`.

2. **Stage 2: Payment Network Topology (Microscopic Zoom)**
   - Seamless camera dive into the single transaction packet anatomy.
   - Expansion into the payment mesh: **NPCI Central UPI Switch**, **Acquiring Gateways** (Razorpay, Cashfree), and **Core Banking Systems (CBS)** (HDFC Bank, SBI Finacle, ICICI, Axis).
   - *Deep Dive Component Feature*: Click on any node in 3D space to dive inside its microservice architecture, HikariCP connection pool, and thread dump!

3. **Stage 3: Incident Explosion & Latency Shockwave**
   - High-severity P0 failure strikes `HDFC_CBS_01`: HikariCP connection pool exhaustion & deadlock (300/300 connections locked on ledger settlement shard #4).
   - Node turns intense crimson (`#EF4444`) with violent shockwave rings.
   - Latency spikes from 24ms to 1,840ms; national UPI success rate drops from 99.98% to 71.2%.

4. **Stage 4: LangGraph Autonomous Swarm Cockpit**
   - The 3D holographic LangGraph DAG floats into focus with active step transitions:
     - 🔍 **Anomaly Detector**: Identifies Z-score spike (+5.82σ) exceeding threshold.
     - 📊 **SQL Analyst Agent**: Dynamically executes queries on the SQLite/PostgreSQL telemetry database to isolate failing transaction patterns.
     - 🧠 **RCA Reasoner**: Correlates logs and diagnoses mutex lock contention.
     - 🛡️ **Mitigation Planner**: Formulates adaptive circuit-breaker trips and traffic redistribution.
     - ⚡ **Execution Engine**: Tripping `ACT_HDFC_CBS_01_CIRCUIT_TRIP` and reallocating 95% volume across ICICI and Axis standbys.
   - Interactive chat terminal allowing real-time Q&A with the agent.

5. **Stage 5: Fluid Resolution & Self-Healing**
   - Luminous emerald green traffic beams dynamically veer away from the crimson switch toward healthy standby cores.
   - Degraded node flushes queues and enters self-healing recovery.
   - Fluid SVG/Canvas Success Rate graph heals itself back to 99.99% with celebratory confetti.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`) + GSAP ScrollTrigger + Framer Motion + Tailwind CSS v4 + Lucide Icons + Canvas Confetti
- **Backend**: FastAPI + Async Event Bus (simulating Kafka pub/sub) + In-memory Redis state cache + SQLite Telemetry Store
- **AI**: LangGraph-style autonomous agent pipeline + Anomaly Detection (Z-score sliding window) + Dynamic SQL query tools

---

## 🏁 Quickstart

### 1. Backend (FastAPI + AI Engine)
```bash
cd aegis-pay-ai
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- WebSocket Telemetry: `ws://127.0.0.1:8000/ws/telemetry`

### 2. Frontend (React Three Fiber + GSAP Scrollytelling)
```bash
cd aegis-pay-ai/frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🎮 Interactive Features
- **Scroll Scrubber**: Click any of the 6 milestone pills at the bottom to jump directly to any stage.
- **Inside Component Inspection**: Click on any node in 3D to zoom directly inside its internal architecture.
- **Chaos Lab**: Click the "Chaos Lab" button in the top navigation bar to inject real-time failures into any banking core.
- **Interactive AI Chat**: Ask the LangGraph agent questions directly from the reasoning cockpit.