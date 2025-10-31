import React from 'react';
import { motion } from 'framer-motion';
import { MEVAlert } from './MEVAlertTable';

interface Props {
  transaction: MEVAlert;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getAttackTypeEmoji = (type: string) => {
    switch (type) {
      case 'sandwich': return '🥪';
      case 'frontrun': return '🏃';
      case 'backrun': return '🚶';
      case 'arbitrage': return '💱';
      case 'liquidation': return '💧';
      default: return '⚠️';
    }
  };

  const formatEtherscanLink = (hash: string) => {
    // Use Sepolia testnet for now
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  const formatAddressLink = (address: string) => {
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900 border-2 border-red-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">{getAttackTypeEmoji(transaction.attackType)}</span>
              {transaction.attackType.charAt(0).toUpperCase() + transaction.attackType.slice(1)} Attack
            </h2>
            <p className={`text-sm mt-1 font-semibold ${getSeverityColor(transaction.severity)}`}>
              {transaction.severity.toUpperCase()} SEVERITY
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Transaction Info */}
        <div className="space-y-4">
          {/* Transaction Hash */}
          <div className="bg-gray-800/50 rounded p-4">
            <label className="text-gray-400 text-sm block mb-2">Transaction Hash</label>
            <div className="flex items-center gap-2">
              <code className="text-blue-400 font-mono text-sm flex-1 overflow-x-auto">
                {transaction.hash}
              </code>
              <button
                onClick={() => copyToClipboard(transaction.hash)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
              >
                Copy
              </button>
              <a
                href={formatEtherscanLink(transaction.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs"
              >
                Etherscan ↗
              </a>
            </div>
          </div>

          {/* Attacker Address */}
          <div className="bg-gray-800/50 rounded p-4">
            <label className="text-gray-400 text-sm block mb-2">Attacker Address</label>
            <div className="flex items-center gap-2">
              <code className="text-purple-400 font-mono text-sm flex-1 overflow-x-auto">
                {transaction.attackerAddress}
              </code>
              <button
                onClick={() => copyToClipboard(transaction.attackerAddress)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
              >
                Copy
              </button>
              <a
                href={formatAddressLink(transaction.attackerAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs"
              >
                View ↗
              </a>
            </div>
          </div>

          {/* Victim Transaction (if exists) */}
          {transaction.victimTx && (
            <div className="bg-gray-800/50 rounded p-4">
              <label className="text-gray-400 text-sm block mb-2">Victim Transaction</label>
              <div className="flex items-center gap-2">
                <code className="text-orange-400 font-mono text-sm flex-1 overflow-x-auto">
                  {transaction.victimTx}
                </code>
                <button
                  onClick={() => copyToClipboard(transaction.victimTx!)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Financial Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <label className="text-green-400 text-sm block mb-1">Estimated Profit</label>
              <p className="text-2xl font-bold text-green-400">
                {parseFloat(transaction.estimatedProfit).toFixed(4)} ETH
              </p>
              <p className="text-xs text-green-400/60 mt-1">
                ≈ ${(parseFloat(transaction.estimatedProfit) * 2000).toFixed(2)} USD
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <label className="text-red-400 text-sm block mb-1">Gas Price</label>
              <p className="text-2xl font-bold text-red-400">
                {(parseFloat(transaction.gasPrice) / 1e9).toFixed(2)} Gwei
              </p>
              <p className="text-xs text-red-400/60 mt-1">
                {parseFloat(transaction.gasPrice) > 50e9 ? 'High' : 'Normal'} gas price
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-800/50 rounded p-4">
            <label className="text-gray-400 text-sm block mb-3">Attack Details</label>
            <div className="space-y-2 text-sm">
              {transaction.details.targetContract && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Contract:</span>
                  <code className="text-blue-400 font-mono text-xs">
                    {transaction.details.targetContract.slice(0, 10)}...
                    {transaction.details.targetContract.slice(-8)}
                  </code>
                </div>
              )}
              {transaction.details.tokenIn && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Token In:</span>
                  <code className="text-green-400 font-mono text-xs">
                    {transaction.details.tokenIn}
                  </code>
                </div>
              )}
              {transaction.details.tokenOut && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Out:</span>
                  <code className="text-green-400 font-mono text-xs">
                    {transaction.details.tokenOut}
                  </code>
                </div>
              )}
              {transaction.details.amountIn && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount In:</span>
                  <span className="text-white font-mono">
                    {transaction.details.amountIn}
                  </span>
                </div>
              )}
              {transaction.blockNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Block Number:</span>
                  <span className="text-white font-mono">
                    {transaction.blockNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white">
                  {new Date(transaction.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Attack Explanation */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
            <label className="text-yellow-400 text-sm font-semibold block mb-2">
              ⚠️ How This Attack Works
            </label>
            <p className="text-gray-300 text-sm">
              {transaction.attackType === 'sandwich' && (
                <>
                  A <strong>sandwich attack</strong> occurs when an attacker places a buy order before 
                  and a sell order after a victim's transaction, profiting from the price movement 
                  caused by the victim's trade. The attacker "sandwiches" the victim's transaction.
                </>
              )}
              {transaction.attackType === 'frontrun' && (
                <>
                  A <strong>frontrun attack</strong> occurs when an attacker sees a profitable 
                  transaction in the mempool and submits their own transaction with higher gas 
                  to execute first, stealing the opportunity.
                </>
              )}
              {transaction.attackType === 'backrun' && (
                <>
                  A <strong>backrun attack</strong> occurs when an attacker executes a transaction 
                  immediately after a victim's transaction to profit from price changes or state 
                  updates caused by the victim.
                </>
              )}
              {transaction.attackType === 'arbitrage' && (
                <>
                  An <strong>arbitrage attack</strong> exploits price differences between DEXs, 
                  often triggered by large trades that create temporary price imbalances.
                </>
              )}
              {transaction.attackType === 'liquidation' && (
                <>
                  A <strong>liquidation attack</strong> targets undercollateralized positions, 
                  often racing to be the first to liquidate for profit.
                </>
              )}
            </p>
          </div>

          {/* Protection Recommendation */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
            <label className="text-blue-400 text-sm font-semibold block mb-2">
              🛡️ Protection Recommendations
            </label>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>✓ Use Flashbots Protect RPC to hide transactions from public mempool</li>
              <li>✓ Set tighter slippage tolerance (0.1-0.5% for stablecoins)</li>
              <li>✓ Split large trades into smaller chunks</li>
              <li>✓ Use DEX aggregators for better execution</li>
              <li>✓ Submit during low-activity periods for less MEV risk</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            Close
          </button>
          <a
            href={formatEtherscanLink(transaction.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
          >
            View on Explorer ↗
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
