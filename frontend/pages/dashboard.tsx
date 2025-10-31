import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import RaceFeed from "@/components/RaceFeed";
import RiskGauge from "@/components/RiskGauge";
import StatsPanel from "@/components/StatsPanel";
import ToastContainer, { showToast } from "@/components/ToastContainer";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Dashboard() {
  const { connected, transactions, flaggedTxs, stats } = useWebSocket();
  const [avgRiskScore, setAvgRiskScore] = useState(0);

  useEffect(() => {
    if (flaggedTxs.length > 0) {
      const avg =
        flaggedTxs.reduce((sum, tx) => sum + tx.riskScore, 0) /
        flaggedTxs.length;
      setAvgRiskScore(Math.round(avg));
    } else {
      setAvgRiskScore(0);
    }
  }, [flaggedTxs]);

  // Handle real MEV attack on mempool transaction
  const handleAttackTransaction = async (
    txHash: string,
    attackType: string
  ) => {
    try {
      showToast(
        "info",
        "⚡ Executing Attack",
        `Sending ${attackType} attack transaction...\nThis will take 10-15 seconds`,
        3000
      );

      const response = await fetch("http://localhost:8080/api/attack/mempool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ victimTxHash: txHash, attackType }),
      });

      const data = await response.json();

      if (data.success) {
        const flagged = data.flagged;
        const isBlocked = flagged.riskScore < 50;

        showToast(
          isBlocked ? "success" : "error",
          isBlocked ? "✅ Attack Blocked!" : "❌ Attack Successful",
          `${
            isBlocked
              ? "🟢 SafeRouter Protection Active"
              : "🔴 VulnerableRouter Exploited"
          }\n\n` +
            `Risk Score: ${flagged.riskScore}/100\n` +
            `User Loss: $${flagged.estimatedLoss}\n` +
            `TX: ${data.attack.attackTxHash.slice(0, 20)}...\n\n` +
            `${flagged.mitigation}`,
          8000
        );

        // Also show alert for copy-paste convenience
        setTimeout(() => {
          if (
            window.confirm(
              `View transaction on Etherscan?\n\n${data.attack.explorerUrl}`
            )
          ) {
            window.open(data.attack.explorerUrl, "_blank");
          }
        }, 500);
      } else {
        showToast("error", "❌ Attack Failed", data.error || data.message);
      }
    } catch (error) {
      console.error("Attack failed:", error);
      showToast(
        "error",
        "❌ Attack Failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  return (
    <>
      <Head>
        <title>RaceSafe DeFi - Live Dashboard</title>
        <meta
          name="description"
          content="Live mempool monitoring dashboard with F1 racing theme"
        />
      </Head>

      <Layout>
        <ToastContainer />
        <div className="min-h-screen bg-gradient-to-b from-f1-black via-f1-gray/20 to-f1-black p-4 sm:p-6 lg:p-8 relative">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-f1-red to-transparent"
                style={{ top: `${30 + i * 30}%` }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 2,
                }}
              />
            ))}
          </div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 relative"
          >
            <div className="glass-morphism rounded-2xl p-6 sm:p-8 border-2 border-f1-red/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <motion.h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold text-f1-red f1-glow mb-3 flex items-center gap-3 flex-wrap"
                    initial={{ x: -50 }}
                    animate={{ x: 0 }}
                  >
                    <motion.span
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      🏎️
                    </motion.span>
                    RACE FEED
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-f1-silver text-lg font-mono"
                  >
                    Live Mempool Activity Monitor
                  </motion.p>
                </div>

                {/* Connection Status */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 bg-f1-black/50 px-6 py-3 rounded-xl border border-f1-gray/50"
                >
                  <motion.div
                    className={`w-4 h-4 rounded-full ${
                      connected ? "bg-green-500" : "bg-red-500"
                    }`}
                    animate={{
                      scale: connected ? [1, 1.3, 1] : 1,
                      boxShadow: connected
                        ? [
                            "0 0 0 0 rgba(0, 255, 0, 0.7)",
                            "0 0 0 10px rgba(0, 255, 0, 0)",
                            "0 0 0 0 rgba(0, 255, 0, 0)",
                          ]
                        : "none",
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: connected ? Infinity : 0,
                    }}
                  />
                  <div>
                    <span className="text-sm font-mono block text-f1-silver">
                      Status
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        connected ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {connected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Racing Stripe */}
              <motion.div
                className="mt-6 h-1 rounded-full overflow-hidden bg-f1-gray/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-f1-red via-orange-500 to-f1-red"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Risk Gauge & Stats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <RiskGauge score={avgRiskScore} />
              <StatsPanel
                stats={{
                  totalTransactions: transactions.length,
                  flaggedCount: flaggedTxs.length,
                  ...stats,
                }}
              />

              {/* Quick Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-morphism rounded-2xl p-6 border-2 border-f1-red/30"
              >
                <h3 className="text-lg font-bold text-f1-red mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  Quick Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-f1-silver">Detection Rate:</span>
                    <span className="text-green-400 font-bold">
                      {transactions.length > 0
                        ? Math.round(
                            (flaggedTxs.length / transactions.length) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-f1-silver">Avg Response:</span>
                    <span className="text-blue-400 font-bold">{"<"}50ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-f1-silver">Protection:</span>
                    <span className="text-f1-red font-bold">ACTIVE</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Race Feed */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <RaceFeed transactions={transactions} flaggedTxs={flaggedTxs} />
            </motion.div>
          </div>

          {/* Floating F1 Car (Fun Easter Egg) */}
          <motion.div
            className="fixed bottom-10 left-10 text-6xl pointer-events-none z-0 opacity-20"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🏎️
          </motion.div>
        </div>
      </Layout>
    </>
  );
}
