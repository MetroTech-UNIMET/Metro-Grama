'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useEffectEvent } from 'react';

import { getAuthToken } from '@/utils/authToken';

type WebsocketEventHandlers = Record<string, (payload: any, socket: WebSocket) => void>;

interface UseWebsocketOptions {
  namespace: string;
  onConnect?: (socket: WebSocket) => void;
  onDisconnect?: (socket: WebSocket) => void;
  onError?: (error: Event | Error, socket: WebSocket) => void;
  onEvents?: WebsocketEventHandlers;
}

function buildWebsocketUrl(namespace: string) {
  const baseUrl =  import.meta.env.VITE_WS_URL;
  if (!baseUrl) throw new Error('Setea el .env del websocket');

  const normalizedNamespace = namespace.startsWith('/') ? namespace : `/${namespace}`;

  try {
    const url = new URL(baseUrl);

    // Map http(s) -> ws(s). Keep ws/wss if already provided.
    if (url.protocol === 'http:') url.protocol = 'ws:';
    else if (url.protocol === 'https:') url.protocol = 'wss:';

    // Ensure single slash when joining pathname and namespace
    const basePath = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
    url.pathname = `${basePath}${normalizedNamespace}`;

    const token = getAuthToken();
    if (token) {
      url.searchParams.set('token', token);
    }

    return url.toString();
  } catch (err) {
    throw new Error(`Invalid NEXT_PUBLIC_WS_URL: ${baseUrl}`);
  }
}

export function useWebsocket({
  namespace,
  onConnect,
  onDisconnect,
  onError,
  onEvents = {},
}: UseWebsocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);

  const handleConnect = useEffectEvent((socket: WebSocket) => {
    onConnect?.(socket);
  });

  const handleDisconnect = useEffectEvent((socket: WebSocket) => {
    onDisconnect?.(socket);
  });

  const handleError = useEffectEvent((event: Event | Error, socket: WebSocket) => {
    onError?.(event, socket);
  });

  const handleMessage = useEffectEvent((event: MessageEvent, socket: WebSocket) => {
    if (!event.data) return;

    try {
      const parsed = JSON.parse(event.data);
      const eventName = parsed?.event;
      const payload = parsed?.payload;

      if (eventName && onEvents?.[eventName]) {
        onEvents[eventName](payload, socket);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to parse websocket message');
      handleError(error, socket);
    }
  });

  useEffect(() => {
    const socket = new WebSocket(buildWebsocketUrl(namespace));
    socketRef.current = socket;

    const openListener = () => handleConnect(socket);
    const closeListener = () => handleDisconnect(socket);
    const errorListener = (event: Event) => handleError(event, socket);
    const messageListener = (event: MessageEvent) => handleMessage(event, socket);

    socket.addEventListener('open', openListener);
    socket.addEventListener('close', closeListener);
    socket.addEventListener('error', errorListener);
    socket.addEventListener('message', messageListener);

    return () => {
      socket.removeEventListener('open', openListener);
      socket.removeEventListener('close', closeListener);
      socket.removeEventListener('error', errorListener);
      socket.removeEventListener('message', messageListener);
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [namespace, handleConnect, handleDisconnect, handleError, handleMessage]);

  const emit = useCallback((event: string, payload?: any) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        event,
        payload,
      }),
    );
  }, []);

  return { emit, socket: socketRef.current };
}
