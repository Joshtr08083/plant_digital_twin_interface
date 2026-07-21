import { useEffect, useRef, useState } from "react";

interface Reading {
    timestamp: string;
    raw: string;
    data: object;
    status: number;
    error: string;
}


export interface DataPoint {
    time: string;
    data: object;
}

export interface ConnectionStatus {
  ok: boolean;
  message: string;
}

interface LatestReadingsResponse {
  readings: Reading[];
}


export function useWebsockets(windowSeconds: number = 5) {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>({ok: false, message: 'Initalise'});
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {

        fetch('/api/latest')
            .then((r) => r.json() as Promise<LatestReadingsResponse>)
            .then(({ readings }) => {
                const seeded: DataPoint[] = readings
                    .filter((r) => r.status === 200 && r.data !== null)
                    .map((r) => ({ time:r.timestamp, data:r.data}));
                setDataPoints(seeded.reverse());
            });
        
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socket = new WebSocket(`${protocol}://${window.location.host}/ws/live/`);
        wsRef.current = socket;

        socket.onmessage = (event: MessageEvent<string>) => {
            const reading: Reading = JSON.parse(event.data);

            if (reading.status === 200 && reading.data !== null) {
                setStatus({ok: true, message: 'Live'});
                setDataPoints((prev) => {
                    const cutoff = Date.now() - windowSeconds * 1000;
                    const next = [...prev, { time: reading.timestamp, data: reading.data}];
                    return next.filter((p) => new Date(p.time).getTime() >= cutoff);
                });
            } else {
                setStatus({ ok: false, message: `Sensor error (${reading.status}): ${reading.error}` });
            }
        }

        socket.onopen = () => console.log('WS connected, readyState:', socket.readyState);
        socket.onerror = (err) => console.log('WS error:', err);
        socket.onclose = () => setStatus({ok: false, message: 'Disconnected'})
        
        return () => socket.close();
    }, [windowSeconds])

    return { dataPoints, status }
}