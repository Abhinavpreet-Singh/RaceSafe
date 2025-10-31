import WebSocket from 'ws';
import { WebSocketMessage } from '../types';

class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Set<WebSocket> = new Set();

  initialize(server: any): void {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('✅ New WebSocket client connected');
      this.clients.add(ws);

      // Send welcome message
      this.send(ws, {
        type: 'connection',
        data: { message: 'Connected to RaceSafe MEV Guard' },
        timestamp: Date.now(),
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('❌ WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('🔌 WebSocket server initialized');
  }

  private handleMessage(ws: WebSocket, data: any): void {
    // Handle incoming messages from clients
    console.log('Received message:', data);

    // Echo back or process based on message type
    if (data.type === 'ping') {
      this.send(ws, {
        type: 'pong',
        data: {},
        timestamp: Date.now(),
      });
    }
  }

  send(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  broadcastToUser(userId: string, message: WebSocketMessage): void {
    // In production, you'd track user IDs with WebSocket connections
    // For now, just broadcast to all
    this.broadcast(message);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  close(): void {
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
    
    console.log('🔌 WebSocket server closed');
  }
}

export const websocketService = new WebSocketService();
