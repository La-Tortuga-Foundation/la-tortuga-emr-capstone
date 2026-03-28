/**
 * Sync Socket Service
 * TCP server/client for data transfer between tablets
 * Ported from V1 — updated for V2 21-table schema
 */

import TcpSocket from 'react-native-tcp-socket';
import { Buffer } from 'buffer';
import { handleSyncMessage, sendHandshake } from './syncManager';

const DEFAULT_SYNC_PORT = 8889;
const MESSAGE_DELIMITER = '\n---END---\n';
const CONNECTION_TIMEOUT = 5000;

let serverSocket: any = null;
let clientSocket: any = null;
let messageBuffer = '';
let connectedPeers: Set<string> = new Set();
let onPeerCountChange: ((count: number) => void) | null = null;
let serverClientSockets: Map<string, any> = new Map();

export function setPeerCountCallback(callback: (count: number) => void): void {
  onPeerCountChange = callback;
}

export function getConnectedPeerCount(): number {
  return connectedPeers.size;
}

function updatePeerCount(): void {
  if (onPeerCountChange) {
    onPeerCountChange(connectedPeers.size);
  }
}

export function startSyncServer(
  onLog: (message: string) => void,
  onClientConnected: (address: string) => void
): void {
  try {
    console.log('[SYNC SOCKET] Starting server on port', DEFAULT_SYNC_PORT);

    serverSocket = TcpSocket.createServer((socket: any) => {
      const clientAddress = `${socket.address().address}:${socket.address().port}`;
      console.log('[SYNC SOCKET] Client connected:', clientAddress);

      connectedPeers.add(clientAddress);
      updatePeerCount();

      const clientIP = socket.address().address;
      serverClientSockets.set(clientIP, socket);

      onClientConnected(clientAddress);
      onLog(`Client connected: ${clientAddress}`);

      let serverMessageBuffer = '';

      socket.on('data', async (data: Buffer) => {
        try {
          if (!data) return;
          const chunk = data.toString('utf8');
          if (!chunk || chunk.length === 0) return;

          serverMessageBuffer += chunk;

          if (serverMessageBuffer.includes(MESSAGE_DELIMITER)) {
            const messages = serverMessageBuffer.split(MESSAGE_DELIMITER);
            serverMessageBuffer = messages.pop() || '';

            for (const msgStr of messages) {
              if (msgStr.trim()) {
                try {
                  const message = JSON.parse(msgStr);
                  await processSyncMessage(message, onLog, socket);
                } catch (error) {
                  console.error('[SYNC SOCKET] Failed to parse message:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('[SYNC SOCKET] Data handler error:', error);
        }
      });

      socket.on('error', (error: Error) => {
        console.error('[SYNC SOCKET] Client socket error:', error);
      });

      socket.on('close', () => {
        console.log('[SYNC SOCKET] Client disconnected:', clientAddress);
        connectedPeers.delete(clientAddress);
        serverClientSockets.delete(clientIP);
        updatePeerCount();
      });
    });

    serverSocket.listen({ port: DEFAULT_SYNC_PORT, host: '0.0.0.0' }, () => {
      console.log('[SYNC SOCKET] Server listening on port', DEFAULT_SYNC_PORT);
      onLog(`Server started on port ${DEFAULT_SYNC_PORT}`);
    });

    serverSocket.on('error', (error: Error) => {
      console.error('[SYNC SOCKET] Server error:', error);
    });

  } catch (error) {
    console.error('[SYNC SOCKET] Failed to start server:', error);
  }
}

export function stopSyncServer(onLog: (message: string) => void): void {
  try {
    if (serverSocket) {
      serverSocket.close();
      serverSocket = null;
      onLog('Server stopped');
    }
  } catch (error) {
    console.error('[SYNC SOCKET] Failed to stop server:', error);
  }
}

export function connectSyncClient(
  serverIp: string,
  port: number = DEFAULT_SYNC_PORT,
  onLog: (message: string) => void,
  onConnected: () => void
): void {
  try {
    console.log('[SYNC SOCKET] Connecting to:', serverIp);

    let connectionTimeout: any = null;
    let isConnected = false;

    connectionTimeout = setTimeout(() => {
      if (!isConnected && clientSocket) {
        console.log('[SYNC SOCKET] Connection timeout');
        clientSocket.destroy();
        clientSocket = null;
      }
    }, CONNECTION_TIMEOUT);

    clientSocket = TcpSocket.createConnection(
      { port, host: serverIp },
      () => {
        console.log('[SYNC SOCKET] Connected to server');
        isConnected = true;

        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }

        connectedPeers.add(serverIp);
        updatePeerCount();

        onLog(`Connected to ${serverIp}`);
        onConnected();

        setTimeout(() => {
          sendHandshake((msg) => {
            if (clientSocket) {
              try {
                clientSocket.write(msg);
              } catch (err) {
                console.error('[SYNC SOCKET] Failed to send handshake:', err);
              }
            }
          });
        }, 200);
      }
    );

    clientSocket.on('data', async (data: Buffer) => {
      try {
        if (!data) return;
        const chunk = data.toString('utf8');
        if (!chunk || chunk.length === 0) return;

        messageBuffer += chunk;

        if (messageBuffer.includes(MESSAGE_DELIMITER)) {
          const messages = messageBuffer.split(MESSAGE_DELIMITER);
          messageBuffer = messages.pop() || '';

          for (const msgStr of messages) {
            if (msgStr.trim()) {
              try {
                const message = JSON.parse(msgStr);
                await processSyncMessage(message, onLog);
              } catch (error) {
                console.error('[SYNC SOCKET] Failed to parse message:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('[SYNC SOCKET] Client data handler error:', error);
      }
    });

    clientSocket.on('error', (error: Error) => {
      console.error('[SYNC SOCKET] Client error:', error);
    });

    clientSocket.on('close', () => {
      console.log('[SYNC SOCKET] Disconnected from server');
      connectedPeers.delete(serverIp);
      updatePeerCount();
      messageBuffer = '';
      clientSocket = null;
    });

  } catch (error) {
    console.error('[SYNC SOCKET] Failed to connect:', error);
  }
}

export function disconnectSyncClient(onLog: (message: string) => void): void {
  try {
    if (clientSocket) {
      clientSocket.destroy();
      messageBuffer = '';
      clientSocket = null;
      onLog('Disconnected from server');
    }
  } catch (error) {
    console.error('[SYNC SOCKET] Failed to disconnect:', error);
  }
}

export function isServerRunning(): boolean {
  return serverSocket !== null;
}

export function isClientConnected(): boolean {
  return clientSocket !== null;
}

export function broadcastToAllConnectedPeers(
  message: any,
  onLog: (message: string) => void
): void {
  const messageStr = JSON.stringify(message) + MESSAGE_DELIMITER;
  const buffer = Buffer.from(messageStr, 'utf8');
  let sentCount = 0;

  for (const [ip, socket] of serverClientSockets.entries()) {
    try {
      socket.write(buffer);
      sentCount++;
    } catch (err) {
      console.error(`[SYNC SOCKET] Broadcast failed to ${ip}:`, err);
      serverClientSockets.delete(ip);
    }
  }

  if (clientSocket) {
    try {
      clientSocket.write(buffer);
      sentCount++;
    } catch (err) {
      console.error('[SYNC SOCKET] Broadcast failed via client socket:', err);
    }
  }

  if (sentCount > 0) {
    onLog(`Broadcast to ${sentCount} peer(s)`);
  }
}

async function processSyncMessage(
  message: any,
  onLog: (message: string) => void,
  replySocket?: any
): Promise<void> {
  try {
    if (
      message.type === 'handshake' ||
      message.type === 'sync_data' ||
      message.type === 'sync_complete'
    ) {
      const sendFunc = (msg: string) => {
        const targetSocket = replySocket || clientSocket;
        if (targetSocket) {
          try {
            targetSocket.write(msg);
          } catch (err) {
            console.error('[SYNC SOCKET] Failed to send response:', err);
          }
        }
      };

      await handleSyncMessage(JSON.stringify(message), sendFunc);
    }
  } catch (error) {
    console.error('[SYNC SOCKET] Failed to process message:', error);
  }
}