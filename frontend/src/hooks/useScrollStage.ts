import { useState, useEffect, useCallback, useRef } from "react";
import type { ScrollStage } from "../types/telemetry";

export const STAGE_MILESTONES = [
  { stage: "HERO" as ScrollStage, name: "India Macro Grid", range: [0.0, 0.18], targetProgress: 0.05 },
  { stage: "TXN_ZOOM" as ScrollStage, name: "Single Txn Anatomy", range: [0.18, 0.38], targetProgress: 0.28 },
  { stage: "TOPOLOGY" as ScrollStage, name: "Payment Switch Network", range: [0.38, 0.55], targetProgress: 0.46 },
  { stage: "INCIDENT" as ScrollStage, name: "CBS Incident Explosion", range: [0.55, 0.72], targetProgress: 0.64 },
  { stage: "AI_SWARM" as ScrollStage, name: "LangGraph AI Cockpit", range: [0.72, 0.88], targetProgress: 0.80 },
  { stage: "RESOLUTION" as ScrollStage, name: "Self-Healing & Restoration", range: [0.88, 1.0], targetProgress: 0.96 }
];

export function useScrollStage() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<ScrollStage>("HERO");
  const [stageIndex, setStageIndex] = useState(0);
  const rafId = useRef<number | null>(null);

  const getScrollTop = () => {
    return (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  };

  const getMaxScroll = () => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollH = Math.max(
      doc ? doc.scrollHeight : 0,
      body ? body.scrollHeight : 0,
      window.innerHeight * 5.0
    );
    return Math.max(scrollH - window.innerHeight, 1);
  };

  const updateProgress = useCallback(() => {
    const scrollY = getScrollTop();
    const maxScroll = getMaxScroll();
    const rawProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    setProgress(rawProgress);

    const foundIndex = STAGE_MILESTONES.findIndex(
      (m) => rawProgress >= m.range[0] && rawProgress <= m.range[1]
    );
    if (foundIndex !== -1) {
      setStage(STAGE_MILESTONES[foundIndex].stage);
      setStageIndex(foundIndex);
    } else if (rawProgress >= 0.98) {
      setStage("RESOLUTION");
      setStageIndex(5);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        updateProgress();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial calculation
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [updateProgress]);

  const jumpToStage = useCallback((index: number) => {
    const target = STAGE_MILESTONES[index];
    if (!target) return;
    const maxScroll = getMaxScroll();
    const targetY = target.targetProgress * maxScroll;
    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });
  }, []);

  return {
    progress,
    stage,
    stageIndex,
    jumpToStage,
    milestones: STAGE_MILESTONES
  };
}