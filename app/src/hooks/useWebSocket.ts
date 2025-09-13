import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';

interface WebSocketMessage {
  type: 'price_update' | 'mint_event' | 'phase_change' | 'auction_end';
  data: Record<string, unknown>;
  timestamp: number;
}

/**
 * Real-time WebSocket hook for live auction updates
 * Provides instant price updates and mint notifications
 */
export function useWebSocket(contractAddress?: string) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!contractAddress || !process.env.NEXT_PUBLIC_WS_URL) return;

    try {
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WS_URL}?contract=${contractAddress}&chain=${chainId}`
      );

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe to contract events
        ws.send(JSON.stringify({
          type: 'subscribe',
          contract: contractAddress,
          chain: chainId,
          wallet: address,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'price_update':
              // Price updates are handled by the component
              break;
            case 'mint_event':
              // Show notification for new mints
              if (message.data.minter !== address) {
                showNotification(`${message.data.quantity} NFTs minted!`);
              }
              break;
            case 'phase_change':
              showNotification(`Auction phase changed to ${message.data.phase}`);
              break;
            case 'auction_end':
              showNotification('Auction has ended!');
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Exponential backoff reconnection
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [contractAddress, chainId, address]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect: connect,
  };
}

function showNotification(message: string) {
  // Check if browser supports notifications
  if (!('Notification' in window)) return;

  // Request permission if needed
  if (Notification.permission === 'granted') {
    new Notification('DutchBasar', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('DutchBasar', {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    });
  }
}
