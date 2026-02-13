import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function ProgressBar({
  value,
  max = 1,
  hasSparkle = false,
}: {
  value: number;
  max?: number;
  hasSparkle?: boolean;
}) {
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  const [sparkleKey, setSparkleKey] = useState(0);
  const [isSparkling, setIsSparkling] = useState(false);

  // Track previous value to detect increases
  const prevValue = useRef(value);
  // Block animation during initial hydration/mount
  const canAnimate = useRef(false);

  useEffect(() => {
    // Enable animation after a short delay (covers hydration/initial render stabilization)
    const t = setTimeout(() => {
      canAnimate.current = true;
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasSparkle) return;

    // Only animate if:
    // 1. We are past the initialization phase
    // 2. The value has increased (progress made)
    // 3. The value is different from before
    if (canAnimate.current && value > prevValue.current) {
      prevValue.current = value;
      // Batch state updates in a callback to avoid cascading renders
      Promise.resolve().then(() => {
        setSparkleKey((prev) => prev + 1);
        setIsSparkling(true);
      });
      const t = setTimeout(() => setIsSparkling(false), 1000);
      return () => clearTimeout(t);
    }

    // Always update previous value
    prevValue.current = value;
  }, [value, hasSparkle]);

  return (
    <div
      className="h-2 w-full rounded-full bg-progress-track relative"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-progress transition-[width] relative"
        style={{ width: `${pct}%`, transitionDuration: '500ms' }}
      >
        <AnimatePresence>
          {hasSparkle && isSparkling && pct > 0 && pct < 100 && <SparkleCluster key={sparkleKey} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SparkleCluster() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 pointer-events-none flex items-center justify-center">
      {/* Central Glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.5, 0], opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeOut' }}
        className="absolute w-6 h-6 rounded-full bg-accent blur-md"
      />

      {/* 4-Point Star Burst */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.3, 0], rotate: 45 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(var(--color-accent),0.8)] z-10"
      >
        <FourPointStar />
      </motion.div>

      {/* Satellite Sparkles */}
      <Satellite angle={0} delay={0} scale={0.6} dist={12} />
      <Satellite angle={120} delay={0.1} scale={0.4} dist={10} />
      <Satellite angle={240} delay={0.2} scale={0.5} dist={14} />
      <Satellite angle={60} delay={0.3} scale={0.3} dist={16} />
      <Satellite angle={300} delay={0.15} scale={0.5} dist={12} />
    </div>
  );
}

function Satellite({
  angle,
  delay,
  scale,
  dist,
}: {
  angle: number;
  delay: number;
  scale: number;
  dist: number;
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * dist;
  const y = Math.sin(rad) * dist;

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{
        x,
        y,
        scale: [0, scale, 0],
        opacity: [0, 1, 0],
      }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="absolute w-3 h-3 text-accent z-0"
    >
      <FourPointStar />
    </motion.div>
  );
}

function FourPointStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}
