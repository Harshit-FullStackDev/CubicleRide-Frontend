// Lightweight STOMP/SockJS client for per-user chat
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken, getEmpId } from './auth';

// Decide SockJS endpoint: in dev (CRA on 3000) hit gateway directly to avoid proxy WS quirks
const inferWsBase = () => {
  const explicit = process.env.REACT_APP_WS_BASE;
  if (explicit) return explicit; // e.g., http://localhost:8080/ws
  const isDev = typeof window !== 'undefined' && window.location && window.location.port === '3000';
  return isDev ? 'http://localhost:8080/ws' : '/ws';
};

class ChatSocket {
    constructor() {
        this.client = null;
        this.connected = false;
        this.listeners = new Set();
        this._connecting = false;
        this._base = inferWsBase();
    }

    connect() {
        if (this.connected || this._connecting) return;
        this._connecting = true;
        const token = getToken();
        const empId = getEmpId();
        if (!token || !empId) { this._connecting = false; return; }

        const client = new Client({
            webSocketFactory: () => new SockJS(this._base),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                this.connected = true;
                this._connecting = false;
                // subscribe to personal topic
                client.subscribe('/user/topic/chat', (msg) => {
                    let payload;
                    try { payload = JSON.parse(msg.body); } catch { payload = null; }
                    if (!payload) return;
                    this.listeners.forEach((l) => l(payload));
                });
            },
            onStompError: () => { /* ignore, will reconnect */ },
            onWebSocketClose: () => { this.connected = false; this._connecting = false; },
        });

        client.activate();
        this.client = client;
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
            this._connecting = false;
        }
    }

    addListener(cb) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }

    sendMessage(rideId, toEmpId, content) {
        if (!this.client || !this.connected) this.connect();
        const payload = { rideId, toEmpId, content };
        this.client?.publish({ destination: '/app/chat/send', body: JSON.stringify(payload) });
    }

    markRead(rideId, otherEmpId, upTo) {
        if (!this.client || !this.connected) this.connect();
        const payload = { rideId, otherEmpId, upTo };
        this.client?.publish({ destination: '/app/chat/read', body: JSON.stringify(payload) });
    }
}

const chatSocket = new ChatSocket();
export default chatSocket;