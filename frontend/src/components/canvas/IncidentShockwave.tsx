import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IncidentShockwaveProps {
  active: boolean;
  position?: [number, number, number];
  mitigated: boolean;
}

export function IncidentShockwave({
  active,
  position = [-6, 3, -4],
  mitigated
}: IncidentShockwaveProps) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime();

    // Pulse red point light
    if (lightRef.current) {
      lightRef.current.intensity = mitigated
        ? 1.5
        : 3.5 + Math.sin(t * 12) * 2.0;
    }

    // Concentric expanding shockwave rings
    const rings = [ring1, ring2, ring3];
    rings.forEach((r, idx) => {
      if (r.current) {
        const offset = idx * 0.4;
        const progress = ((t * 0.8 + offset) % 1.2) / 1.2;
        const scale = 0.6 + progress * 6.0;
        r.current.scale.set(scale, scale, scale);

        const mat = r.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1 - progress) * (mitigated ? 0.2 : 0.85));
      }
    });
  });

  if (!active) return null;

  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Violent Red Point Light */}
      <pointLight ref={lightRef} color="#ef4444" distance={18} />

      {/* 3 Radiating Concentric Shockwave Rings */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial
          color="#ef4444"
          side={THREE.DoubleSide}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring2} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial
          color="#f43f5e"
          side={THREE.DoubleSide}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring3} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial
          color="#dc2626"
          side={THREE.DoubleSide}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}