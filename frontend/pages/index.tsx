import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const { connected, transactions, flaggedTxs, stats } = useWebSocket();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <>
      <Head>
        <title>RaceSafe DeFi - Ultimate MEV Protection</title>
        <meta name="description" content="F1-themed DeFi security dashboard with MEV protection" />
      </Head>

      <Layout>
        {/* Hero Section with Background Image */}
        <section className="relative min-h-screen overflow-hidden">
          {/* Background image */}
          <motion.div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: "url('/background.jpg')", opacity, scale }}
          />

          {/* Readability overlay (left-to-right gradient) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />

          {/* Decorative grid (subtle) */}
          <div className="absolute inset-0 track-grid opacity-10" />

          {/* Hero Content (top-left) */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-12 pb-12 md:pt-20 md:pb-16">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 bg-f1-red/20 border border-f1-red px-4 py-2 rounded-full mb-4"
              >
                <span className="w-2 h-2 bg-f1-red rounded-full animate-pulse" />
                <span className="text-f1-red font-bold text-xs sm:text-sm">LIVE PROTECTION ACTIVE</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-left text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight max-w-4xl -mt-2"
              >
                <span className="text-white">Race</span>
                <span className="text-f1-red f1-glow">Safe</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-2 text-left text-lg sm:text-xl text-f1-silver/90 max-w-2xl"
              >
                F1-grade MEV protection with real-time mempool scanning and private submissions.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link href="/pit-crew">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(225, 6, 0, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-f1-red to-f1-dark-red text-white rounded-xl font-bold text-lg shadow-f1-glow"
                  >
                    Start Protection
                  </motion.button>
                </Link>

                <Link href="/garage">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 glass-morphism text-white rounded-xl font-bold text-lg border-2 border-f1-red/50 hover:border-f1-red"
                  >
                    View Garage
                  </motion.button>
                </Link>
              </motion.div>

              {/* Quick stats (clean and minimal) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl"
              >
                {[
                  { label: 'Transactions', value: transactions.length },
                  { label: 'Threats Blocked', value: flaggedTxs.length },
                  { label: 'Response', value: '<50ms' },
                ].map((s) => (
                  <div key={s.label} className="glass-morphism rounded-lg p-4 border border-f1-red/30">
                    <div className="text-sm text-f1-silver">{s.label}</div>
                    <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-f1-black via-f1-gray/30 to-f1-black" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                F1-Grade <span className="text-f1-red f1-glow">Security</span>
              </h2>
              <p className="text-xl text-f1-silver max-w-3xl mx-auto">
                Engineered for speed and precision, just like Formula 1 racing
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎯',
                  title: 'Real-time Scanning',
                  description: 'Monitor mempool activity at lightning speed with millisecond precision',
                  color: 'from-red-500 to-orange-500',
                },
                {
                  icon: '🛡️',
                  title: 'MEV Protection',
                  description: 'Detect and prevent sandwich attacks, front-running, and gas manipulation',
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  icon: '⚡',
                  title: 'Flashbots Integration',
                  description: 'Submit transactions privately through Flashbots relay network',
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  icon: '📊',
                  title: 'Live Telemetry',
                  description: 'Track transactions and threats with F1-inspired dashboard',
                  color: 'from-green-500 to-teal-500',
                },
                {
                  icon: '🔐',
                  title: 'Smart Contracts',
                  description: 'Audited SafeRouter with reentrancy guard and circuit breakers',
                  color: 'from-yellow-500 to-orange-500',
                },
                {
                  icon: '🏎️',
                  title: 'Race Mode',
                  description: 'Simulate attacks and test defenses in safe environment',
                  color: 'from-indigo-500 to-purple-500',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="glass-morphism rounded-2xl p-8 border border-f1-red/30 hover:border-f1-red relative overflow-hidden group"
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-f1-silver">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Stats Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 racing-stripes opacity-5" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                Live <span className="text-f1-red f1-glow">Performance</span>
              </h2>
              <p className="text-xl text-f1-silver max-w-3xl mx-auto">
                Real-time metrics from your security dashboard
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Scans', value: transactions.length, icon: '📡', trend: '+12%' },
                { label: 'Threats Detected', value: flaggedTxs.length, icon: '🚨', trend: '-8%' },
                { label: 'Active Protection', value: connected ? 'ON' : 'OFF', icon: '🛡️', trend: '100%' },
                { label: 'Avg Response', value: '48ms', icon: '⚡', trend: '-15%' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="glass-morphism rounded-2xl p-6 border-2 border-f1-red/30 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-f1-red"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: index * 0.3,
                    }}
                  />

                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-4xl font-bold text-white font-mono mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-f1-silver mb-2">{stat.label}</div>
                  <div className="text-xs text-green-400 font-bold">{stat.trend}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-f1-black via-f1-red/10 to-f1-black" />
          
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-morphism rounded-3xl p-12 sm:p-16 border-2 border-f1-red relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-f1-red/20 to-transparent"
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
                <motion.div
                  className="text-8xl mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  🏁
                </motion.div>

                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  Ready to <span className="text-f1-red f1-glow">Race</span>?
                </h2>
                
                <p className="text-xl text-f1-silver mb-10 max-w-2xl mx-auto">
                  Join the pit crew and protect your DeFi transactions with F1-grade security
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/pit-crew">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(225, 6, 0, 0.8)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 bg-gradient-to-r from-f1-red to-f1-dark-red text-white rounded-xl font-bold text-xl shadow-f1-glow"
                    >
                      Launch Dashboard
                    </motion.button>
                  </Link>

                  <Link href="/simulation">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 glass-morphism text-white rounded-xl font-bold text-xl border-2 border-f1-red/50 hover:border-f1-red"
                    >
                      Try Simulation
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
}
