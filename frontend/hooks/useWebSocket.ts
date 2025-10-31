import { useState, useEffect, useCallback, useRef } from 'react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  timestamp: number;
}

interface FlaggedTransaction extends Transaction {
  attackType: string;
  riskScore: number;
  estimatedLoss: string;
  mitigation: string;
  relatedTxs: string[];
}

interface Stats {
  scanner?: {
    isScanning: boolean;
    pendingTxs: number;
    recentTxs: number;
  };
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [flaggedTxs, setFlaggedTxs] = useState<FlaggedTransaction[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081';
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'init':
              setTransactions(message.data.live || []);
              setFlaggedTxs(message.data.flagged || []);
              break;
              
            case 'transaction':
              setTransactions(prev => [...prev.slice(-99), message.data]);
              break;
              
            case 'flagged':
              setFlaggedTxs(prev => [...prev.slice(-99), message.data]);
              // Show notification
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification('🚨 MEV Attack Detected!', {
                    body: `${message.data.attackType} - Risk: ${message.data.riskScore}/100`,
                    icon: '/favicon.ico',
                  });
                }
              }
              break;
              
            case 'stats':
              setStats(message.data);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    connected,
    transactions,
    flaggedTxs,
    stats,
  };
}
