import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { AgentReasoningStep } from "../../types/telemetry";

interface LangGraphVisualizerProps {
  scrollProgress: number;
  reasoningSteps: AgentReasoningStep[];
}

const DAG_NODES = [
  { id: "ANOMALY_DETECTION", label: "1. Anomaly Watcher", pos: [-4, 0, 0], color: "#ef4444" },
  { id: "SQL_INVESTIGATION", label: "2. SQL Tool Analyst", pos: [-2, 1.4, 0], color: "#f59e0b" },
  { id: "ROOT_CAUSE_SYNTHESIS", label: "3. RCA Reasoner", pos: [0, -0.4, 0], color: "#8b5cf6" },
  { id: "MITIGATION_POLICY_PROPOSAL", label: "4. Circuit Breaker", pos: [2, 1.4, 0], color: "#38bdf8" },
  { id: "AUTONOMOUS_ENFORCEMENT", label: "5. Auto-Healer", pos: [4, 0, 0], color: "#10b981" }
];

export function LangGraphVisualizer({ scrollProgress, reasoningSteps }: LangGraphVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null);

  const opacity = Math.min(Math.max((scrollProgress - 0.62) / 0.12, 0), 1);
  const activeStepSet = new Set(reasoningSteps.map((s) => s.step));

  useFrame(({ clock }) => {
    if (groupRef.current && opacity > 0) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = 7.5 + Math.sin(t * 0.8) * 0.12;
    }
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={groupRef} position={[0, 7.5, -4]}>
      <Html position={[0, 2.8, 0]} center distanceFactor={16}>
        <div
          className="cyber-glass px-3 py-1 rounded-full border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-xl backdrop-blur-md"
          style={{ opacity }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          LangGraph Multi-Agent Orchestrator DAG
        </div>
      </Html>

      {DAG_NODES.slice(0, -1).map((node, i) => {
        const nextNode = DAG_NODES[i + 1];
        const isPathActive = activeStepSet.has(node.id as any);

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([...node.pos, ...nextNode.pos]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={isPathActive ? "#38bdf8" : "#334155"}
              transparent
              opacity={opacity * (isPathActive ? 0.9 : 0.3)}
            />
          </line>
        );
      })}

      {DAG_NODES.map((node) => {
        const isActive = activeStepSet.has(node.id as any);
        const nodeColor = isActive ? node.color : "#475569";

        return (
          <group key={node.id} position={new THREE.Vector3(...node.pos)}>
            <mesh>
              <torusGeometry args={[0.42, 0.03, 16, 32]} />
              <meshBasicMaterial
                color={nodeColor}
                transparent
                opacity={opacity * (isActive ? 1.0 : 0.4)}
              />
            </mesh>

            <mesh>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isActive ? 1.8 : 0.2}
                transparent
                opacity={opacity}
              />
            </mesh>

            <Html position={[0, -0.7, 0]} center distanceFactor={14}>
              <div
                className={`select-none px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-black/80 border border-cyan-400 text-cyan-300 shadow-md font-bold scale-105"
                    : "bg-black/50 border border-slate-700 text-slate-400"
                }`}
                style={{ opacity }}
              >
                {node.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}