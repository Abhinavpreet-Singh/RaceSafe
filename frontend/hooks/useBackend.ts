import { useEffect, useState, useCallback } from 'react';

interface BackendData {
  block?: any;
  transaction?: any;
  mevAlert?: any;
  gasUpdate?: any;
  metrics?: any;
}

export function useBackend() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<BackendData>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8081');

    websocket.onopen = () => {
      console.log('✅ Connected to backend');
      setConnected(true);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      setData((prev) => ({
        ...prev,
        [message.type]: message.data,
      }));
    };

    websocket.onclose = () => {
      console.log('❌ Disconnected from backend');
      setConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const api = useCallback(async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }, []);

  return {
    ws,
    connected,
    data,
    api,
  };
}
