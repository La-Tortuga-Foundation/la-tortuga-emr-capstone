/**
 * Network Coordinator
 * UDP broadcast for peer discovery across tablets on same WiFi network
 * Ported from V1 — minimal changes for V2
 */

import NetInfo from '@react-native-community/netinfo';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const DISCOVERY_PORT = 8888;
const BROADCAST_INTERVAL = 5000;
const PEER_TIMEOUT = 15000;
const BROADCAST_ADDRESS = '255.255.255.255';

export interface TabletInfo {
  ip: string;
  tabletId: string;
  lastSeen: number;
}

export interface NetworkStatus {
  isConnected: boolean;
  ssid: string | null;
  localIP: string | null;
  activePeers: number;
}

interface PeerAnnouncement {
  type: 'PEER_ANNOUNCE';
  ip: string;
  tabletId: string;
  timestamp: number;
}

class NetworkCoordinator {
  private static instance: NetworkCoordinator;
  private discoveredPeers: Map<string, TabletInfo> = new Map();
  private broadcastSocket: any = null;
  private listenSocket: any = null;
  private broadcastInterval: any = null;
  private cleanupInterval: any = null;
  private isInitialized: boolean = false;
  private localIP: string | null = null;
  private currentSSID: string | null = null;
  private statusCallback: ((status: NetworkStatus) => void) | null = null;
  private tabletId: string = 'tablet-' + Math.random().toString(36).substr(2, 6);

  private constructor() {}

  static getInstance(): NetworkCoordinator {
    if (!NetworkCoordinator.instance) {
      NetworkCoordinator.instance = new NetworkCoordinator();
    }
    return NetworkCoordinator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.log('Already initialized');
      return;
    }

    try {
      this.log('Starting Network Coordinator...');

      const networkState = await NetInfo.fetch();

      if (!networkState.isConnected || networkState.type !== 'wifi') {
        this.log('Not connected to WiFi');
        this.notifyStatusChange();
        return;
      }

      this.currentSSID = networkState.details?.ssid || 'Unknown Network';

      if (networkState.details && 'ipAddress' in networkState.details) {
        this.localIP = networkState.details.ipAddress as string;
      }

      this.log(`Connected to WiFi: ${this.currentSSID}`);
      this.log(`Local IP: ${this.localIP}`);

      await this.startUDPDiscovery();
      this.startPeerCleanup();

      this.isInitialized = true;
      this.log('Network Coordinator initialized');
      this.notifyStatusChange();

    } catch (error) {
      this.log(`Initialization failed: ${error}`);
      throw error;
    }
  }

  private async startUDPDiscovery(): Promise<void> {
    await this.createListenSocket();
    await this.createBroadcastSocket();
    this.startBroadcast();
  }

  private async createListenSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.listenSocket = dgram.createSocket({ type: 'udp4' });

        this.listenSocket.on('message', (msg: Buffer, rinfo: any) => {
          this.handlePeerAnnouncement(msg, rinfo);
        });

        this.listenSocket.on('error', (err: Error) => {
          this.log(`Listen socket error: ${err.message}`);
        });

        const bindTimeout = setTimeout(() => {
          reject(new Error('Socket bind timeout'));
        }, 2000);

        this.listenSocket.once('listening', () => {
          clearTimeout(bindTimeout);
          this.log(`Listening on port ${DISCOVERY_PORT}`);
          resolve();
        });

        this.listenSocket.bind(DISCOVERY_PORT);

      } catch (error) {
        reject(error);
      }
    });
  }

  private async createBroadcastSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.broadcastSocket = dgram.createSocket({ type: 'udp4' });

        this.broadcastSocket.on('error', (err: Error) => {
          this.log(`Broadcast socket error: ${err.message}`);
        });

        const bindTimeout = setTimeout(() => {
          reject(new Error('Broadcast socket bind timeout'));
        }, 2000);

        this.broadcastSocket.once('listening', () => {
          clearTimeout(bindTimeout);
          if (this.broadcastSocket) {
            this.broadcastSocket.setBroadcast(true);
          }
          this.log('Broadcast socket ready');
          resolve();
        });

        this.broadcastSocket.bind();

      } catch (error) {
        reject(error);
      }
    });
  }

  private startBroadcast(): void {
    if (this.broadcastInterval) clearInterval(this.broadcastInterval);
    this.broadcastPresence();
    this.broadcastInterval = setInterval(() => {
      this.broadcastPresence();
    }, BROADCAST_INTERVAL);
  }

  private broadcastPresence(): void {
    if (!this.broadcastSocket || !this.localIP) return;

    try {
      const announcement: PeerAnnouncement = {
        type: 'PEER_ANNOUNCE',
        ip: this.localIP,
        tabletId: this.tabletId,
        timestamp: Date.now(),
      };

      const message = Buffer.from(JSON.stringify(announcement));

      this.broadcastSocket.send(
        message, 0, message.length,
        DISCOVERY_PORT, BROADCAST_ADDRESS,
        (err: Error | null) => {
          if (err) this.log(`Broadcast error: ${err.message}`);
        }
      );
    } catch (error) {
      this.log(`Broadcast failed: ${error}`);
    }
  }

  private handlePeerAnnouncement(msg: Buffer, rinfo: any): void {
    try {
      const announcement: PeerAnnouncement = JSON.parse(msg.toString());

      if (announcement.ip === this.localIP) return;
      if (announcement.type !== 'PEER_ANNOUNCE' || !announcement.ip || !announcement.tabletId) return;

      const peerInfo: TabletInfo = {
        ip: announcement.ip,
        tabletId: announcement.tabletId,
        lastSeen: Date.now(),
      };

      const isNew = !this.discoveredPeers.has(announcement.ip);
      this.discoveredPeers.set(announcement.ip, peerInfo);

      if (isNew) {
        this.log(`Discovered peer: ${peerInfo.tabletId} at ${peerInfo.ip}`);
        this.notifyStatusChange();
      }

    } catch (error) {
      // ignore malformed messages
    }
  }

  private startPeerCleanup(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, peer] of this.discoveredPeers.entries()) {
        if (now - peer.lastSeen > PEER_TIMEOUT) {
          this.discoveredPeers.delete(ip);
          this.log(`Peer timeout: ${peer.tabletId} at ${ip}`);
          this.notifyStatusChange();
        }
      }
    }, 5000);
  }

  getActivePeers(): TabletInfo[] {
    return Array.from(this.discoveredPeers.values());
  }

  getNetworkStatus(): NetworkStatus {
    return {
      isConnected: this.isInitialized && this.localIP !== null,
      ssid: this.currentSSID,
      localIP: this.localIP,
      activePeers: this.discoveredPeers.size,
    };
  }

  setStatusCallback(callback: (status: NetworkStatus) => void): void {
    this.statusCallback = callback;
  }

  getTabletId(): string {
    return this.tabletId;
  }

  private notifyStatusChange(): void {
    if (this.statusCallback) {
      this.statusCallback(this.getNetworkStatus());
    }
  }

  async stop(): Promise<void> {
    this.log('Stopping Network Coordinator...');

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.broadcastSocket) {
      this.broadcastSocket.close();
      this.broadcastSocket = null;
    }

    if (this.listenSocket) {
      this.listenSocket.close();
      this.listenSocket = null;
    }

    this.discoveredPeers.clear();
    this.isInitialized = false;
    this.localIP = null;
    this.currentSSID = null;

    this.log('Network Coordinator stopped');
    this.notifyStatusChange();
  }

  private log(message: string): void {
    console.log(`[NETWORK ${this.tabletId}] ${message}`);
  }
}

const networkCoordinator = NetworkCoordinator.getInstance();

export const initializeNetwork = () => networkCoordinator.initialize();
export const stopNetwork = () => networkCoordinator.stop();
export const getActivePeers = () => networkCoordinator.getActivePeers();
export const getNetworkStatus = () => networkCoordinator.getNetworkStatus();
export const getTabletId = () => networkCoordinator.getTabletId();
export const setNetworkStatusCallback = (cb: (status: NetworkStatus) => void) =>
  networkCoordinator.setStatusCallback(cb);