import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IndiaMacroGridProps {
  scrollProgress: number;
}

const METRO_HUBS = [
  { name: "Mumbai (NPCI / RBI / BKC)", pos: [-5, 0, 1] },
  { name: "Bengaluru (FinTech Corridor)", pos: [-3, -4, 4] },
  { name: "Delhi NCR (Northern Switch)", pos: [-1, 7, -2] },
  { name: "Hyderabad (Finacle DR)", pos: [-1, -2, 2] },
  { name: "Chennai (Southern Switch)", pos: [-2, -6, 5] },
  { name: "Kolkata (Eastern Clearing)", pos: [5, 3, 0] },
  { name: "Pune (Data Center Ring)", pos: [-4, -1, 2] }
];

export function IndiaMacroGrid({ scrollProgress }: IndiaMacroGridProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const arcsGroupRef = useRef<THREE.Group>(null);

  const opacity = Math.max(0, 1 - (scrollProgress - 0.15) / 0.25);
  const visible = opacity > 0.01;

  const particleCount = 1200;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const c1 = new THREE.Color("#06b6d4");
    const c2 = new THREE.Color("#3b82f6");
    const c3 = new THREE.Color("#10b981");

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.6) * 14;
      const x = Math.cos(theta) * r * 0.9;
      const y = (Math.sin(theta) * r * 1.3) + (Math.random() * 2 - 1);
      const z = (Math.random() - 0.5) * 4;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const chosen = Math.random() > 0.6 ? c1 : Math.random() > 0.3 ? c2 : c3;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return { positions: pos, colors: col };
  }, []);

  const arcCurves = useMemo(() => {
    const curves = [];
    for (let i = 0; i < METRO_HUBS.length; i++) {
      for (let j = i + 1; j < METRO_HUBS.length; j++) {
        const p1 = new THREE.Vector3(...METRO_HUBS[i].pos);
        const p2 = new THREE.Vector3(...METRO_HUBS[j].pos);
        const mid = p1.clone().lerp(p2, 0.5);
        mid.z += p1.distanceTo(p2) * 0.35 + 1.2;

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const pts = curve.getPoints(36);
        curves.push(pts);
      }
    }
    return curves;
  }, []);

  useFrame(({ clock }) => {
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.z = Math.sin(t * 0.1) * 0.02;
    }
  });

  if (!visible) return null;

  return (
    <group ref={arcsGroupRef}>
      <gridHelper
        args={[36, 24, "#0284c7", "#0f172a"]}
        position={[0, -8, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={opacity * 0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {METRO_HUBS.map((hub, idx) => (
        <group key={idx} position={new THREE.Vector3(...hub.pos)}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={opacity} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.4, 0.55, 24]} />
            <meshBasicMaterial
              color="#06b6d4"
              side={THREE.DoubleSide}
              transparent
              opacity={opacity * 0.6}
            />
          </mesh>
        </group>
      ))}

      {arcCurves.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={i % 2 === 0 ? "#06b6d4" : "#3b82f6"}
            transparent
            opacity={opacity * 0.45}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}