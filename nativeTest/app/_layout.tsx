import { Slot } from "expo-router";
import "../global.css";
import { useEffect } from 'react';
import { initDB } from '../src/services/db';
import { startMesh } from '../src/services/p2pMeshCoordinator';

export default function RootLayout() {
  useEffect(() => {
    initDB();
    startMesh().then((success) => {
      if (success) {
        console.log('[APP] Mesh started');
      } else {
        console.log('[APP] Mesh failed to start — no WiFi?');
      }
    });
  }, []);

  return <Slot />;
}