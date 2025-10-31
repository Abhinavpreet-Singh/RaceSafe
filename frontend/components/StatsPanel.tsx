import { motion } from 'framer-motion';

interface Stats {
  totalTransactions?: number;
  flaggedCount?: number;
  scanner?: {
    isScanning: boolean;
    pendingTxs: number;
    recentTxs: number;
  };
}

interface Props {
  stats: Stats;
}

export default function StatsPanel({ stats }: Props) {
  const statItems = [
    {
      label: 'Total Transactions',
      value: stats.totalTransactions || 0,
      icon: '📊',
      color: 'text-blue-400',
    },
    {
      label: 'Flagged Attacks',
      value: stats.flaggedCount || 0,
      icon: '🚨',
      color: 'text-f1-red',
    },
    {
      label: 'Pending Txs',
      value: stats.scanner?.pendingTxs || 0,
      icon: '⏳',
      color: 'text-yellow-400',
    },
    {
      label: 'Recent Txs',
      value: stats.scanner?.recentTxs || 0,
      icon: '🔄',
      color: 'text-green-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-morphism rounded-2xl p-6 f1-border-glow relative overflow-hidden"
    >
      {/* Animated Background Effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-f1-red to-transparent"
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
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold text-f1-red mb-6 flex items-center gap-2"
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            📊
          </motion.span>
          Telemetry
        </motion.h2>

        <div className="space-y-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-f1-black/50 rounded-lg p-4 border border-f1-gray/50 hover:border-f1-red/50 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <motion.span
                    className="text-2xl"
                    animate={{
                      rotate: item.label === 'Recent Txs' ? [0, 360] : 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: item.label === 'Recent Txs' ? Infinity : 0,
                      ease: 'linear',
                    }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-f1-silver text-sm font-mono">{item.label}</span>
                </div>
                <motion.span
                  key={item.value}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`font-bold text-2xl font-mono ${item.color}`}
                >
                  {item.value}
                </motion.span>
              </div>

              {/* Progress Bar for some stats */}
              {(item.label === 'Total Transactions' || item.label === 'Pending Txs') && (
                <motion.div
                  className="mt-2 h-1 bg-f1-gray rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <motion.div
                    className={`h-full ${
                      item.label === 'Total Transactions' ? 'bg-blue-400' : 'bg-yellow-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((item.value / 100) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Scanner Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-f1-black/50 rounded-lg border border-f1-gray/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: stats.scanner?.isScanning ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: stats.scanner?.isScanning ? Infinity : 0,
                }}
                className={`w-3 h-3 rounded-full ${
                  stats.scanner?.isScanning ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-f1-silver text-sm font-mono">Scanner Status</span>
            </div>
            <span
              className={`font-bold text-sm font-mono ${
                stats.scanner?.isScanning ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {stats.scanner?.isScanning ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>
        </motion.div>

        {/* System Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-6 border-t border-f1-red/30"
        >
          <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-f1-red/20 to-transparent rounded-lg">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <span className="text-2xl">🏎️</span>
            </motion.div>
            <div className="text-center">
              <p className="text-xs text-f1-silver font-mono">F1 SecurePit Active</p>
              <motion.div
                className="h-0.5 bg-f1-red rounded-full mt-1"
                animate={{
                  width: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
