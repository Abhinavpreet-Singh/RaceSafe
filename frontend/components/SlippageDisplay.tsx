import React from 'react';
import { motion } from 'framer-motion';

interface SlippageData {
  percentage: number;
  ethLoss: string;
  usdLoss: string;
  isSafe: boolean;
  recommendation: string;
}

interface Props {
  slippage: SlippageData;
  className?: string;
}

export default function SlippageDisplay({ slippage, className = '' }: Props) {
  const getSeverityLevel = (percentage: number) => {
    if (percentage >= 5) return 'critical';
    if (percentage >= 3) return 'high';
    if (percentage >= 1) return 'medium';
    if (percentage >= 0.5) return 'low';
    return 'safe';
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-500',
        glow: 'shadow-red-500/20'
      };
      case 'high': return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-500',
        glow: 'shadow-orange-500/20'
      };
      case 'medium': return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-500',
        glow: 'shadow-yellow-500/20'
      };
      case 'low': return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-500',
        glow: 'shadow-blue-500/20'
      };
      default: return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-500',
        glow: 'shadow-green-500/20'
      };
    }
  };

  const getSeverityEmoji = (level: string) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '✅';
    }
  };

  const severity = getSeverityLevel(slippage.percentage);
  const colors = getSeverityColor(severity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${colors.bg} border ${colors.border} rounded-lg p-6 shadow-lg ${colors.glow} ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">{getSeverityEmoji(severity)}</span>
            Slippage Analysis
          </h3>
          <p className={`text-sm mt-1 ${colors.text} font-semibold`}>
            {severity.toUpperCase()} RISK
          </p>
        </div>
        
        {/* Percentage Badge */}
        <div className={`${colors.bg} border ${colors.border} rounded-full px-4 py-2`}>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {slippage.percentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Loss Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/50 rounded p-3">
          <label className="text-gray-400 text-xs block mb-1">ETH Loss</label>
          <p className="text-white text-xl font-bold font-mono">
            {parseFloat(slippage.ethLoss).toFixed(4)} ETH
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded p-3">
          <label className="text-gray-400 text-xs block mb-1">USD Loss</label>
          <p className="text-white text-xl font-bold font-mono">
            ${parseFloat(slippage.usdLoss).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Safety Indicator */}
      <div className={`mb-4 p-3 rounded ${slippage.isSafe ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
        <p className={`text-sm font-semibold ${slippage.isSafe ? 'text-green-400' : 'text-red-400'}`}>
          {slippage.isSafe ? '✓ Safe to proceed' : '✗ Not recommended to proceed'}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-gray-900/50 rounded p-4">
        <label className="text-gray-400 text-xs block mb-2">Recommendation</label>
        <p className="text-white text-sm leading-relaxed">
          {slippage.recommendation}
        </p>
      </div>

      {/* Slippage Tolerance Guide */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs mb-2">Recommended Slippage Tolerance:</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Stablecoins:</span>
            <span className="text-green-400">0.1% - 0.5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Major Pairs:</span>
            <span className="text-yellow-400">0.5% - 1.0%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Volatile Tokens:</span>
            <span className="text-orange-400">1.0% - 3.0%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">🚨 High Risk:</span>
            <span className="text-red-400">&gt; 3.0%</span>
          </div>
        </div>
      </div>

      {/* Visual Gauge */}
      <div className="mt-4">
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(slippage.percentage * 10, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${
              severity === 'critical' ? 'bg-red-500' :
              severity === 'high' ? 'bg-orange-500' :
              severity === 'medium' ? 'bg-yellow-500' :
              severity === 'low' ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{
              boxShadow: `0 0 10px ${
                severity === 'critical' ? '#ef4444' :
                severity === 'high' ? '#f97316' :
                severity === 'medium' ? '#eab308' :
                severity === 'low' ? '#3b82f6' :
                '#22c55e'
              }`
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-green-500 text-xs">0%</span>
          <span className="text-yellow-500 text-xs">5%</span>
          <span className="text-red-500 text-xs">10%+</span>
        </div>
      </div>
    </motion.div>
  );
}
