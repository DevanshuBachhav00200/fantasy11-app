import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:5000';

export function useMatchSocket(matchId) {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [liveScore, setLiveScore] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const connect = () => {
      ws.current = new WebSocket(`${WS_URL}?matchId=${matchId}`);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log(`WS connected for match ${matchId}`);
      };

      ws.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent(data);

          if (data.type === 'LIVE_UPDATE') {
            setLiveScore(prev => ({
              ...prev,
              lastBall: data,
              commentary: [data.commentary, ...(prev?.commentary || [])].slice(0, 20)
            }));
          }
        } catch {}
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };

      ws.current.onerror = () => ws.current?.close();
    };

    connect();
    return () => ws.current?.close();
  }, [matchId]);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, lastEvent, liveScore, send };
}
