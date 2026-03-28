/**
 * P2P Mesh Coordinator
 * Orchestrates UDP discovery + TCP sync across tablets
 * Ported from V1 — minimal changes for V2
 */

import {
  initializeNetwork,
  stopNetwork,
  getActivePeers,
  getNetworkStatus,
  setNetworkStatusCallback,
  type TabletInfo,
  type NetworkStatus,
} from './networkCoordinator';
import {
  startSyncServer,
  stopSyncServer,
  connectSyncClient,
  disconnectSyncClient,
  getConnectedPeerCount,
  setPeerCountCallback,
  isClientConnected,
  broadcastToAllConnectedPeers,
} from './syncSocket';
import { resetSyncState } from './syncManager';

const SYNC_PORT = 8889;
const RECONNECT_CHECK_INTERVAL = 5000;
const PEER_ROTATION_INTERVAL = 120000; // 2 minutes

interface MeshStatus {
  isActive: boolean;
  networkSSID: string | null;
  localIP: string | null;
  discoveredPeers: number;
  syncConnections: number;
}

let meshActive = false;
let syncServerRunning = false;
let syncClientConnections: Set<string> = new Set();
let statusCallback: ((status: MeshStatus) => void) | null = null;
let reconnectInterval: any = null;
let rotationInterval: any = null;
let currentClientPeerIP: string | null = null;

export function setMeshStatusCallback(
  callback: (status: MeshStatus) => void
): void {
  statusCallback = callback;
}

export function getMeshStatus(): MeshStatus {
  const networkStatus = getNetworkStatus();
  return {
    isActive: meshActive,
    networkSSID: networkStatus.ssid,
    localIP: networkStatus.localIP,
    discoveredPeers: networkStatus.activePeers,
    syncConnections: getConnectedPeerCount(),
  };
}

export async function startMesh(): Promise<boolean> {
  if (meshActive) {
    log('Mesh already active');
    return true;
  }

  try {
    log('Starting mesh...');

    await initializeNetwork();

    const networkStatus = getNetworkStatus();

    if (!networkStatus.isConnected) {
      log('Not connected to WiFi');
      return false;
    }

    log(`Connected to: ${networkStatus.ssid}`);
    log(`Local IP: ${networkStatus.localIP}`);

    startSyncServer(
      log,
      (clientAddress) => {
        log(`Sync client connected: ${clientAddress}`);
        syncClientConnections.add(clientAddress);
        notifyStatusChange();
      }
    );
    syncServerRunning = true;

    setNetworkStatusCallback((status: NetworkStatus) => {
      log(`Network update: ${status.activePeers} peers`);
      handlePeerDiscovery(status);
      notifyStatusChange();
    });

    setPeerCountCallback((count) => {
      log(`Sync connections: ${count}`);
      notifyStatusChange();
    });

    if (reconnectInterval) clearInterval(reconnectInterval);
    reconnectInterval = setInterval(() => {
      if (meshActive) {
        const peers = getActivePeers();
        if (peers.length > 0 && !isClientConnected()) {
          log('Periodic reconnect check — reconnecting...');
          handlePeerDiscovery(getNetworkStatus());
        }
      }
    }, RECONNECT_CHECK_INTERVAL);

    if (rotationInterval) clearInterval(rotationInterval);
    rotationInterval = setInterval(() => {
      if (meshActive) rotatePeer();
    }, PEER_ROTATION_INTERVAL);

    meshActive = true;
    log('Mesh started');
    notifyStatusChange();

    return true;
  } catch (error) {
    log(`Failed to start mesh: ${error}`);
    return false;
  }
}

export async function stopMesh(): Promise<void> {
  log('Stopping mesh...');

  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }

  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }

  currentClientPeerIP = null;

  if (syncServerRunning) {
    stopSyncServer(log);
    syncServerRunning = false;
  }

  disconnectSyncClient(log);
  syncClientConnections.clear();

  await stopNetwork();

  meshActive = false;
  resetSyncState();

  log('Mesh stopped');
  notifyStatusChange();
}

function handlePeerDiscovery(networkStatus: NetworkStatus): void {
  if (!meshActive) return;

  const peers = getActivePeers();
  const activePeerIPs = new Set(peers.map((p) => p.ip));

  // Clear stale connections if TCP client died
  if (!isClientConnected() && syncClientConnections.size > 0) {
    log(`Clearing ${syncClientConnections.size} stale connection entries`);
    syncClientConnections.clear();
  }

  // Remove peers no longer in UDP discovery
  for (const ip of syncClientConnections) {
    if (!activePeerIPs.has(ip)) {
      log(`Removing stale connection: ${ip}`);
      syncClientConnections.delete(ip);
    }
  }

  // Only connect to one peer at a time
  if (isClientConnected()) return;

  // Shuffle to avoid star topology
  const shuffledPeers = [...peers].sort(() => Math.random() - 0.5);

  for (const peer of shuffledPeers) {
    if (!syncClientConnections.has(peer.ip)) {
      log(`Connecting to peer: ${peer.tabletId} at ${peer.ip}`);

      syncClientConnections.add(peer.ip);
      currentClientPeerIP = peer.ip;

      connectSyncClient(peer.ip, SYNC_PORT, log, () => {
        log(`Connected to ${peer.tabletId}`);
        notifyStatusChange();
      });

      break; // Only one connection at a time
    }
  }
}

function rotatePeer(): void {
  const peers = getActivePeers();

  if (peers.length < 2) return;

  const otherPeers = peers.filter((p) => p.ip !== currentClientPeerIP);
  if (otherPeers.length === 0) return;

  const nextPeer = otherPeers[Math.floor(Math.random() * otherPeers.length)];

  log(`Rotating: ${currentClientPeerIP} → ${nextPeer.tabletId} at ${nextPeer.ip}`);

  disconnectSyncClient(log);
  syncClientConnections.clear();
  currentClientPeerIP = null;
  resetSyncState();

  setTimeout(() => {
    if (!meshActive) return;

    currentClientPeerIP = nextPeer.ip;
    syncClientConnections.add(nextPeer.ip);

    connectSyncClient(nextPeer.ip, SYNC_PORT, log, () => {
      log(`Rotated to ${nextPeer.tabletId}`);
      notifyStatusChange();
    });
  }, 500);
}

export function isMeshReadyForSync(): boolean {
  const networkStatus = getNetworkStatus();
  return meshActive && networkStatus.isConnected && syncServerRunning;
}

function notifyStatusChange(): void {
  if (statusCallback) {
    statusCallback(getMeshStatus());
  }
}

function log(message: string): void {
  console.log(`[MESH] ${message}`);
}

// Legacy alias
export const startP2PMesh = startMesh;
export const stopP2PMesh = stopMesh;