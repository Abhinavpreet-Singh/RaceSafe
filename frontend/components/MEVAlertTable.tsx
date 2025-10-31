import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MEVAlert {
  hash: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  attackType: 'sandwich' | 'frontrun' | 'backrun' | 'arbitrage' | 'liquidation';
  victimTx?: string;
  attackerAddress: string;
  estimatedProfit: string;
  timestamp: number;
  blockNumber?: number;
  gasPrice: string;
  details: {
    targetContract?: string;
    tokenIn?: string;
    tokenOut?: string;
    amountIn?: string;
    amountOut?: string;
  };
}


interface Props {
  alerts: MEVAlert[];
  maxDisplay?: number;
}

const TransactionDetailsModal: React.FC<{ transaction: MEVAlert; onClose: () => void }> = ({ transaction, onClose }) => {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-gray-900 text-white rounded-lg p-6 max-w-lg w-full z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transaction Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">Close</button>
        </div>
        <div className="text-sm space-y-2">
          <div><strong>Hash:</strong> <code className="font-mono text-xs">{transaction.hash}</code></div>
          <div><strong>Type:</strong> {transaction.attackType}</div>
          <div><strong>Severity:</strong> {transaction.severity}</div>
          <div><strong>Attacker:</strong> <code className="font-mono text-xs">{transaction.attackerAddress}</code></div>
          <div><strong>Estimated Profit:</strong> {transaction.estimatedProfit} ETH</div>
          <div><strong>Timestamp:</strong> {new Date(transaction.timestamp).toLocaleString()}</div>
          {transaction.details && (
            <div className="pt-2">
              <strong>Details</strong>
              <div className="text-xs font-mono">
                {transaction.details.targetContract && <div>Contract: {transaction.details.targetContract}</div>}
                {transaction.details.tokenIn && <div>Token In: {transaction.details.tokenIn}</div>}
                {transaction.details.tokenOut && <div>Token Out: {transaction.details.tokenOut}</div>}
                {transaction.details.amountIn && <div>Amount In: {transaction.details.amountIn}</div>}
                {transaction.details.amountOut && <div>Amount Out: {transaction.details.amountOut}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MEVAlertTable({ alerts, maxDisplay = 50 }: Props) {
  const [selectedTx, setSelectedTx] = useState<MEVAlert | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'profit' | 'severity'>('time');

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.attackType === filterType);
    }

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(a => a.severity === filterSeverity);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'profit') {
        return parseFloat(b.estimatedProfit) - parseFloat(a.estimatedProfit);
      } else if (sortBy === 'severity') {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return 0;
    });

    return filtered.slice(0, maxDisplay);
  }, [alerts, filterType, filterSeverity, sortBy, maxDisplay]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getAttackTypeIcon = (type: string) => {
    switch (type) {
      case 'sandwich': return '🥪';
      case 'frontrun': return '🏃';
      case 'backrun': return '🚶';
      case 'arbitrage': return '💱';
      case 'liquidation': return '💧';
      default: return '⚠️';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🚨</span>
            MEV Attack Feed
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Real-time detection of malicious transactions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-mono">
            {filteredAlerts.length} alerts
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {/* Attack Type Filter */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
          >
            <option value="all">All Types</option>
            <option value="sandwich">🥪 Sandwich</option>
            <option value="frontrun">🏃 Frontrun</option>
            <option value="backrun">🚶 Backrun</option>
            <option value="arbitrage">💱 Arbitrage</option>
            <option value="liquidation">💧 Liquidation</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
          >
            <option value="time">⏰ Recent First</option>
            <option value="profit">💰 Highest Profit</option>
            <option value="severity">🚨 Most Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left py-3 px-2">Type</th>
              <th className="text-left py-3 px-2">Severity</th>
              <th className="text-left py-3 px-2">Transaction</th>
              <th className="text-left py-3 px-2">Attacker</th>
              <th className="text-left py-3 px-2">Profit</th>
              <th className="text-left py-3 px-2">Time</th>
              <th className="text-left py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No MEV attacks detected yet
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert, index) => (
                  <motion.tr
                    key={alert.hash}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTx(alert)}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getAttackTypeIcon(alert.attackType)}</span>
                        <span className="text-white font-medium capitalize">
                          {alert.attackType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <code className="text-blue-400 font-mono text-xs">
                        {truncateHash(alert.hash)}
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      <code className="text-purple-400 font-mono text-xs">
                        {truncateHash(alert.attackerAddress)}
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-green-400 font-semibold">
                        {parseFloat(alert.estimatedProfit) > 0 
                          ? `+${parseFloat(alert.estimatedProfit).toFixed(4)} ETH`
                          : '~'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400">
                      {formatTimeAgo(alert.timestamp)}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(alert);
                        }}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm text-gray-400">
        <div>
          Showing {filteredAlerts.length} of {alerts.length} total attacks
        </div>
        <div>
          Total Profit Extracted: {
            filteredAlerts.reduce((sum, a) => sum + parseFloat(a.estimatedProfit || '0'), 0).toFixed(4)
          } ETH
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTx && (
          <TransactionDetailsModal
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
