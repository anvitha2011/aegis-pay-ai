import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Transaction } from "../../types/telemetry";

interface SingleTxnParticleProps {
  scrollProgress: number;
  latestTransaction?: Transaction;
}

export function SingleTxnParticle({ scrollProgress, latestTransaction }: SingleTxnParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  // Active during stages 0.12 -> 0.48
  let opacity = 0;
  if (scrollProgress >= 0.12 && scrollProgress <= 0.48) {
    if (scrollProgress < 0.22) {
      opacity = (scrollProgress - 0.12) / 0.10;
    } else if (scrollProgress > 0.40) {
      opacity = 1 - (scrollProgress - 0.40) / 0.08;
    } else {
      opacity = 1.0;
    }
  }

  useFrame(({ clock }) => {
    if (opacity <= 0.01) return;
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(t * 2) * 0.15;
      meshRef.current.rotation.y = t * 1.5;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 2.0;
      ringRef1.current.rotation.y = t * 1.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -t * 1.8;
      ringRef2.current.rotation.z = t * 1.5;
    }
  });

  if (opacity <= 0.01) return null;

  return (
    <group position={[0, 1.2, 2.8]}>
      {/* Central Luminous Quantum Transaction Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Orbiting Quantum Token Gyro Rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[0.75, 0.025, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={opacity * 0.9} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[0.95, 0.02, 16, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={opacity * 0.75} />
      </mesh>

      {/* Glowing Point Light Illuminating Scene */}
      <pointLight color="#38bdf8" intensity={opacity * 2.5} distance={10} />

      {/* Holographic HUD Overlay for the Focused Transaction */}
      {scrollProgress >= 0.20 && scrollProgress <= 0.42 && (
        <Html position={[1.2, 0.8, 0]} center distanceFactor={8}>
          <div
            className="cyber-glass px-4 py-3 rounded-lg border border-cyan-400/40 text-xs w-64 shadow-2xl backdrop-blur-md transition-opacity duration-300"
            style={{ opacity }}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2">
              <span className="font-mono text-cyan-300 font-bold tracking-wider">
                {latestTransaction?.txn_id || "TXN_9842_HDFC_UPI"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {latestTransaction?.status || "EN_ROUTE"}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Value:</span>
                <span className="text-emerald-400 font-semibold">
                  ₹{latestTransaction?.amount?.toFixed(2) || "2,450.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payer VPA:</span>
                <span className="text-cyan-200 truncate max-w-[130px]">
                  {latestTransaction?.payer_vpa || "rohit@okhdfc"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payee VPA:</span>
                <span className="text-purple-300 truncate max-w-[130px]">
                  {latestTransaction?.payee_vpa || "swiggy@razorpay"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rail / Switch:</span>
                <span className="text-amber-300 font-semibold">
                  UPI 2.0 ➔ HDFC CBS
                </span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-cyan-400">
              <span>LATENCY: {latestTransaction?.latency_ms || 23.4}ms</span>
              <span className="animate-pulse text-emerald-400">● 100% VERIFIED</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}