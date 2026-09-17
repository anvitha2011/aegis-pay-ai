import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraRigProps {
  scrollProgress: number;
  inspectNodePosition: [number, number, number] | null;
  freeFlight: boolean;
}

export function CameraRig({ scrollProgress, inspectNodePosition, freeFlight }: CameraRigProps) {
  const { camera } = useThree();
  const targetPosRef = useRef(new THREE.Vector3(0, 16, 28));
  const targetLookRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (freeFlight) return;

    if (inspectNodePosition) {
      // Deep dive inside selected component
      targetPosRef.current.set(
        inspectNodePosition[0],
        inspectNodePosition[1] + 1.0,
        inspectNodePosition[2] + 4.2
      );
      targetLookRef.current.set(
        inspectNodePosition[0],
        inspectNodePosition[1],
        inspectNodePosition[2]
      );
    } else {
      const p = Math.min(Math.max(scrollProgress, 0), 1);

      if (p <= 0.22) {
        // Stage 1: Plunge from India Macro Grid into the single transaction packet at [0, 1.2, 2.8]
        const t = p / 0.22;
        targetPosRef.current.lerpVectors(
          new THREE.Vector3(0, 18, 30),
          new THREE.Vector3(0, 1.8, 5.4),
          t
        );
        targetLookRef.current.lerpVectors(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 1.2, 2.8),
          t
        );
      } else if (p <= 0.45) {
        // Stage 2: Transaction packet blossoms open into Payment Network Topology
        const t = (p - 0.22) / 0.23;
        targetPosRef.current.lerpVectors(
          new THREE.Vector3(0, 1.8, 5.4),
          new THREE.Vector3(0, 4.0, 16.5),
          t
        );
        targetLookRef.current.lerpVectors(
          new THREE.Vector3(0, 1.2, 2.8),
          new THREE.Vector3(0, 0, 0),
          t
        );
      } else if (p <= 0.68) {
        // Stage 3: Incident Explosion - Camera plunges right into the failing HDFC CBS switch [-6, 3, -4]
        const t = (p - 0.45) / 0.23;
        targetPosRef.current.lerpVectors(
          new THREE.Vector3(0, 4.0, 16.5),
          new THREE.Vector3(-4.0, 3.4, 0.5),
          t
        );
        targetLookRef.current.lerpVectors(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-6, 3, -4),
          t
        );
      } else if (p <= 0.85) {
        // Stage 4: LangGraph AI Agent Nerve Center [0, 7.5, -4]
        const t = (p - 0.68) / 0.17;
        targetPosRef.current.lerpVectors(
          new THREE.Vector3(-4.0, 3.4, 0.5),
          new THREE.Vector3(0, 7.8, 3.2),
          t
        );
        targetLookRef.current.lerpVectors(
          new THREE.Vector3(-6, 3, -4),
          new THREE.Vector3(0, 7.5, -4),
          t
        );
      } else {
        // Stage 5: Resolution & Restored Equilibrium - Pull back to show dynamic reroute streams
        const t = (p - 0.85) / 0.15;
        targetPosRef.current.lerpVectors(
          new THREE.Vector3(0, 7.8, 3.2),
          new THREE.Vector3(0, 6.0, 18.0),
          t
        );
        targetLookRef.current.lerpVectors(
          new THREE.Vector3(0, 7.5, -4),
          new THREE.Vector3(0, 0, 0),
          t
        );
      }
    }

    // Buttery frame-rate independent exponential decay
    const damp = 1 - Math.exp(-6.0 * delta);
    camera.position.lerp(targetPosRef.current, damp);

    // Smooth rock-solid lookAt interpolation
    currentLookAtRef.current.lerp(targetLookRef.current, damp);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}