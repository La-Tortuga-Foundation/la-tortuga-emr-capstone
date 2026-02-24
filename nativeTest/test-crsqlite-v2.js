const { open } = require('@op-engineering/op-sqlite');

async function testCRSQLiteV2() {
  console.log('🧪 Testing cr-sqlite (v2 - React Native compatible)...\n');

  try {
    // 1. Open database with op-sqlite (React Native optimized)
    const db = open({ name: 'test.db', location: '.' });
    console.log('✅ Database opened with op-sqlite');

    // 2. Create test table
    db.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER
      );
    `);
    console.log('✅ Table created');

    // 3. Try to enable CRDT
    try {
      // Load cr-sqlite extension
      db.execute(`SELECT load_extension('crsqlite');`);
      console.log('✅ cr-sqlite extension loaded!');

      db.execute(`SELECT crsql_as_crr('patients');`);
      console.log('✅ CRDT enabled for patients table!\n');
      
      // Insert test data
      db.execute(`INSERT INTO patients VALUES ('p1', 'John Doe', 30);`);
      console.log('✅ Test data inserted');
      
      // Check for CRDT changes
      const result = db.execute('SELECT * FROM crsql_changes');
      console.log(`📊 CRDT changes tracked: ${result.rows.length} rows`);
      if (result.rows.length > 0) {
        console.log('Sample change:', result.rows[0]);
      }
      
      console.log('\n🎉 SUCCESS! cr-sqlite is working!\n');
      
    } catch (error) {
      console.log('❌ CRDT extension error:', error.message);
      console.log('\n💡 The extension file may need to be placed manually');
    }

    db.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testCRSQLiteV2();