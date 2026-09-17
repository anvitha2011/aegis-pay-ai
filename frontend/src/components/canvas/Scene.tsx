import { Canvas } from "@react-three/fiber";
import { IndiaMacroGrid } from "./IndiaMacroGrid";
import { SingleTxnParticle } from "./SingleTxnParticle";
import { PaymentTopology } from "./PaymentTopology";
import { IncidentShockwave } from "./IncidentShockwave";
import { LangGraphVisualizer } from "./LangGraphVisualizer";
import { DynamicRerouteFlow } from "./DynamicRerouteFlow";
import { CameraRig } from "./CameraRig";
import { NodeComponentData, TelemetryFrame, AgentReasoningStep } from "../../types/telemetry";

interface SceneProps {
  scrollProgress: number;
  telemetry: TelemetryFrame;
  nodes: NodeComponentData[];
  reasoningSteps: AgentReasoningStep[];
  selectedNode: NodeComponentData | null;
  onSelectNode: (node: NodeComponentData | null) => void;
  freeFlight: boolean;
}

export function Scene({
  scrollProgress,
  telemetry,
  nodes,
  reasoningSteps,
  selectedNode,
  onSelectNode,
  freeFlight
}: SceneProps) {
  return (
    <div className="fixed inset-0 pointer-events-auto z-0">
      <Canvas
        camera={{ position: [0, 24, 38], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#030712"]} />
        <fog attach="fog" args={["#030712", 20, 65]} />

        {/* Ambient & Scene Lights */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 20, 15]} intensity={1.2} />
        <pointLight position={[0, -5, 10]} intensity={0.8} color="#06b6d4" />

        {/* Camera Trajectory Rig */}
        <CameraRig
          scrollProgress={scrollProgress}
          inspectNodePosition={selectedNode ? selectedNode.position : null}
          freeFlight={freeFlight}
        />

        {/* Stage 1: India Macro Grid */}
        <IndiaMacroGrid scrollProgress={scrollProgress} />

        {/* Stage 1 -> 2 Bridge: Single Transaction Focus */}
        <SingleTxnParticle
          scrollProgress={scrollProgress}
          latestTransaction={telemetry.latest_transaction}
        />

        {/* Stage 2 & 3: Payment Network Topology & Banks */}
        <PaymentTopology
          nodes={nodes}
          scrollProgress={scrollProgress}
          incidentActive={telemetry.incident_active}
          degradedNodeId={telemetry.degraded_node}
          mitigated={telemetry.mitigated}
          onSelectNode={onSelectNode}
        />

        {/* Stage 3: Incident Latency Shockwave */}
        <IncidentShockwave
          active={telemetry.incident_active}
          mitigated={telemetry.mitigated}
        />

        {/* Stage 4: LangGraph Autonomous AI Swarm DAG */}
        <LangGraphVisualizer
          scrollProgress={scrollProgress}
          reasoningSteps={reasoningSteps}
        />

        {/* Stage 5: Dynamic Traffic Rerouting Beams */}
        <DynamicRerouteFlow
          mitigated={telemetry.mitigated}
          scrollProgress={scrollProgress}
        />
      </Canvas>
    </div>
  );
}