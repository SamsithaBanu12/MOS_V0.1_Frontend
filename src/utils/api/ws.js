// Simple pub/sub for WS message types
const listeners = new Map(); // type -> Set(handler)

function emit(type, payload) {
  const set = listeners.get(type);
  if (set) for (const fn of set) { try { fn(payload) } catch {} }
}

export function subscribe(type, handler) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(handler);
  return () => listeners.get(type)?.delete(handler);
}

/**
 * Opens a WebSocket to the backend and fans out messages by `msg.type`
 * to subscribers registered via `subscribe(type, handler)`.
 *
 * Keeps a 20s heartbeat ping. Returns the ws instance with a patched
 * .close() that also cleans the heartbeat timer.
 */
export function openBridgeWS({ onOpen, onClose, onMessage } = {}) {
  const ws = new WebSocket('ws://localhost:8000/ws');

  ws.onopen = () => { onOpen && onOpen(); };

  ws.onclose = () => { onClose && onClose(); };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      // Fan-out by type: 'status' | 'stats' | 'message' | 'health' | ...
      if (msg && msg.type) emit(msg.type, msg);
      onMessage && onMessage(msg);
    } catch {
      // ignore parse errors
    }
  };

  // Heartbeat (keep-alive) every 20s
  const ping = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.send('ping');
  }, 20000);

  // Ensure we clear heartbeat on close()
  ws._kill = () => clearInterval(ping);
  const _close = ws.close.bind(ws);
  ws.close = (...args) => { ws._kill(); _close(...args); };

  return ws;
}
