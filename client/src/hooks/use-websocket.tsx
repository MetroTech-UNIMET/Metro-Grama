'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useEffectEvent } from 'react';

import { getAuthToken } from '@utils/authToken';

type WebsocketEventHandlers = Record<string, (payload: any, socket: WebSocket) => void>;

interface UseWebsocketOptions {
  namespace: string;
  onConnect?: (socket: WebSocket) => void;
  onDisconnect?: (socket: WebSocket) => void;
  onError?: (error: Event | Error, socket: WebSocket) => void;
  onEvents?: WebsocketEventHandlers;
}

function buildWebsocketUrl(namespace: string) {
  const baseUrl = import.meta.env.VITE_WS_URL;
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

export function useWebsocket({ namespace, onConnect, onDisconnect, onError, onEvents = {} }: UseWebsocketOptions) {
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
    let retryCount = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;

      const socket = new WebSocket(buildWebsocketUrl(namespace));
      socketRef.current = socket;

      const openListener = () => {
        if (unmounted) return;
        retryCount = 0;
        handleConnect(socket);
      };

      const closeListener = () => {
        if (unmounted) return;

        handleDisconnect(socket);
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        retryCount += 1;

        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        retryTimeout = setTimeout(connect, delay);
      };

      const errorListener = (event: Event) => {
        if (unmounted) return;
        handleError(event, socket);
      };

      const messageListener = (event: MessageEvent) => {
        if (unmounted) return;
        handleMessage(event, socket);
      };

      socket.addEventListener('open', openListener);
      socket.addEventListener('close', closeListener);
      socket.addEventListener('error', errorListener);
      socket.addEventListener('message', messageListener);
    };

    connect();

    return () => {
      unmounted = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }

      const socket = socketRef.current;
      socket?.close();

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

// TODO
// FE-H5: Auth token exposed in WebSocket URL query parameter
// File: client/src/hooks/use-websocket.tsx Lines: 35–38

// Problem: Same issue as BE-H7 but from the client side. The token appears in browser history, developer tools, and can be leaked.

// Current code:

// const token = getAuthToken();
// if (token) {
//     url.searchParams.set('token', token);
// }
// Fix (short-term): This is acceptable if the backend requires it for the initial WebSocket handshake. Document the tradeoff.

// Fix (long-term): Send the token as the first message after connection opens instead of in the URL:

// socket.addEventListener('open', () => {
//     socket.send(JSON.stringify({ event: 'auth', payload: { token: getAuthToken() } }));
//     onConnectRef.current?.(socket);
// });
// This requires backend changes to handle auth via message instead of query parameter.