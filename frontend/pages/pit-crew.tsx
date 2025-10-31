import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/Layout";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useBackend } from "@/hooks/useBackend";

export default function PitCrew() {
  const { flaggedTxs } = useWebSocket();
  const { api } = useBackend();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const handleFlashbotsSubmit = async (tx: any) => {
    try {
      setSubmitting(tx.hash);

      // Call the Flashbots API with demo mode
      const response = await api("/api/sendPrivateTx", {
        method: "POST",
        body: JSON.stringify({
          signedTransaction: tx.hash,
          targetBlock: null,
          maxBlockNumber: null,
          demoMode: true, // Enable demo mode for test transactions
        }),
      });

      console.log("✅ Flashbots submission:", response);

      // Mark as submitted
      setSubmitted((prev) => new Set(prev).add(tx.hash));

      // Show success notification
      alert(
        `✅ Transaction Protected!\n\n${
          response.message
        }\n\nHash: ${tx.hash.substring(0, 20)}...`
      );
    } catch (error) {
      console.error("❌ Flashbots submission failed:", error);
      alert(
        `❌ Failed to submit via Flashbots: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <>
      <Head>
        <title>RaceSafe DeFi - Pit Crew</title>
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-f1-black via-f1-gray/20 to-f1-black p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="glass-morphism rounded-2xl p-6 sm:p-8 border-2 border-f1-red/30">
              <motion.h1
                className="text-4xl sm:text-5xl font-bold text-f1-red f1-glow mb-3 flex items-center gap-3"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
              >
                <motion.span
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  🔧
                </motion.span>
                PIT CREW
              </motion.h1>
              <p className="text-f1-silver text-lg font-mono">
                Flagged Transactions & Mitigations
              </p>

              {/* Stats Bar */}
              <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2 bg-f1-black/50 px-4 py-2 rounded-lg">
                  <span className="text-f1-silver text-sm">Total Flags:</span>
                  <motion.span
                    key={flaggedTxs.length}
                    initial={{ scale: 1.5, color: "#E10600" }}
                    animate={{ scale: 1, color: "#FFFFFF" }}
                    className="text-white font-bold font-mono"
                  >
                    {flaggedTxs.length}
                  </motion.span>
                </div>

                {/* Generate Demo Attack Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      const response = await api("/api/demo/attack", {
                        method: "POST",
                        body: JSON.stringify({
                          attackType: "SANDWICH",
                        }),
                      });
                      console.log("✅ Demo attack generated:", response);
                    } catch (error) {
                      console.error(
                        "❌ Failed to generate demo attack:",
                        error
                      );
                    }
                  }}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg"
                >
                  <span className="text-xl">⚡</span>
                  Generate Demo Attack
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Flagged Transactions Grid */}
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {flaggedTxs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-morphism rounded-2xl p-12 text-center border-2 border-green-500/30"
                >
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-8xl mb-6"
                  >
                    🏁
                  </motion.div>
                  <h3 className="text-3xl text-green-500 mb-4 font-bold">
                    All Clear!
                  </h3>
                  <p className="text-f1-silver text-lg">
                    No MEV attacks detected
                  </p>
                  <motion.div
                    className="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-green-500 to-transparent rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              ) : (
                flaggedTxs.reverse().map((tx, idx) => (
                  <motion.div
                    key={tx.hash || idx}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                    }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="glass-morphism rounded-2xl p-6 border-2 border-f1-red relative overflow-hidden"
                  >
                    {/* Animated Background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-f1-red/20 to-transparent"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    {/* Alert Badge */}
                    <div className="absolute top-0 right-0">
                      <div className="bg-f1-red text-white px-4 py-2 rounded-bl-2xl font-bold text-sm">
                        FLAGGED
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <motion.span
                              animate={{
                                rotate: [0, 15, -15, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                              }}
                              className="text-4xl"
                            >
                              🚨
                            </motion.span>
                            <div>
                              <div className="text-2xl font-bold text-f1-red">
                                {tx.attackType}
                              </div>
                              <div className="text-sm text-f1-silver font-mono mt-1">
                                {tx.hash?.slice(0, 16)}...{tx.hash?.slice(-12)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            delay: 0.2,
                          }}
                          className="text-center bg-f1-black/70 px-6 py-4 rounded-xl border-2 border-f1-red"
                        >
                          <div className="text-5xl font-bold text-f1-red font-mono">
                            {tx.riskScore}
                          </div>
                          <div className="text-xs text-f1-silver mt-1">
                            RISK SCORE
                          </div>
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            label: "From",
                            value: tx.from?.slice(0, 20) + "...",
                            icon: "📤",
                          },
                          {
                            label: "Value",
                            value: `${tx.value} ETH`,
                            icon: "💰",
                          },
                          {
                            label: "Gas Price",
                            value: `${tx.gasPrice} gwei`,
                            icon: "⛽",
                          },
                          {
                            label: "Est. Loss",
                            value: `${tx.estimatedLoss} ETH`,
                            icon: "⚠️",
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-f1-black/50 rounded-lg p-3 border border-f1-gray/50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span>{item.icon}</span>
                              <span className="text-f1-silver text-sm">
                                {item.label}:
                              </span>
                            </div>
                            <div
                              className={`font-mono font-bold ${
                                item.label === "Est. Loss"
                                  ? "text-f1-red"
                                  : "text-white"
                              }`}
                            >
                              {item.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Mitigation */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-f1-black/80 to-f1-gray/50 rounded-xl p-4 mb-4 border border-f1-red/30"
                      >
                        <div className="flex items-center gap-2 text-f1-gold mb-2">
                          <span className="text-xl">💡</span>
                          <span className="text-sm font-bold">
                            RECOMMENDED MITIGATION:
                          </span>
                        </div>
                        <div className="text-sm text-white pl-7">
                          {tx.mitigation}
                        </div>
                      </motion.div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 0 30px rgba(225, 6, 0, 0.8)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFlashbotsSubmit(tx)}
                        disabled={
                          submitting === tx.hash || submitted.has(tx.hash)
                        }
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-f1-glow flex items-center justify-center gap-2 ${
                          submitted.has(tx.hash)
                            ? "bg-green-600 cursor-not-allowed"
                            : submitting === tx.hash
                            ? "bg-f1-gray cursor-wait"
                            : "bg-gradient-to-r from-f1-red to-f1-dark-red"
                        } text-white`}
                      >
                        {submitted.has(tx.hash) ? (
                          <>
                            <span>✅</span>
                            PROTECTED VIA FLASHBOTS
                          </>
                        ) : submitting === tx.hash ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              ⚡
                            </motion.span>
                            SUBMITTING...
                          </>
                        ) : (
                          <>
                            <span>⚡</span>
                            SUBMIT VIA FLASHBOTS
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </Layout>
    </>
  );
}
