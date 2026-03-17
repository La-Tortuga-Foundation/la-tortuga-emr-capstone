# cr-sqlite Test App

## Purpose
Tests if cr-sqlite CRDT extension works in React Native for our La Tortuga EMR offline sync.

## Test Results
✅ **CONFIRMED WORKING** on Samsung Galaxy Tab Active3 (Android 13)

cr-sqlite is fully compatible with React Native + @op-engineering/op-sqlite!

## What This Means
- We can use automatic CRDT conflict resolution
- Saves 2-3 weeks of development time
- Less code to write and maintain
- Battle-tested sync logic

---

## For Teammates: Quick Test (No Setup Required)

### Option A: Install Pre-built APK
1. Download `app-debug.apk` from this folder
2. Install on your Android device or emulator
3. Tap "Run cr-sqlite Test" button
4. Report results in team chat

---

## For Teammates: Build from Source

### Prerequisites
- Node.js v20+ ([Download](https://nodejs.org))
- Android Studio with NDK
- Android device or emulator

### Setup Instructions

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd la-tortuga-emr-capstone
   git checkout feature/test-crsqlite-integration
   cd CRSQLiteTest
   npm install
   ```

2. **Install Android NDK:**
   - Open Android Studio
   - Tools → SDK Manager → SDK Tools tab
   - Check: ✅ NDK (Side by side)
   - Check: ✅ CMake
   - Click Apply

3. **Start Android emulator or connect device:**
   ```bash
   # Check device is connected
   adb devices
   ```

4. **Run the app:**
   ```bash
   npx react-native run-android
   ```

### Testing Steps
1. App will open with blue header
2. Tap **"▶️ Run cr-sqlite Test"** button
3. Wait 2-3 seconds for test to complete
4. Read the logs

### Expected Results

**✅ SUCCESS (what we got):**
```
✅ Database opened with op-sqlite
✅ Table created
📊 SQLite version: 3.x.x
--- Attempting to Enable CRDT ---
✅ CRDT ENABLED for patients table!
✅ Test data inserted
📊 CRDT changes tracked: X rows
🎉 SUCCESS! cr-sqlite is WORKING!
```

**❌ FAILURE (if it doesn't work on your device):**
```
✅ Database opened with op-sqlite
✅ Table created
--- Attempting to Enable CRDT ---
❌ CRDT Extension NOT Available
Error: no such function: crsql_as_crr
--- Verifying Basic SQLite Works ---
✅ Basic SQLite WORKS: 3 patients stored
📌 CONCLUSION:
   ❌ cr-sqlite extension not loaded
```

---

## Record Your Results

| Tester | Device | Android Version | Result | Date |
|--------|--------|-----------------|--------|------|
| jmr988 | Samsung Tab Active3 (SM-T577U) | 13 | ✅ Works | 2026-02-27 |
| | | | | |
| | | | | |

**Please add your results above and commit!**

---

## Technical Details

### Packages Used
- `@op-engineering/op-sqlite` v3.x - Fast SQLite for React Native
- `@vlcn.io/crsqlite-wasm` - CRDT extension types

### What's Being Tested
1. Can we open a SQLite database?
2. Can we create tables?
3. Does `crsql_as_crr()` function exist?
4. Does CRDT change tracking work?
5. Can we query `crsql_changes` table?

### Why This Matters
If cr-sqlite works, we get:
- ✅ Automatic conflict-free replication
---

## Architecture Decision
See: `docs/technical-spikes/crsqlite-evaluation.md` for full analysis.
Based on this test: **We will use cr-sqlite for production.**

- ⚠️ Write custom merge logic
- ⚠️ Add ~2-3 weeks to timeline

- ✅ No custom conflict resolution code needed
- ✅ Proven CRDT implementation
- ⚠️ Add version/timestamp tracking columns
- ✅ Saves ~2-3 weeks development time
If it doesn't work:
- ⚠️ Need to implement manual CRDT

