// SecureDApp Vulnerability Database
// Source: https://github.com/securedapp-github/Securedapp_v2/src/pageComponents/vulnerability/vulnerability.data.js

export interface Vulnerability {
  detector: string;
  description: string;
  impact:
    | "Critical"
    | "High"
    | "Medium"
    | "Low"
    | "Informational"
    | "Optimization";
  confidence: "High" | "Medium" | "Low";
}

// ============================================================================
// CRITICAL VULNERABILITIES
// ============================================================================
export const CRITICAL_VULNERABILITIES: Vulnerability[] = [
  {
    detector: "abiencoderv2-array",
    description: "Storage abiencoderv2 array",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "arbitrary-send-erc20",
    description: "transferFrom uses arbitrary from",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "array-by-reference",
    description: "Modifying storage array by value",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "encode-packed-collision",
    description: "ABI encodePacked Collision",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "incorrect-shift",
    description: "The order of parameters in a shift instruction is incorrect",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "multiple-constructors",
    description: "Multiple constructor schemes",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "name-reused",
    description: "Contract's name reused",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "protected-vars",
    description: "Detected unprotected variables",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "public-mappings-nested",
    description: "Public mappings with nested variables",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "rtlo",
    description: "Right-To-Left-Override control character is used",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "shadowing-state",
    description: "State variables shadowing",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "suicidal",
    description: "Functions allowing anyone to destruct the contract",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "uninitialized-state",
    description: "Uninitialized state variables",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "uninitialized-storage",
    description: "Uninitialized storage variables",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "unprotected-upgrade",
    description: "Unprotected upgradeable contract",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "arbitrary-send-erc20-permit",
    description: "transferFrom uses arbitrary from with permit",
    impact: "Critical",
    confidence: "High",
  },
  {
    detector: "arbitrary-send-eth",
    description: "Functions that send Ether to arbitrary destinations",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "controlled-array-length",
    description: "Tainted array length assignment",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "controlled-delegatecall",
    description: "Controlled delegatecall destination",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "delegatecall-loop",
    description: "Payable functions using delegatecall inside a loop",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "incorrect-exp",
    description: "Incorrect exponentiation",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "incorrect-return",
    description: "If a return is incorrectly used in assembly mode",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "msg-value-loop",
    description: "msg.value inside a loop",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "reentrancy-eth",
    description: "Reentrancy vulnerabilities (theft of ethers)",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "return-leave",
    description: "If a return is used instead of a leave",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "storage-array",
    description: "Signed storage integer array compiler bug",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "unchecked-transfer",
    description: "Unchecked tokens transfer",
    impact: "Critical",
    confidence: "Medium",
  },
  {
    detector: "weak-prng",
    description: "Weak PRNG",
    impact: "Critical",
    confidence: "Medium",
  },
];

// ============================================================================
// HIGH VULNERABILITIES (mapped from "High" severity in SecureDApp)
// ============================================================================
export const HIGH_VULNERABILITIES: Vulnerability[] = [
  {
    detector: "codex",
    description: "Use Codex to find vulnerabilities",
    impact: "High",
    confidence: "Low",
  },
  {
    detector: "domain-separator-collision",
    description: "Detects ERC20 tokens with DOMAIN_SEPARATOR collision",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "enum-conversion",
    description: "Detect dangerous enum conversion",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "erc20-interface",
    description: "Incorrect ERC20 interfaces",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "erc721-interface",
    description: "Incorrect ERC721 interfaces",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "incorrect-equality",
    description: "Dangerous strict equalities",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "locked-ether",
    description: "Contracts that lock ether",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "mapping-deletion",
    description: "Deletion on mapping containing a structure",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "shadowing-abstract",
    description: "State variables shadowing from abstract contracts",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "tautological-compare",
    description: "Comparing a variable to itself always returns true or false",
    impact: "High",
    confidence: "High",
  },
  {
    detector: "tautology",
    description: "Tautology or contradiction",
    impact: "High",
    confidence: "High",
  },
];

// ============================================================================
// MEDIUM VULNERABILITIES
// ============================================================================
export const MEDIUM_VULNERABILITIES: Vulnerability[] = [
  {
    detector: "write-after-write",
    description: "Unused write",
    impact: "Medium",
    confidence: "High",
  },
  {
    detector: "boolean-cst",
    description: "Misuse of Boolean constant",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "constant-function-asm",
    description: "Constant functions using assembly code",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "constant-function-state",
    description: "Constant functions changing the state",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "divide-before-multiply",
    description: "Imprecise arithmetic operations order",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "out-of-order-retryable",
    description: "Out-of-order retryable transactions",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "reentrancy-no-eth",
    description: "Reentrancy vulnerabilities (no theft of ethers)",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "reused-constructor",
    description: "Reused base constructor",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "tx-origin",
    description: "Dangerous usage of tx.origin",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "unchecked-lowlevel",
    description: "Unchecked low-level calls",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "unchecked-send",
    description: "Unchecked send",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "uninitialized-local",
    description: "Uninitialized local variables",
    impact: "Medium",
    confidence: "Medium",
  },
  {
    detector: "unused-return",
    description: "Unused return values",
    impact: "Medium",
    confidence: "Medium",
  },
];

// ============================================================================
// LOW VULNERABILITIES
// ============================================================================
export const LOW_VULNERABILITIES: Vulnerability[] = [
  {
    detector: "incorrect-modifier",
    description: "Modifiers that can return the default value",
    impact: "Low",
    confidence: "High",
  },
  {
    detector: "shadowing-builtin",
    description: "Built-in symbol shadowing",
    impact: "Low",
    confidence: "High",
  },
  {
    detector: "shadowing-local",
    description: "Local variables shadowing",
    impact: "Low",
    confidence: "High",
  },
  {
    detector: "uninitialized-fptr-cst",
    description: "Uninitialized function pointer calls in constructors",
    impact: "Low",
    confidence: "High",
  },
  {
    detector: "variable-scope",
    description: "Local variables used prior their declaration",
    impact: "Low",
    confidence: "High",
  },
  {
    detector: "void-cst",
    description: "Constructor called not implemented",
    impact: "Low",
    confidence: "High",
  },
  {
    detector: "calls-loop",
    description: "Multiple calls in a loop",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "events-access",
    description: "Missing Events Access Control",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "events-maths",
    description: "Missing Events Arithmetic",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "incorrect-unary",
    description: "Dangerous unary expressions",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "missing-zero-check",
    description: "Missing Zero Address Validation",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "reentrancy-benign",
    description: "Benign reentrancy vulnerabilities",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "reentrancy-events",
    description: "Reentrancy vulnerabilities leading to out-of-order Events",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "return-bomb",
    description: "A low level callee may consume all callers gas unexpectedly",
    impact: "Low",
    confidence: "Medium",
  },
  {
    detector: "timestamp",
    description: "Dangerous usage of block.timestamp",
    impact: "Low",
    confidence: "Medium",
  },
];

// ============================================================================
// INFORMATIONAL VULNERABILITIES
// ============================================================================
export const INFORMATIONAL_VULNERABILITIES: Vulnerability[] = [
  {
    detector: "assembly",
    description: "Assembly usage",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "assert-state-change",
    description: "Assert state change",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "boolean-equal",
    description: "Comparison to boolean constant",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "cyclomatic-complexity",
    description: "Functions with high (> 11) cyclomatic complexity",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "deprecated-standards",
    description: "Deprecated Solidity Standards",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "erc20-indexed",
    description: "Un-indexed ERC20 event parameters",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "function-init-state",
    description: "Function initializing state variables",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "incorrect-using-for",
    description: "Incorrect using-for statement usage",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "low-level-calls",
    description: "Low level calls",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "missing-inheritance",
    description: "Missing inheritance",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "naming-convention",
    description: "Conformity to Solidity naming conventions",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "pragma",
    description: "If different pragma directives are used",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "redundant-statements",
    description: "Redundant statements",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "solc-version",
    description: "Incorrect Solidity version",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "unimplemented-functions",
    description: "Unimplemented functions",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "unused-import",
    description: "Detects unused imports",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "unused-state",
    description: "Unused state variables",
    impact: "Informational",
    confidence: "High",
  },
  {
    detector: "costly-loop",
    description: "Costly operations in a loop",
    impact: "Informational",
    confidence: "Medium",
  },
  {
    detector: "dead-code",
    description: "Functions that are not used",
    impact: "Informational",
    confidence: "Medium",
  },
  {
    detector: "reentrancy-unlimited-gas",
    description: "Reentrancy vulnerabilities through send and transfer",
    impact: "Informational",
    confidence: "Medium",
  },
  {
    detector: "too-many-digits",
    description: "Conformance to numeric notation best practices",
    impact: "Informational",
    confidence: "Medium",
  },
];

// ============================================================================
// GAS OPTIMIZATION VULNERABILITIES
// ============================================================================
export const GAS_OPTIMIZATION_VULNERABILITIES: Vulnerability[] = [
  {
    detector: "cache-array-length",
    description: "Detects for loops not caching storage array length",
    impact: "Optimization",
    confidence: "High",
  },
  {
    detector: "constable-states",
    description: "State variables that could be declared constant",
    impact: "Optimization",
    confidence: "High",
  },
  {
    detector: "external-function",
    description: "Public function that could be declared external",
    impact: "Optimization",
    confidence: "High",
  },
  {
    detector: "immutable-states",
    description: "State variables that could be declared immutable",
    impact: "Optimization",
    confidence: "High",
  },
  {
    detector: "var-read-using-this",
    description: "Contract reads its own variable using this",
    impact: "Optimization",
    confidence: "High",
  },
];

// ============================================================================
// GROUPED EXPORT FOR EASY ACCESS
// ============================================================================
export const VULNERABILITY_DATABASE = {
  critical: CRITICAL_VULNERABILITIES,
  high: HIGH_VULNERABILITIES,
  medium: MEDIUM_VULNERABILITIES,
  low: LOW_VULNERABILITIES,
  informational: INFORMATIONAL_VULNERABILITIES,
  gas: GAS_OPTIMIZATION_VULNERABILITIES,
};

export const VULNERABILITY_DETAILS = {
  critical: {
    count: CRITICAL_VULNERABILITIES.length,
    items: CRITICAL_VULNERABILITIES,
    label: "Critical",
    icon: "⚠️",
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    severity: "CRITICAL - Immediate action required",
  },
  high: {
    count: HIGH_VULNERABILITIES.length,
    items: HIGH_VULNERABILITIES,
    label: "High",
    icon: "🔴",
    color: "text-orange-500",
    bgColor: "bg-orange-500/20",
    severity: "HIGH - Review and fix before production",
  },
  medium: {
    count: MEDIUM_VULNERABILITIES.length,
    items: MEDIUM_VULNERABILITIES,
    label: "Medium",
    icon: "🟡",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
    severity: "MEDIUM - Address in next release",
  },
  low: {
    count: LOW_VULNERABILITIES.length,
    items: LOW_VULNERABILITIES,
    label: "Low",
    icon: "🔵",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    severity: "LOW - Consider for future improvements",
  },
  informational: {
    count: INFORMATIONAL_VULNERABILITIES.length,
    items: INFORMATIONAL_VULNERABILITIES,
    label: "Informational",
    icon: "ℹ️",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/20",
    severity: "INFO - For awareness",
  },
  gas: {
    count: GAS_OPTIMIZATION_VULNERABILITIES.length,
    items: GAS_OPTIMIZATION_VULNERABILITIES,
    label: "Gas Optimization",
    icon: "⛽",
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    severity: "GAS - Optimization opportunities",
  },
};
