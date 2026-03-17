import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  useColorScheme,
  Platform,
} from 'react-native';
import { open } from '@op-engineering/op-sqlite';

function App(): React.JSX.Element {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const testCRSQLite = async () => {
    setIsRunning(true);
    setLogs([]);
    
    addLog('🧪 Testing cr-sqlite in React Native...\n');

    try {
      // 1. Open database
      const db = open({ name: 'test_crdt.db' });
      addLog('✅ Database opened with op-sqlite');

      // 2. Drop and create test table
      db.execute('DROP TABLE IF EXISTS patients;');
      
      db.execute(`
        CREATE TABLE patients (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT,
          age INTEGER
        );
      `);
      addLog('✅ Table created');

      // 3. Check SQLite version
      try {
        const versionResult = db.execute('SELECT sqlite_version() as version;');
        if (versionResult.rows && versionResult.rows.length > 0) {
          const version = versionResult.rows.item(0).version;
          addLog(`📊 SQLite version: ${version}\n`);
        }
      } catch (e: unknown) {
        const error = e as Error;
        addLog(`⚠️  Could not get SQLite version: ${error.message}\n`);
      }

      // 4. Try to enable CRDT
      addLog('--- Attempting to Enable CRDT ---');
      try {
        db.execute("SELECT crsql_as_crr('patients');");
        addLog('✅ CRDT ENABLED for patients table!\n');

        // Insert test data
        db.execute(`
          INSERT INTO patients (id, name, age) 
          VALUES ('patient-1', 'John Doe', 30);
        `);
        addLog('✅ Test data inserted');

        // Check for CRDT changes table
        const changes = db.execute('SELECT * FROM crsql_changes;');
        const changeCount = changes.rows?.length || 0;
        addLog(`📊 CRDT changes tracked: ${changeCount} rows`);
        
        if (changeCount > 0) {
          const sample = changes.rows!.item(0);
          addLog('\nSample change record:');
          addLog(JSON.stringify(sample, null, 2).substring(0, 200));
          addLog('\n🎉 SUCCESS! cr-sqlite is WORKING!\n');
          
          // Test update
          addLog('--- Testing Update Tracking ---');
          db.execute("UPDATE patients SET age = 31 WHERE id = 'patient-1';");
          addLog('✅ Updated patient age');

          const newChanges = db.execute('SELECT * FROM crsql_changes;');
          addLog(`📊 Total changes now: ${newChanges.rows?.length || 0}`);
          
          addLog('\n✅ cr-sqlite is fully functional!');
          addLog('✅ Ready to use in La Tortuga EMR project!');
        }

      } catch (error: unknown) {
        const err = error as Error;
        addLog('❌ CRDT Extension NOT Available\n');
        addLog(`Error: ${err.message}\n`);
        addLog('💡 This means the cr-sqlite native extension');
        addLog('   is not loaded into SQLite.\n');
        
        // Verify basic SQLite still works
        addLog('--- Verifying Basic SQLite Works ---');
        try {
          db.execute("INSERT INTO patients VALUES ('p2', 'Jane Smith', 25);");
          db.execute("INSERT INTO patients VALUES ('p3', 'Bob Jones', 40);");
          
          const rows = db.execute('SELECT * FROM patients ORDER BY name;');
          const count = rows.rows?.length || 0;
          addLog(`✅ Basic SQLite WORKS: ${count} patients stored\n`);
          
          if (rows.rows) {
            for (let i = 0; i < rows.rows.length; i++) {
              const p = rows.rows.item(i);
              addLog(`  📋 ${p.name}, age ${p.age} (ID: ${p.id})`);
            }
          }
          
          addLog('\n📌 CONCLUSION:');
          addLog('   ✅ SQLite works perfectly');
          addLog('   ❌ cr-sqlite extension not loaded');
          addLog('   💡 Recommendation: Use manual CRDT approach');
          
        } catch (basicError: unknown) {
          const basicErr = basicError as Error;
          addLog(`❌ Even basic SQLite failed: ${basicErr.message}`);
        }
      }

      db.close();
      addLog('\n✅ Test completed');

    } catch (error: unknown) {
      const err = error as Error;
      addLog(`\n❌ Test failed: ${err.message}`);
      if (err.stack) {
        addLog(`Stack: ${err.stack}`);
      }
    }

    setIsRunning(false);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={styles.title}>cr-sqlite Test</Text>
        <Text style={styles.subtitle}>La Tortuga EMR - Capstone Project</Text>
        <Text style={styles.subtitle}>Testing CRDT Support in React Native</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isRunning ? '⏳ Running Test...' : '▶️  Run cr-sqlite Test'}
          onPress={testCRSQLite}
          disabled={isRunning}
          color="#4A90E2"
        />
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.length === 0 && (
          <Text style={styles.placeholderText}>
            👆 Press the button above to test cr-sqlite{'\n\n'}
            This will check if CRDT support works in React Native
          </Text>
        )}
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  logContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
  logText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    marginBottom: 3,
    color: '#333',
    lineHeight: 16,
  },
});

export default App;