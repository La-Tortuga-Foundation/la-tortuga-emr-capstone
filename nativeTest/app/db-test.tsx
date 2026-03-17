import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { initDB, query, isDBInitialized } from '../src/services/db';

export default function DBTestScreen() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const runTest = () => {
    setLogs([]);
    try {
      addLog('Opening database...');
      initDB();
      addLog('✅ initDB() succeeded');

      const patients = query('SELECT count(*) as c FROM patients');
      addLog(`✅ patients table: ${(patients[0] as any).c} rows`);

      const visits = query('SELECT count(*) as c FROM visits');
      addLog(`✅ visits table: ${(visits[0] as any).c} rows`);

      const meds = query('SELECT count(*) as c FROM medication_types');
      addLog(`✅ medication_types: ${(meds[0] as any).c} rows`);

      const changes = query('SELECT * FROM crsql_changes LIMIT 5');
      addLog(`✅ crsql_changes: ${changes.length} rows tracked`);

      addLog('🎉 All tests passed!');
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    }
  };

  useEffect(() => { runTest(); }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        DB Test Screen
      </Text>
      <TouchableOpacity
        onPress={runTest}
        style={{ backgroundColor: '#0F6E56', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Re-run test</Text>
      </TouchableOpacity>
      {logs.map((log, i) => (
        <Text key={i} style={{ fontFamily: 'monospace', fontSize: 13, marginBottom: 4 }}>
          {log}
        </Text>
      ))}
    </ScrollView>
  );
}