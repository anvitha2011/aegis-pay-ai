import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { NodeComponentData } from "../../types/telemetry";

interface PaymentTopologyProps {
  nodes: NodeComponentData[];
  scrollProgress: number;
  incidentActive: boolean;
  degradedNodeId: string | null;
  mitigated: boolean;
  onSelectNode: (node: NodeComponentData) => void;
}

export function PaymentTopology({
  nodes,
  scrollProgress,
  incidentActive,
  degradedNodeId,
  mitigated,
  onSelectNode
}: PaymentTopologyProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  const opacity = Math.min(Math.max((scrollProgress - 0.28) / 0.12, 0), 1);

  const links = [
    { from: "NPCI_UPI_SWITCH", to: "HDFC_CBS_01" },
    { from: "NPCI_UPI_SWITCH", to: "SBI_CORE_02" },
    { from: "NPCI_UPI_SWITCH", to: "ICICI_CBS_01" },
    { from: "NPCI_UPI_SWITCH", to: "AXIS_CBS_01" },
    { from: "RAZORPAY_GW", to: "NPCI_UPI_SWITCH" },
    { from: "CASHFREE_GW", to: "NPCI_UPI_SWITCH" },
    { from: "RUPAY_TOKEN_SWITCH", to: "NPCI_UPI_SWITCH" }
  ];

  useFrame(({ clock }) => {
    if (groupRef.current && opacity > 0) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={groupRef}>
      {links.map((link, idx) => {
        const fromNode = nodes.find((n) => n.id === link.from);
        const toNode = nodes.find((n) => n.id === link.to);
        if (!fromNode || !toNode) return null;

        const isDegradedLink =
          incidentActive &&
          !mitigated &&
          (fromNode.id === degradedNodeId || toNode.id === degradedNodeId);

        const isReroutedLink =
          mitigated &&
          (toNode.id === "ICICI_CBS_01" || toNode.id === "AXIS_CBS_01");

        const p1 = new THREE.Vector3(...fromNode.position);
        const p2 = new THREE.Vector3(...toNode.position);

        let lineColor = "#06b6d4";
        if (isDegradedLink) lineColor = "#ef4444";
        else if (isReroutedLink) lineColor = "#10b981";

        return (
          <group key={idx}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([...fromNode.position, ...toNode.position]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={lineColor}
                transparent
                opacity={opacity * (isDegradedLink ? 0.95 : 0.65)}
              />
            </line>

            <FlowingPulse
              start={p1}
              end={p2}
              color={lineColor}
              speed={isDegradedLink ? 0.2 : isReroutedLink ? 1.6 : 0.9}
              opacity={opacity}
            />
          </group>
        );
      })}

      {nodes.map((node) => {
        const isDegraded = incidentActive && node.id === degradedNodeId;
        const isHovered = hoveredNodeId === node.id;
        const nodeColor = isDegraded
          ? "#ef4444"
          : mitigated && (node.id === "ICICI_CBS_01" || node.id === "AXIS_CBS_01")
          ? "#10b981"
          : node.color;

        return (
          <group
            key={node.id}
            position={new THREE.Vector3(...node.position)}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNodeId(node.id);
            }}
            onPointerOut={() => setHoveredNodeId(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node);
            }}
          >
            <mesh scale={isHovered ? 1.25 : 1.0}>
              <icosahedronGeometry args={[0.9, 1]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isDegraded ? 2.5 : isHovered ? 1.5 : 0.6}
                wireframe
                transparent
                opacity={opacity * 0.8}
              />
            </mesh>

            <mesh scale={isHovered ? 1.15 : 1.0}>
              <sphereGeometry args={[0.55, 24, 24]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isDegraded ? 2.0 : 0.8}
                roughness={0.2}
                metalness={0.9}
                transparent
                opacity={opacity}
              />
            </mesh>

            <pointLight
              color={nodeColor}
              intensity={isDegraded ? 4.0 : 1.2}
              distance={8}
            />

            <Html position={[0, -1.2, 0]} center distanceFactor={14}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                className={`cursor-pointer transition-all duration-200 select-none whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 shadow-lg ${
                  isDegraded
                    ? "cyber-glass-crimson text-red-200 animate-pulse border-red-500 scale-105"
                    : isHovered
                    ? "cyber-glass border-cyan-400 text-cyan-200 scale-110"
                    : "cyber-glass text-slate-300 border-cyan-500/30"
                }`}
                style={{ opacity }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isDegraded ? "#ef4444" : isHovered ? "#38bdf8" : nodeColor
                  }}
                />
                <span className="font-semibold">{node.name}</span>
                {isDegraded && (
                  <span className="text-[9px] bg-red-600/80 px-1 rounded text-white font-bold animate-bounce">
                    504 TIMEOUT
                  </span>
                )}
                {isHovered && !isDegraded && (
                  <span className="text-[9px] text-cyan-300 underline">
                    CLICK TO DIVE INSIDE
                  </span>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function FlowingPulse({
  start,
  end,
  color,
  speed,
  opacity
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  speed: number;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = (clock.getElapsedTime() * speed) % 1;
    meshRef.current.position.lerpVectors(start, end, t);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity * 0.9} />
    </mesh>
  );
}