import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  score: number;
}

export default function RiskGauge({ score }: Props) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (score: number) => {
    if (score >= 80) return '#E10600'; // Red
    if (score >= 50) return '#FF8C00'; // Orange
    return '#00FF00'; // Green
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 50) return 'ELEVATED';
    return 'SAFE';
  };

  const getGlow = (score: number) => {
    if (score >= 80) return '0 0 40px rgba(225, 6, 0, 0.8)';
    if (score >= 50) return '0 0 40px rgba(255, 140, 0, 0.6)';
    return '0 0 40px rgba(0, 255, 0, 0.6)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-morphism rounded-2xl p-6 f1-border-glow mb-6 relative overflow-hidden"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${getColor(displayScore)}, transparent)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold text-f1-red mb-6 flex items-center gap-2"
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            🎯
          </motion.span>
          Risk Gauge
        </motion.h2>

        <div className="relative w-full max-w-xs mx-auto mb-6">
          {/* Speedometer SVG */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Background arc */}
            <motion.path
              d="M 30 150 A 80 80 0 1 1 170 150"
              fill="none"
              stroke="#38383F"
              strokeWidth="20"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Risk arc with animation */}
            <motion.path
              d="M 30 150 A 80 80 0 1 1 170 150"
              fill="none"
              stroke={getColor(displayScore)}
              strokeWidth="20"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: displayScore / 100 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(${getGlow(displayScore)})`,
              }}
            />

            {/* Animated Needle */}
            <motion.g
              initial={{ rotate: -90 }}
              animate={{
                rotate: (displayScore / 100) * 180 - 90,
              }}
              transition={{ type: 'spring', stiffness: 60, damping: 10 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              <line
                x1="100"
                y1="100"
                x2="160"
                y2="100"
                stroke={getColor(displayScore)}
                strokeWidth="4"
                strokeLinecap="round"
                filter={`drop-shadow(0 0 10px ${getColor(displayScore)})`}
              />
              <circle
                cx="100"
                cy="100"
                r="8"
                fill={getColor(displayScore)}
                filter={`drop-shadow(0 0 15px ${getColor(displayScore)})`}
              />
            </motion.g>
          </svg>

          {/* Score Display in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              key={displayScore}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-7xl font-bold font-mono"
              style={{
                color: getColor(displayScore),
                textShadow: getGlow(displayScore),
              }}
            >
              {displayScore}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-f1-silver mt-2 font-bold tracking-wider"
            >
              {getLabel(displayScore)}
            </motion.div>
          </div>
        </div>

        {/* Legend with Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 text-sm font-mono"
        >
          <div className="flex justify-between items-center p-2 rounded bg-f1-black/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-f1-silver">0-49:</span>
            </div>
            <span className="text-green-500 font-bold">SAFE</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-f1-black/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-f1-silver">50-79:</span>
            </div>
            <span className="text-orange-500 font-bold">ELEVATED</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-f1-black/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-f1-red animate-pulse" />
              <span className="text-f1-silver">80-100:</span>
            </div>
            <span className="text-f1-red font-bold">CRITICAL</span>
          </div>
        </motion.div>

        {/* Warning Indicator */}
        {displayScore >= 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-f1-red/20 border-2 border-f1-red rounded-lg"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-2xl"
              >
                🚨
              </motion.span>
              <div>
                <p className="text-f1-red font-bold text-sm">HIGH RISK DETECTED</p>
                <p className="text-xs text-f1-silver">MEV attack likely in progress</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
