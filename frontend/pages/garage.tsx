import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

export default function Garage() {
  const securityFeatures = [
    { name: 'Reentrancy Guard', icon: '🛡️', status: true },
    { name: 'Slippage Protection', icon: '📊', status: true },
    { name: 'Circuit Breaker', icon: '⚡', status: true },
    { name: 'Access Control', icon: '🔐', status: true },
    { name: 'Event Logging', icon: '📝', status: true },
    { name: 'Safe Token Transfers', icon: '💰', status: true },
  ];

  return (
    <>
      <Head>
        <title>RaceSafe DeFi - Garage</title>
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
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  🏎️
                </motion.span>
                GARAGE
              </motion.h1>
              <p className="text-f1-silver text-lg font-mono">Smart Contract Security Status</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-2xl p-6 f1-border-glow relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-f1-red to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <h2 className="text-2xl font-bold text-f1-red mb-6 flex items-center gap-2">
                <span>📋</span>
                SafeRouter Contract
              </h2>

              <div className="space-y-4 font-mono text-sm">
                {[
                  { label: 'Status', value: 'DEPLOYED', color: 'text-green-500', icon: '✅' },
                  { label: 'Network', value: 'Localhost', color: 'text-blue-400', icon: '🌐' },
                  {
                    label: 'Address',
                    value: process.env.NEXT_PUBLIC_SAFE_ROUTER_ADDRESS?.slice(0, 20) + '...',
                    color: 'text-white',
                    icon: '📍',
                  },
                  { label: 'Version', value: '1.0.0', color: 'text-f1-silver', icon: '🔖' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex justify-between items-center p-3 bg-f1-black/50 rounded-lg border border-f1-gray/50 hover:border-f1-red/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-f1-silver">{item.label}:</span>
                    </div>
                    <span className={`${item.color} font-bold`}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Security Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-morphism rounded-2xl p-6 f1-border-glow-green relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
              />

              <h2 className="text-2xl font-bold text-green-500 mb-6 flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  🔒
                </motion.span>
                Security Features
              </h2>

              <div className="space-y-3">
                {securityFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center gap-3 p-3 bg-f1-black/50 rounded-lg border border-green-500/30 hover:border-green-500/70 transition-all"
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: index * 0.5, duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.span>
                    <span className="text-green-500">✅</span>
                    <span className="text-white font-mono">{feature.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Audit Reports */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 glass-morphism rounded-2xl p-6 f1-border-glow"
            >
              <h2 className="text-2xl font-bold text-f1-red mb-6 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📊
                </motion.span>
                Audit Reports
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Initial Audit */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-red-900/40 to-f1-black rounded-2xl p-6 border-2 border-red-500 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Initial Audit
                    </h3>
                    <div className="text-sm text-f1-silver mb-4">Before Hardening</div>

                    <motion.div
                      className="text-6xl font-bold text-red-500 mb-2 font-mono"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                    >
                      85/100
                    </motion.div>

                    <div className="text-xs text-f1-silver mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      12 Critical Issues Found
                    </div>

                    <motion.a
                      href="/docs/audit-initial.md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block text-red-500 underline text-sm font-bold hover:text-red-400 transition-colors"
                    >
                      View Report →
                    </motion.a>
                  </div>
                </motion.div>

                {/* Final Audit */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-green-900/40 to-f1-black rounded-2xl p-6 border-2 border-green-500 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                  />

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-green-500 mb-2 flex items-center gap-2">
                      <span>✅</span>
                      Final Audit
                    </h3>
                    <div className="text-sm text-f1-silver mb-4">After Hardening</div>

                    <motion.div
                      className="text-6xl font-bold text-green-500 mb-2 font-mono"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.7 }}
                    >
                      12/100
                    </motion.div>

                    <div className="text-xs text-f1-silver mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      ✅ Production Ready
                    </div>

                    <motion.a
                      href="/docs/audit-final.md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block text-green-500 underline text-sm font-bold hover:text-green-400 transition-colors"
                    >
                      View Report →
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
}
