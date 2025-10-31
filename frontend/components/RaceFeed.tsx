import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  timestamp: number;
}

interface FlaggedTransaction extends Transaction {
  attackType: string;
  riskScore: number;
  estimatedLoss: string;
  mitigation: string;
}

interface Props {
  transactions: Transaction[];
  flaggedTxs: FlaggedTransaction[];
}

export default function RaceFeed({ transactions, flaggedTxs }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [showDemoTxs, setShowDemoTxs] = useState(false); // Default: hide demo txs
  const [showZeroValue, setShowZeroValue] = useState(false); // Default: hide 0 ETH txs
  const [showAllTransactions, setShowAllTransactions] = useState(false); // Toggle for all transactions

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [transactions.length]);

  // Filter out demo transactions (those with hash starting with "0xDEMO")
  let filteredTransactions = showDemoTxs
    ? transactions
    : transactions.filter((tx) => !tx.hash.startsWith("0xDEMO"));

  // Filter out 0 ETH transactions if toggle is off
  if (!showZeroValue) {
    filteredTransactions = filteredTransactions.filter(
      (tx) => parseFloat(tx.value) > 0
    );
  }

  // Show all or just recent 20 (LATEST ON TOP)
  const recentTransactions = showAllTransactions
    ? [...filteredTransactions].reverse() // ALL transactions, latest first
    : filteredTransactions.slice(-20).reverse(); // Last 20, latest first

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-morphism rounded-2xl p-6 f1-border-glow relative overflow-hidden"
    >
      {/* Racing Stripe Header */}
      <div className="absolute top-0 left-0 right-0 h-2 racing-stripes" />

      <div className="relative z-10">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6 flex-wrap gap-4"
        >
          <h2 className="text-2xl font-bold text-f1-red flex items-center gap-3">
            <motion.span
              animate={{
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              📡
            </motion.span>
            Live Mempool Feed
            <motion.div
              className="w-3 h-3 bg-f1-red rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View All Transactions Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-bold ${
                showAllTransactions
                  ? "bg-f1-red/20 border-f1-red text-f1-red"
                  : "bg-cyan-600/20 border-cyan-600 text-cyan-400"
              }`}
            >
              {showAllTransactions ? "📊 Show Recent 20" : "🔍 View All Live"}
            </motion.button>

            {/* Toggle for Demo Transactions */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDemoTxs(!showDemoTxs)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-bold ${
                showDemoTxs
                  ? "bg-yellow-600/20 border-yellow-600 text-yellow-400"
                  : "bg-green-600/20 border-green-600 text-green-400"
              }`}
            >
              {showDemoTxs ? "🎮 Demo Mode" : "💎 Real Only"}
            </motion.button>

            {/* Toggle for 0 ETH Transactions */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowZeroValue(!showZeroValue)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-bold ${
                showZeroValue
                  ? "bg-blue-600/20 border-blue-600 text-blue-400"
                  : "bg-purple-600/20 border-purple-600 text-purple-400"
              }`}
            >
              {showZeroValue ? "📊 All Values" : "💰 ETH > 0"}
            </motion.button>

            <div className="flex items-center gap-2 bg-f1-black/50 px-4 py-2 rounded-lg">
              <span className="text-f1-silver text-sm font-mono">
                {showAllTransactions ? "Total:" : "Showing:"}
              </span>
              <motion.span
                key={recentTransactions.length}
                initial={{ scale: 1.3, color: "#E10600" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-white font-bold font-mono"
              >
                {recentTransactions.length}
              </motion.span>
            </div>
          </div>
        </motion.div>

        <div
          ref={feedRef}
          className="space-y-3 max-h-[700px] overflow-y-auto pr-2 scroll-smooth custom-scrollbar"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#E10600 #1a1a1a",
          }}
        >
          {recentTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-f1-silver text-center py-12 bg-f1-black/30 rounded-xl border-2 border-dashed border-f1-gray"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="text-6xl mb-4"
              >
                🏁
              </motion.div>
              <h3 className="text-xl font-bold mb-2">
                Waiting for Transactions...
              </h3>
              <p className="text-sm">
                The mempool scanner is monitoring for activity
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {recentTransactions.map((tx, idx) => {
                const isFlagged = flaggedTxs.some((f) => f.hash === tx.hash);
                const flaggedTx = flaggedTxs.find((f) => f.hash === tx.hash);

                return (
                  <motion.div
                    key={tx.hash || idx}
                    layout
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                      ${
                        isFlagged
                          ? "bg-red-900/30 border-f1-red shadow-f1-glow"
                          : "bg-f1-black/50 border-f1-gray/50 hover:border-f1-red/30"
                      }
                    `}
                  >
                    {/* Animated Background for Flagged */}
                    {isFlagged && (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-f1-red/20 to-transparent"
                          animate={{
                            x: ["-100%", "200%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-f1-red border-l-[40px] border-l-transparent" />
                      </>
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 font-mono text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            {isFlagged && (
                              <motion.span
                                animate={{
                                  rotate: [0, 10, -10, 0],
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  repeatDelay: 1,
                                }}
                                className="text-2xl"
                              >
                                🚨
                              </motion.span>
                            )}
                            {!isFlagged && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-xl"
                              >
                                🏎️
                              </motion.span>
                            )}
                            <span className="text-f1-silver">Tx:</span>
                            <span className="text-white font-bold">
                              {tx.hash?.slice(0, 10)}...{tx.hash?.slice(-8)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-f1-silver">From: </span>
                              <span className="text-white">
                                {tx.from?.slice(0, 8)}...
                              </span>
                            </div>
                            <div>
                              <span className="text-f1-silver">Value: </span>
                              <span className="text-green-400 font-bold">
                                {tx.value} ETH
                              </span>
                            </div>
                            <div>
                              <span className="text-f1-silver">Gas: </span>
                              <span className="text-yellow-400">
                                {tx.gasPrice} gwei
                              </span>
                            </div>
                            <div>
                              <span className="text-f1-silver">Time: </span>
                              <span className="text-blue-400">
                                {new Date().toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          {/* Etherscan Verification Button */}
                          <motion.a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-lg text-xs font-bold text-blue-300 hover:text-blue-100 hover:border-blue-400 transition-all"
                          >
                            <span>🔍</span>
                            <span>View on Etherscan</span>
                            <span>↗</span>
                          </motion.a>

                          {/* AUTO-ATTACK MODE - No manual buttons needed! */}
                          {!isFlagged && parseFloat(tx.value) > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 pt-3 border-t border-yellow-500/30 bg-yellow-900/10 rounded p-2"
                            >
                              <div className="flex items-center gap-2 text-xs">
                                <motion.div
                                  animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                  }}
                                  className="w-2 h-2 bg-yellow-500 rounded-full"
                                />
                                <span className="text-yellow-400 font-bold">
                                  🤖 MEV Bot Auto-Attack Active
                                </span>
                                <span className="text-yellow-500/60">
                                  • Scanning for vulnerability...
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {isFlagged && flaggedTx && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-right ml-4"
                          >
                            {/* Attack Type Badge - Green if protected */}
                            <div
                              className={`px-3 py-1 rounded-full mb-2 border ${
                                flaggedTx.riskScore <= 15
                                  ? "bg-green-600/20 border-green-600"
                                  : "bg-f1-red/20 border-f1-red"
                              }`}
                            >
                              <span
                                className={`font-bold text-xs ${
                                  flaggedTx.riskScore <= 15
                                    ? "text-green-400"
                                    : "text-f1-red"
                                }`}
                              >
                                {flaggedTx.attackType}
                              </span>
                            </div>

                            {/* Risk Score - Green if protected */}
                            <div
                              className={`text-2xl font-bold font-mono ${
                                flaggedTx.riskScore <= 15
                                  ? "text-green-400"
                                  : "text-f1-red"
                              }`}
                            >
                              {flaggedTx.riskScore}
                            </div>
                            <div className="text-[10px] text-f1-silver mb-2">
                              RISK
                            </div>

                            {/* Loss Display - ALWAYS show for context */}
                            <div
                              className={`px-2 py-1 rounded border mt-2 ${
                                parseFloat(flaggedTx.estimatedLoss) === 0
                                  ? "bg-green-900/50 border-green-500"
                                  : "bg-red-900/50 border-red-500"
                              }`}
                            >
                              <div
                                className={`text-[10px] ${
                                  parseFloat(flaggedTx.estimatedLoss) === 0
                                    ? "text-green-300"
                                    : "text-red-300"
                                }`}
                              >
                                {parseFloat(flaggedTx.estimatedLoss) === 0
                                  ? "🛡️ PROTECTED"
                                  : "BOT EXTRACTED"}
                              </div>
                              <div
                                className={`text-sm font-bold ${
                                  parseFloat(flaggedTx.estimatedLoss) === 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                ${flaggedTx.estimatedLoss}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* MEV Attack Details */}
                      {isFlagged && flaggedTx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 pt-3 border-t border-red-500/30"
                        >
                          <div className="text-xs space-y-2">
                            {/* Attack Status - ALWAYS SHOW */}
                            <div
                              className={`flex items-center justify-between p-2 rounded ${
                                flaggedTx.riskScore <= 15
                                  ? "bg-green-900/30"
                                  : "bg-red-900/30"
                              }`}
                            >
                              <span
                                className={`font-bold ${
                                  flaggedTx.riskScore <= 15
                                    ? "text-green-300"
                                    : "text-red-300"
                                }`}
                              >
                                {flaggedTx.riskScore <= 15
                                  ? "🛡️ Flashbots Protected:"
                                  : "🤖 MEV Bot Attack:"}
                              </span>
                              <span
                                className={`font-bold ${
                                  flaggedTx.riskScore <= 15
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {flaggedTx.riskScore <= 15
                                  ? "✅ BLOCKED"
                                  : "❌ SUCCESSFUL"}
                              </span>
                            </div>

                            {/* Value Extracted - ALWAYS SHOW with $0.00 for protected */}
                            <div
                              className={`flex items-center justify-between p-2 rounded ${
                                parseFloat(flaggedTx.estimatedLoss) === 0
                                  ? "bg-green-900/30"
                                  : "bg-red-900/30"
                              }`}
                            >
                              <span
                                className={
                                  parseFloat(flaggedTx.estimatedLoss) === 0
                                    ? "text-green-300"
                                    : "text-red-300"
                                }
                              >
                                💸 Value Extracted:
                              </span>
                              <span
                                className={`font-bold ${
                                  parseFloat(flaggedTx.estimatedLoss) === 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                ${flaggedTx.estimatedLoss}
                                {parseFloat(flaggedTx.estimatedLoss) > 0 &&
                                  ` (~${(
                                    parseFloat(flaggedTx.estimatedLoss) / 3000
                                  ).toFixed(6)} ETH)`}
                              </span>
                            </div>

                            {/* Victim Address */}
                            <div className="flex items-center justify-between bg-red-900/30 p-2 rounded">
                              <span className="text-red-300">👤 Victim:</span>
                              <span className="font-mono text-white">
                                {tx.from?.slice(0, 10)}...{tx.from?.slice(-8)}
                              </span>
                            </div>

                            {/* Bot Address - Show differently for protected vs attacked */}
                            <div
                              className={`flex items-center justify-between p-2 rounded ${
                                parseFloat(flaggedTx.estimatedLoss) === 0
                                  ? "bg-green-900/30"
                                  : "bg-red-900/30"
                              }`}
                            >
                              <span
                                className={
                                  parseFloat(flaggedTx.estimatedLoss) === 0
                                    ? "text-green-300"
                                    : "text-red-300"
                                }
                              >
                                {parseFloat(flaggedTx.estimatedLoss) === 0
                                  ? "🔒 Status:"
                                  : "🤖 Bot Address:"}
                              </span>
                              <span
                                className={`font-mono ${
                                  parseFloat(flaggedTx.estimatedLoss) === 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {parseFloat(flaggedTx.estimatedLoss) === 0
                                  ? "Bypassed Mempool"
                                  : `${flaggedTx.from?.slice(
                                      0,
                                      10
                                    )}...${flaggedTx.from?.slice(-8)}`}
                              </span>
                            </div>

                            {/* Mitigation - Green for protected, Blue for info */}
                            <div
                              className={`p-2 rounded border ${
                                flaggedTx.riskScore <= 15
                                  ? "bg-green-900/30 border-green-500/50"
                                  : "bg-blue-900/30 border-blue-500/50"
                              }`}
                            >
                              <div
                                className={`font-bold mb-1 ${
                                  flaggedTx.riskScore <= 15
                                    ? "text-green-300"
                                    : "text-blue-300"
                                }`}
                              >
                                {flaggedTx.riskScore <= 15
                                  ? "� Flashbots Protection:"
                                  : "🛡️ How to Protect:"}
                              </div>
                              <div
                                className={`text-[10px] ${
                                  flaggedTx.riskScore <= 15
                                    ? "text-green-200"
                                    : "text-blue-200"
                                }`}
                              >
                                {flaggedTx.mitigation}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Speed Indicator */}
                      <div className="mt-2">
                        <div className="h-1 bg-f1-gray/50 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              isFlagged
                                ? "bg-gradient-to-r from-f1-red to-orange-500"
                                : "bg-gradient-to-r from-green-500 to-blue-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-f1-red/30 flex justify-between items-center text-xs font-mono"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-f1-silver">Live Feed Active</span>
            </div>
          </div>
          <div className="text-f1-silver">
            Showing {recentTransactions.length} of {transactions.length}{" "}
            transactions
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
