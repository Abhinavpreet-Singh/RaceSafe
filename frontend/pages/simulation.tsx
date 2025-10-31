import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';

export default function Simulation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'attack' | 'transaction'>('attack');
  const [txForm, setTxForm] = useState({
    to: '',
    value: '',
    gasPrice: '',
    data: '0x',
  });

  const simulateAttack = async (attackType: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/demo/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType }),
      });
      const data = await response.json();
      setResult(data.attack);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateTransaction = async (useFlashbots: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/simulate-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: txForm,
          useFlashbots,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Transaction simulation failed:', error);
      setResult({
        success: false,
        error: 'Simulation failed. Please check your inputs.',
      });
    } finally {
      setLoading(false);
    }
  };

  const attackTypes = [
    {
      type: 'SANDWICH',
      name: 'Sandwich Attack',
      icon: '🥪',
      description: 'Front-run + Back-run',
      color: 'from-orange-500 to-red-500',
    },
    {
      type: 'FRONTRUN',
      name: 'Front-running',
      icon: '🏃',
      description: 'Higher gas price',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      type: 'GAS_MANIPULATION',
      name: 'Gas Manipulation',
      icon: '⛽',
      description: 'Extreme gas prices',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <>
      <Head>
        <title>RaceSafe DeFi - Simulation</title>
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
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  🎮
                </motion.span>
                SIMULATION LAB
              </motion.h1>
              <p className="text-f1-silver text-lg font-mono mb-4">Test Attack Scenarios Safely</p>

              {/* Mode Selector */}
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('attack')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    mode === 'attack'
                      ? 'bg-f1-red text-white shadow-f1-glow'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  🚨 Attack Scenarios
                </button>
                <button
                  onClick={() => setMode('transaction')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    mode === 'transaction'
                      ? 'bg-f1-red text-white shadow-f1-glow'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  🔒 Transaction Risk
                </button>
              </div>
            </div>
          </motion.div>

          {/* Attack Type Buttons */}
          {mode === 'attack' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {attackTypes.map((attack, index) => (
              <motion.button
                key={attack.type}
                onClick={() => simulateAttack(attack.type)}
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`glass-morphism rounded-2xl p-6 border-2 border-f1-red/50 hover:border-f1-red transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group`}
              >
                {/* Animated Background on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${attack.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                />

                <div className="relative z-10">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      rotate: loading ? [0, 360] : 0,
                    }}
                    transition={{
                      duration: 1,
                      repeat: loading ? Infinity : 0,
                      ease: 'linear',
                    }}
                  >
                    {attack.icon}
                  </motion.div>
                  <div className="text-xl font-bold text-white mb-2">{attack.name}</div>
                  <div className="text-sm text-f1-silver">{attack.description}</div>

                  {/* Racing Stripe */}
                  <motion.div
                    className="mt-4 h-1 rounded-full bg-f1-gray overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${attack.color}`}
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </div>
          )}

          {/* Transaction Simulation Form */}
          {mode === 'transaction' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-2xl p-6 border-2 border-f1-red/30 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-3xl">🔍</span>
                Simulate Your Transaction
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">To Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={txForm.to}
                    onChange={(e) => setTxForm({ ...txForm, to: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-f1-red"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-2">Value (ETH)</label>
                  <input
                    type="text"
                    placeholder="0.1"
                    value={txForm.value}
                    onChange={(e) => setTxForm({ ...txForm, value: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-f1-red"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-2">Gas Price (Gwei)</label>
                  <input
                    type="text"
                    placeholder="50"
                    value={txForm.gasPrice}
                    onChange={(e) => setTxForm({ ...txForm, gasPrice: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-f1-red"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-2">Data (Optional)</label>
                  <textarea
                    placeholder="0x"
                    value={txForm.data}
                    onChange={(e) => setTxForm({ ...txForm, data: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-f1-red h-24"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => simulateTransaction(false)}
                    disabled={loading || !txForm.to}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔍 Simulate (Public)
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(225, 6, 0, 0.8)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => simulateTransaction(true)}
                    disabled={loading || !txForm.to}
                    className="flex-1 bg-gradient-to-r from-f1-red to-f1-dark-red text-white py-4 rounded-xl font-bold shadow-f1-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔒 Simulate (Flashbots)
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}


          {/* Loading Animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-morphism rounded-2xl p-12 text-center border-2 border-f1-red mb-8"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="text-8xl mb-4"
                >
                  🏎️
                </motion.div>
                <h3 className="text-2xl text-f1-red mb-2 font-bold">Simulating Attack...</h3>
                <p className="text-f1-silver">Running security analysis</p>

                {/* Progress Bar */}
                <div className="mt-6 h-2 bg-f1-gray rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-f1-red to-orange-500"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Display */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="glass-morphism rounded-2xl p-6 sm:p-8 f1-border-glow relative overflow-hidden"
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-f1-red/10 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-f1-red flex items-center gap-3">
                      <motion.span
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        🧪
                      </motion.span>
                      Simulation Result
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setResult(null)}
                      className="text-f1-silver hover:text-white transition-colors"
                    >
                      ✕ Close
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {[
                      {
                        label: 'Attack Type',
                        value: result.attackType,
                        icon: '🚨',
                        color: 'text-f1-red',
                      },
                      {
                        label: 'Risk Score',
                        value: `${result.riskScore}/100`,
                        icon: '⚠️',
                        color: 'text-orange-500',
                      },
                      {
                        label: 'Transaction Hash',
                        value: result.hash?.slice(0, 30) + '...',
                        icon: '🔗',
                        color: 'text-blue-400',
                      },
                      {
                        label: 'Estimated Loss',
                        value: `${result.estimatedLoss} ETH`,
                        icon: '💰',
                        color: 'text-yellow-400',
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-f1-black/50 rounded-xl p-4 border border-f1-gray/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-f1-silver text-sm font-mono">{item.label}:</span>
                        </div>
                        <div className={`${item.color} font-bold font-mono text-lg`}>
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mitigation Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-f1-black/80 to-f1-gray/50 rounded-xl p-6 border border-f1-gold/30"
                  >
                    <div className="flex items-center gap-2 text-f1-gold mb-3">
                      <motion.span
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="text-2xl"
                      >
                        💡
                      </motion.span>
                      <span className="font-bold text-lg">Mitigation Strategy:</span>
                    </div>
                    <p className="text-white pl-9">{result.mitigation}</p>
                  </motion.div>

                  {/* Run Another Simulation */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(225, 6, 0, 0.8)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setResult(null)}
                    className="w-full mt-6 bg-gradient-to-r from-f1-red to-f1-dark-red text-white py-4 rounded-xl font-bold text-lg shadow-f1-glow"
                  >
                    🔄 Run Another Simulation
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
}
