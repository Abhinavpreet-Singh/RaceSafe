export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  data: string;
  timestamp: number;
  blockNumber?: number;
}

export interface MEVDetection {
  transactionHash: string;
  mevType: 'sandwich' | 'frontrun' | 'backrun' | 'liquidation' | 'arbitrage' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  estimatedProfit?: string;
  targetedUser?: string;
  timestamp: number;
}

export interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
  transactions: Transaction[];
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas?: string;
}

export interface GasPrice {
  slow: string;
  standard: string;
  fast: string;
  instant: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  type: 'mev_detected' | 'high_gas' | 'contract_interaction' | 'large_transaction';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  data: any;
  timestamp: number;
}

export interface UserAnalytics {
  address: string;
  totalTransactions: number;
  protectedTransactions: number;
  mevSaved: string;
  avgGasSaved: string;
  lastActive: number;
}

export interface PerformanceMetrics {
  totalBlocksMonitored: number;
  totalMEVDetected: number;
  totalValueProtected: string;
  avgResponseTime: number;
  systemUptime: number;
  activeUsers: number;
}

export interface WebSocketMessage {
  type: 'block' | 'transaction' | 'mev_alert' | 'gas_update' | 'metrics' | 'connection' | 'pong';
  data: any;
  timestamp: number;
}
