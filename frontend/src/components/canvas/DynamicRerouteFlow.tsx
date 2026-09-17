import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DynamicRerouteFlowProps {
  mitigated: boolean;
  scrollProgress: number;
}

export function DynamicRerouteFlow({ mitigated, scrollProgress }: DynamicRerouteFlowProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const shouldRender = mitigated || scrollProgress >= 0.85;
  const opacity = shouldRender ? Math.min(Math.max((scrollProgress - 0.80) / 0.12, 0.4), 1) : 0;

  const particleCount = 400;
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const targetSide = Math.random() > 0.5 ? -1 : 1;
      const progress = Math.random();

      pos[i * 3] = progress * targetSide * 8;
      pos[i * 3 + 1] = progress * -3 + Math.sin(progress * Math.PI) * 1.5;
      pos[i * 3 + 2] = progress * -3;

      vel[i * 3] = targetSide * (0.04 + Math.random() * 0.03);
      vel[i * 3 + 1] = -0.015;
      vel[i * 3 + 2] = -0.015;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!shouldRender || !pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      array[i * 3] += velocities[i * 3];
      array[i * 3 + 1] += velocities[i * 3 + 1];
      array[i * 3 + 2] += velocities[i * 3 + 2];

      if (Math.abs(array[i * 3]) > 9) {
        array[i * 3] = 0;
        array[i * 3 + 1] = 0;
        array[i * 3 + 2] = 0;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (!shouldRender) return null;

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color="#10b981"
          transparent
          opacity={opacity * 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh position={[-8, -3, -3]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial
          color="#10b981"
          side={THREE.DoubleSide}
          transparent
          opacity={opacity * 0.7}
        />
      </mesh>

      <mesh position={[8, -3, -3]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial
          color="#10b981"
          side={THREE.DoubleSide}
          transparent
          opacity={opacity * 0.7}
        />
      </mesh>
    </group>
  );
}