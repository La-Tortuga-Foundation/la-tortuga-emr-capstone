import { Slot } from "expo-router";
import "../global.css";
import { useEffect } from 'react';
import { initDB } from '../src/services/db';

export default function RootLayout() {
  useEffect(() => {
    initDB();
  }, []);

  return <Slot />;
}
