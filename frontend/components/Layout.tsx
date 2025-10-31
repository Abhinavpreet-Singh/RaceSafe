import { ReactNode, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../hooks/useWallet";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [blockNumber, setBlockNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    address,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  useEffect(() => {
    setMounted(true);
    setBlockNumber(Math.floor(Date.now() / 1000));

    const interval = setInterval(() => {
      setBlockNumber(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle page transition loading
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
      setLoadingProgress(0);
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Simulate progress
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 100);
    };

    const handleRouteChangeComplete = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 200);
    };

    const handleRouteChangeError = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsLoading(false);
      setLoadingProgress(0);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Audit", path: "/audit-report" },
    { name: "Pit Crew", path: "/pit-crew" },
    { name: "Garage", path: "/garage" },
    { name: "Simulation", path: "/simulation" },
  ];

  return (
    <div className="min-h-screen bg-f1-black relative overflow-hidden">
      {/* Animated Background Grid */}
      <div
        className="fixed inset-0 track-grid opacity-30 pointer-events-none"
        style={{ willChange: "auto" }}
      />

      {/* Animated Speed Lines */}
      <motion.div
        className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-f1-red to-transparent opacity-50"
        style={{ willChange: "transform" }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Top Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-morphism shadow-f1-glow" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with Animation */}
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="text-4xl">⚡</div>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-f1-red f1-glow font-f1">
                  RaceSafe DeFi
                </h1>
                <p className="text-xs text-f1-silver hidden sm:block">
                  MEV Protection System
                </p>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item, index) => {
                const isActive = router.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={item.path}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative px-5 py-2.5 rounded-lg font-mono text-sm font-semibold transition-all cursor-pointer overflow-hidden
                          ${
                            isActive
                              ? "bg-f1-red/20 text-white border-2 border-[#e10600] shadow-f1-glow"
                              : "text-f1-silver hover:text-white hover:bg-black/40 border-2 border-transparent"
                          }
                        `}
                      >
                        {/* Active state background glow */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-f1-red/30 via-transparent to-f1-red/30 rounded-lg"
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}

                        {/* Left border accent for active */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-[#e10600] rounded-l-lg"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        <span
                          className={`relative z-10 ${
                            isActive ? "font-bold" : ""
                          }`}
                        >
                          {item.name}
                        </span>

                        {/* Bottom red line for active */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#e10600] rounded-b-lg"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Connect Wallet Button */}
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(225, 6, 0, 0.8)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={isConnected ? disconnectWallet : connectWallet}
              disabled={isConnecting}
              className={`px-4 py-2 bg-gradient-to-r from-f1-red to-f1-dark-red text-white rounded-lg font-bold text-sm shadow-f1-glow hidden sm:block transition-opacity border-2 border-f1-red/60 ${
                isConnecting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="mr-2">
                {isConnected ? "✅" : isConnecting ? "⏳" : "🔐"}
              </span>
              {isConnecting
                ? "Connecting..."
                : isConnected
                ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                : "Connect Wallet"}
            </motion.button>
          </div>
        </div>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg max-w-md text-center text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Loading Progress Bar */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-f1-red via-f1-red to-f1-red/80 shadow-f1-glow"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e10600]/50 to-transparent"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Racing Stripe Under Nav (when not loading) */}
        {!isLoading && (
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-f1-red/50 to-transparent"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24">{children}</main>

      {/* Floating Particles Effect */}
      {mounted &&
        [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed w-2 h-2 bg-f1-red rounded-full opacity-30 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: "transform",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative mt-20 glass-morphism border-t-2 border-f1-red"
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="text-4xl">⚡</div>
                </motion.div>
                <h3 className="text-2xl font-bold text-f1-red f1-glow">
                  RaceSafe DeFi
                </h3>
              </div>
              <p className="text-f1-silver text-sm mb-4 max-w-md">
                Formula-1 grade MEV protection for your DeFi transactions. Built
                with speed, precision, and security in mind.
              </p>
              <div className="flex gap-4">
                {["🐦", "💬", "📱", "📧"].map((icon, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-xl hover:bg-f1-red/20 transition-colors"
                  >
                    {icon}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <motion.span
                        whileHover={{ x: 5, color: "#E10600" }}
                        className="text-f1-silver text-sm hover:text-f1-red transition-colors cursor-pointer"
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-f1-silver">
                <li className="hover:text-f1-red transition-colors cursor-pointer">
                  📖 Documentation
                </li>
                <li className="hover:text-f1-red transition-colors cursor-pointer">
                  🔒 Security Audit
                </li>
                <li className="hover:text-f1-red transition-colors cursor-pointer">
                  💻 GitHub
                </li>
                <li className="hover:text-f1-red transition-colors cursor-pointer">
                  ❓ FAQ
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-f1-red/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-f1-silver text-sm font-mono mb-1">
                  🏎️ RaceSafe DeFi - Formula-1 MEV Guard Dashboard
                </p>
                <p className="text-xs text-f1-silver/70">
                  Powered by Flashbots & Hardhat | Secured by Advanced MEV
                  Protection
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-f1-silver">System Online</span>
                </div>
                {mounted && (
                  <div className="text-xs text-f1-silver">
                    Block:{" "}
                    <span className="text-f1-red font-mono">{blockNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-f1-silver/50">
                © 2025 RaceSafe DeFi. All rights reserved. MIT License.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Racing Stripe */}
        <div className="h-2 racing-stripes bg-f1-red/20" />
      </motion.footer>
    </div>
  );
}
