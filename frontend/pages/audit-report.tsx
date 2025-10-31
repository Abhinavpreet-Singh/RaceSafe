import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  VULNERABILITY_DETAILS,
  VULNERABILITY_DATABASE,
} from "@/data/vulnerabilities";

interface VulnerabilityCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  gas: number;
}

interface ContractAudit {
  contractAddress: string;
  contractName: string;
  compilerVersion: string;
  lines: number;
  audited: string;
  score: number;
  vulnerabilities: VulnerabilityCount;
}

export default function AuditReport() {
  const [auditResults, setAuditResults] = useState<ContractAudit | null>(null);
  const [contractCode, setContractCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "summary" | "vulnerabilities" | "details"
  >("summary");

  // Calculate security score based on EXACT SecureDApp methodology
  // Formula: score = 5 - ((critical + high + medium) / 30) * 5
  // Then scale from 0-5 to 0-100 by multiplying by 20
  // Reference: https://github.com/securedapp-github/Securedapp_v2/src/AuditExpress/calculateSecurityScore.ts
  const calculateScore = (vulnerabilities: VulnerabilityCount): number => {
    const criticalCount = Number(vulnerabilities.critical) || 0;
    const highCount = Number(vulnerabilities.high) || 0;
    const mediumCount = Number(vulnerabilities.medium) || 0;

    // Calculate the total number of critical, high, and medium vulnerabilities
    const totalVulnerabilities = criticalCount + highCount + mediumCount;

    // Apply the formula: score = 5 - ((critical + high + medium) / 30) * 5
    let score = 5 - (totalVulnerabilities / 30) * 5;

    // Scale the score from 0-5 to 0-100
    const scaledScore = score * 20;

    // Ensure the score is within the 0-100 range
    return Math.max(0, Math.min(100, scaledScore));
  };

  // Get score color based on SecureDApp scoring (0-100 scale)
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"; // EXCELLENT
    if (score >= 75) return "text-yellow-500"; // GOOD
    if (score >= 60) return "text-orange-500"; // AVERAGE
    return "text-red-500"; // POOR
  };

  // Get score badge color
  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 border-green-500/50";
    if (score >= 75) return "bg-yellow-500/20 border-yellow-500/50";
    if (score >= 60) return "bg-orange-500/20 border-orange-500/50";
    return "bg-red-500/20 border-red-500/50";
  };

  // Get score description
  const getScoreDescription = (score: number): string => {
    if (score >= 90) return "EXCELLENT";
    if (score >= 75) return "GOOD";
    if (score >= 60) return "AVERAGE";
    return "POOR";
  };

  const handleAnalyze = async () => {
    if (!contractCode.trim()) {
      alert("Please paste contract code");
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      // Mock vulnerability data
      const mockVulnerabilities: VulnerabilityCount = {
        critical: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 5),
        medium: Math.floor(Math.random() * 8),
        low: Math.floor(Math.random() * 5),
        informational: Math.floor(Math.random() * 10),
        gas: Math.floor(Math.random() * 15),
      };

      const score = calculateScore(mockVulnerabilities);

      setAuditResults({
        contractAddress: "0x" + Math.random().toString(16).slice(2, 42),
        contractName: extractContractName(contractCode),
        compilerVersion: extractCompilerVersion(contractCode),
        lines: contractCode.split("\n").length,
        audited: new Date().toLocaleDateString(),
        score,
        vulnerabilities: mockVulnerabilities,
      });

      setIsAnalyzing(false);
    }, 3000);
  };

  const extractContractName = (code: string): string => {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : "Unknown";
  };

  const extractCompilerVersion = (code: string): string => {
    const match = code.match(/pragma\s+solidity\s+([\^~]?[\d.]+)/);
    return match ? match[1] : "Unknown";
  };

  return (
    <div className="min-h-screen bg-f1-black text-f1-silver pt-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-f1-black to-transparent">
        <nav className="flex justify-between items-center px-6 py-4">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-f1-red"
            >
              🏎️ RaceSafe
            </motion.div>
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 border border-f1-red text-f1-red rounded-lg hover:bg-f1-red/10"
              >
                Dashboard
              </motion.button>
            </Link>
            <Link href="/audit-report">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-f1-red text-white rounded-lg"
              >
                Audit
              </motion.button>
            </Link>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-f1-red mb-4">
            🛡️ Smart Contract Audit
          </h1>
          <p className="text-f1-silver text-lg">
            Analyze your Solidity contracts for vulnerabilities and security
            issues
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 glass-morphism rounded-2xl p-6 f1-border-glow"
          >
            <h2 className="text-2xl font-bold text-f1-red mb-4">
              📝 Upload Contract
            </h2>
            <textarea
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              placeholder="Paste your flattened Solidity contract code here..."
              className="w-full h-64 bg-f1-black/50 border border-f1-gray rounded-lg p-4 text-f1-silver placeholder-f1-gray/50 focus:outline-none focus:border-f1-red resize-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-f1-red to-orange-600 text-white font-bold rounded-lg hover:shadow-f1-glow disabled:opacity-50"
            >
              {isAnalyzing ? "🔍 Analyzing..." : "🚀 Analyze Contract"}
            </motion.button>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-sm text-blue-200">
              <p className="font-bold mb-2">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Contract must be flattened</li>
                <li>Check pragma solidity version</li>
                <li>Remove all import statements</li>
                <li>Ensure proper contract formatting</li>
              </ul>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {!auditResults ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism rounded-2xl p-12 f1-border-glow text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  📊
                </motion.div>
                <h3 className="text-2xl font-bold text-f1-red mb-2">
                  Ready to Audit
                </h3>
                <p className="text-f1-silver">
                  Paste your smart contract code and click "Analyze Contract" to
                  generate a security report
                </p>
              </motion.div>
            ) : (
              <>
                {/* Score Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`glass-morphism rounded-2xl p-8 f1-border-glow ${getScoreBadgeColor(
                    auditResults.score
                  )}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-f1-red">
                      🎖️ Security Score
                    </h2>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`text-6xl font-bold ${getScoreColor(
                        auditResults.score
                      )}`}
                    >
                      {auditResults.score.toFixed(1)}/100
                    </motion.div>
                  </div>

                  <div className="w-full bg-f1-black/50 rounded-full h-4 overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(auditResults.score / 100) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        auditResults.score >= 90
                          ? "bg-green-500"
                          : auditResults.score >= 75
                          ? "bg-yellow-500"
                          : auditResults.score >= 60
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-f1-silver">Contract:</span>
                      <p className="font-mono text-green-400">
                        {auditResults.contractName}
                      </p>
                    </div>
                    <div>
                      <span className="text-f1-silver">Compiler:</span>
                      <p className="font-mono text-blue-400">
                        {auditResults.compilerVersion}
                      </p>
                    </div>
                    <div>
                      <span className="text-f1-silver">Lines of Code:</span>
                      <p className="font-mono text-purple-400">
                        {auditResults.lines}
                      </p>
                    </div>
                    <div>
                      <span className="text-f1-silver">Audited:</span>
                      <p className="font-mono text-cyan-400">
                        {auditResults.audited}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Vulnerability Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-morphism rounded-2xl p-6 f1-border-glow"
                >
                  <h3 className="text-xl font-bold text-f1-red mb-4">
                    📊 Vulnerability Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <VulnerabilityCard
                      label="Critical"
                      count={auditResults.vulnerabilities.critical}
                      color="text-red-500"
                      bgColor="bg-red-500/20"
                    />
                    <VulnerabilityCard
                      label="High"
                      count={auditResults.vulnerabilities.high}
                      color="text-orange-500"
                      bgColor="bg-orange-500/20"
                    />
                    <VulnerabilityCard
                      label="Medium"
                      count={auditResults.vulnerabilities.medium}
                      color="text-yellow-500"
                      bgColor="bg-yellow-500/20"
                    />
                    <VulnerabilityCard
                      label="Low"
                      count={auditResults.vulnerabilities.low}
                      color="text-blue-500"
                      bgColor="bg-blue-500/20"
                    />
                    <VulnerabilityCard
                      label="Info"
                      count={auditResults.vulnerabilities.informational}
                      color="text-cyan-500"
                      bgColor="bg-cyan-500/20"
                    />
                    <VulnerabilityCard
                      label="Gas"
                      count={auditResults.vulnerabilities.gas}
                      color="text-green-500"
                      bgColor="bg-green-500/20"
                    />
                  </div>
                </motion.div>

                {/* Detailed Vulnerability Analysis */}
                <DetailedVulnerabilityDisplay
                  vulnerabilities={auditResults.vulnerabilities}
                />

                {/* Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-morphism rounded-2xl p-6 f1-border-glow"
                >
                  <h3 className="text-xl font-bold text-f1-red mb-4">
                    💡 Recommendations
                  </h3>
                  <div className="space-y-3">
                    {/* Score assessment */}
                    <div
                      className={`p-3 rounded-lg ${
                        auditResults.score >= 90
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : auditResults.score >= 75
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                          : auditResults.score >= 60
                          ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      }`}
                    >
                      📊 Your Security Score is{" "}
                      <strong>{getScoreDescription(auditResults.score)}</strong>
                    </div>

                    {auditResults.vulnerabilities.critical > 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        ⚠️ Critical issues found! Immediate action required
                        before deployment.
                      </div>
                    )}
                    {auditResults.vulnerabilities.high > 0 && (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400">
                        🔸 High severity issues detected. Review and fix before
                        production.
                      </div>
                    )}
                    {auditResults.vulnerabilities.medium > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400">
                        🟡 Medium severity issues found. Consider addressing in
                        next release.
                      </div>
                    )}
                    {auditResults.vulnerabilities.gas > 0 && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                        ⛽ Gas optimization opportunities available (
                        {auditResults.vulnerabilities.gas} found).
                      </div>
                    )}
                    {auditResults.score >= 90 && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                        ✅ Strong security posture! Contract is well-protected
                        and ready for deployment.
                      </div>
                    )}

                    {/* General guidance */}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 mt-4">
                      <p className="font-semibold mb-1">
                        📚 SecureDApp Methodology
                      </p>
                      <p className="text-xs">
                        Score calculated based on severity-weighted
                        vulnerabilities (Critical + High + Medium). To improve
                        your score, address the identified issues and leverage
                        the remediation solutions provided.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Download Report Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-f1-red to-orange-600 text-white font-bold rounded-lg hover:shadow-f1-glow flex items-center justify-center gap-2"
                >
                  📥 Download Full Report
                </motion.button>

                {/* New Analysis Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAuditResults(null);
                    setContractCode("");
                  }}
                  className="w-full px-6 py-3 border-2 border-f1-red text-f1-red font-bold rounded-lg hover:bg-f1-red/10"
                >
                  🔄 Analyze Another Contract
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DETAILED VULNERABILITIES DISPLAY COMPONENT
// ============================================================================
interface DetailedVulnerabilityDisplayProps {
  vulnerabilities: VulnerabilityCount;
}

function DetailedVulnerabilityDisplay({
  vulnerabilities,
}: DetailedVulnerabilityDisplayProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "critical"
  );

  const categories = [
    { key: "critical", label: "Critical", icon: "⚠️", color: "red" },
    { key: "high", label: "High", icon: "🔴", color: "orange" },
    { key: "medium", label: "Medium", icon: "🟡", color: "yellow" },
    { key: "low", label: "Low", icon: "🔵", color: "blue" },
    { key: "informational", label: "Informational", icon: "ℹ️", color: "cyan" },
    { key: "gas", label: "Gas Optimization", icon: "⛽", color: "green" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-morphism rounded-2xl p-6 f1-border-glow"
    >
      <h3 className="text-2xl font-bold text-f1-red mb-6">
        📋 Detailed Vulnerability Analysis
      </h3>

      <div className="space-y-3">
        {categories.map((category) => {
          const categoryData =
            VULNERABILITY_DETAILS[
              category.key as keyof typeof VULNERABILITY_DETAILS
            ];
          const count =
            vulnerabilities[category.key as keyof VulnerabilityCount];
          const isExpanded = expandedCategory === category.key;

          return (
            <motion.div
              key={category.key}
              className={`rounded-lg border-2 overflow-hidden ${
                count > 0
                  ? `border-${category.color}-500/50 bg-${category.color}-500/10`
                  : "border-gray-500/30 bg-gray-500/5"
              }`}
            >
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category.key)
                }
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-black/30 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <p className="font-bold text-f1-silver">{category.label}</p>
                    <p className={`text-sm text-${category.color}-400`}>
                      {categoryData.severity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold text-${category.color}-400`}
                  >
                    {count}
                  </span>
                  <span className="text-f1-silver">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>
              </button>

              {isExpanded && count > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-f1-black/50 p-4 border-t border-${category.color}-500/30"
                >
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categoryData.items.slice(0, count).map((vuln, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-f1-black/70 rounded border-l-2 border-${category.color}-400"
                      >
                        <p className="font-mono text-xs text-${category.color}-300">
                          {vuln.detector}
                        </p>
                        <p className="text-xs text-f1-silver mt-1">
                          {vuln.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Confidence: {vuln.confidence}
                        </p>
                      </div>
                    ))}
                  </div>

                  {count <= categoryData.items.length && (
                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-600">
                      Showing {count} of {categoryData.items.length} known{" "}
                      {category.label.toLowerCase()} issues
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-sm text-blue-200">
        <p className="font-bold mb-2">📚 Vulnerability Database</p>
        <p className="text-xs">
          All vulnerabilities are mapped from SecureDApp's official Solidity
          vulnerability database. Click on categories to see detailed
          descriptions and confidence levels.
        </p>
      </div>
    </motion.div>
  );
}

interface VulnerabilityCardProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

function VulnerabilityCard({
  label,
  count,
  color,
  bgColor,
}: VulnerabilityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${bgColor} border border-current rounded-lg p-4 text-center`}
    >
      <div className={`text-3xl font-bold ${color}`}>{count}</div>
      <div className="text-sm text-f1-silver mt-1">{label}</div>
    </motion.div>
  );
}
