import { motion } from 'framer-motion';

/**
 * Lightweight overlay that simulates a "mist" using a radial gradient and
 * animates only opacity to stay GPU-friendly on Safari.
 */
export default function MistOverlay({ duration = 0.48 }: { duration?: number }) {
  return (
    <motion.div
      aria-hidden
      className="mist-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration, ease: 'easeInOut' }}
    />
  );
}
