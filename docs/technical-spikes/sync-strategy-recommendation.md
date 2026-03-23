# CRDT Sync Strategy Recommendation — La Tortuga EMR V2

**Date:** March 22, 2026  
**Author:** Analysis by Cline / reviewed for team  
**Status:** RECOMMENDATION — No code changes made  
**Deadline:** May 2026  

---

## Executive Summary

**Recommendation: Option 1 — Port V1 custom sync to V2.**

Port `p2pMeshCoordinator.ts` and `syncManager.ts` from V1 into the V2 codebase.
Replace V1's `syncVersion` / `originTablet` / `lastSyncedAt` columns with the
`__crsql_version` / `__crsql_siteid` columns already present in every V2 table.
Keep `collision_remaps`. Use op-sqlite `executeSync()` throughout.

**Rationale in one sentence:** The V1 sync architecture was proven across 8 tablets in
the field in March 2026; the V2 schema already has the right columns for it; the
transport layer code is almost entirely reusable; and this path requires zero changes
to the build infrastructure, Expo Router, or native dependencies — the safest possible
execution under a May 2026 deadline.

---

## The Core Problem Stated Precisely

The failure in V2 is specific and narrow:

```
Error: no such function: crsql_as_crr
```

This is not a bug in op-sqlite v15. It is a **build pipeline problem**: cr-sqlite ships
as a native SQLite extension (a `.so` file on Android) that must be compiled into the
app's native binary. In older versions of op-sqlite (approximately v3–v7), an
`app.plugin.js` told Expo's prebuild step to include that extension. Starting with
op-sqlite v10+, the plugin was removed entirely from the package. Without it, Expo
Managed workflow has no hook to inject the cr-sqlite `.so` at build time, so the
function simply does not exist at runtime.

The `CRSQLiteTest/` proof-of-concept **does work** because it is bare React Native
(`react-native run-android`), which compiles the full native module directly without
going through Expo's managed build path. That test used `@op-engineering/op-sqlite`
v15.2.5 — the same major version as V2 — confirming that the gap is purely the
Expo integration layer, not the Android hardware, not the op-sqlite version.

The earlier evaluation doc (`crsqlite-evaluation.md`) was written when op-sqlite was
at approximately v3.x in a bare RN context and predates the plugin's removal. The
conclusion "✅ APPROVED FOR PRODUCTION" was correct for bare RN but does not apply
to the current Expo Managed build.

---

## Option Analysis

### Option 1 — Port V1 Custom Sync to V2 ✅ RECOMMENDED

**What this is:**  
Re-implement `p2pMeshCoordinator.ts` (UDP discovery + TCP transport) and
`syncManager.ts` (delta sync + collision handling) inside V2. Use `__crsql_siteid`
as the site/device identifier and `__crsql_version` as the per-row vector clock
(replacing V1's `originTablet` + `syncVersion`).

**How much work:**  
- **Transport layer** (`p2pMeshCoordinator.ts`): ~80% reusable. The UDP broadcast
  logic, TCP server on port 8889, peer rotation (2-minute interval), shuffle-before-
  connect, and reconnect check (5-second poll) are all pure networking code with no
  SQLite dependency. The main changes are replacing `expo-sqlite` imports with the
  V2 `db.ts` module and updating TypeScript types for V2 peer structures.

- **Sync protocol** (`syncManager.ts`): ~60% reusable. The handshake, delta query,
  bidirectional exchange, 24-hour window, 500-record cap, and mutex (isSyncing flag)
  are all reusable patterns. What changes:

  | V1 | V2 equivalent |
  |----|--------------|
  | `lastSyncedAt INTEGER` as delta filter | `__crsql_version INTEGER` as delta filter |
  | `originTablet TEXT` as device identity | `__crsql_siteid TEXT` as device identity |
  | `syncVersion INTEGER` for conflict ordering | `__crsql_version INTEGER` — same role |
  | 4 tables in delta loop | 21 tables in delta loop (same pattern, more iterations) |
  | `getAllAsync()` / `runAsync()` — async | `executeSync()` — synchronous |
  | Identity collision on `patientId` (integer or short string) | Identity collision on UUID — **far less likely** |

- **Database API translation** (V1 async → V2 sync):  
  Every `await db.getAllAsync()` becomes `db.executeSync()`.  
  Every `await db.runAsync()` becomes a `run()` call.  
  This is mechanical, not architectural. With search-and-replace it is ~2–4 hours.  
  The synchronous API is actually advantageous here: during a sync session you
  never have to reason about interleaved async calls corrupting state mid-handshake.

- **Schema delta queries** need to target the right columns. V1 filtered by
  `lastSyncedAt > ?`. V2 should filter by `__crsql_version > ?` using a per-table
  watermark stored in `settings`. This is a one-line change per query template but
  must be applied to all 21 tables.

**Critical improvement over V1:**  
V2 uses UUID text primary keys everywhere. The March 2026 field incident — ~12
duplicate patient pairs caused by the router failure — happened because V1 tablets
could independently generate colliding short patient IDs when isolated. UUID collision
probability across 8 tablets generating thousands of records is astronomically small.
The `collision_remaps` table stays in V2's schema as a safety net, but it should
almost never be needed.

**What does NOT change from V1:**  
- Peer rotation / shuffle logic (prevents star topology bug)  
- One-client-socket-at-a-time constraint (prevents socket overwrite bug)  
- Sync mutex to prevent concurrent sync corruption  
- The `reportAggregator` identity key (`firstName|lastName|dateOfBirth`) — this
  fix is independent of the sync layer  
- `collision_remaps` table (already in V2 schema)

**Risks:**  
- The 21-table schema means the delta loop is longer. With 500-record caps per table,
  a full sync could send up to 10,500 rows. In practice most tables will have 0 new
  rows to exchange. Measure TCP payload size in testing and tune the cap accordingly.
- React Native's TCP networking requires `react-native-tcp-socket` or a similar
  native module. If V1 used a specific package for TCP/UDP, verify it is compatible
  with React Native 0.81.5 and Expo SDK 54.
- The `isSyncing` mutex pattern from V1 must be respected across all 21 table loops.
  A partial sync (crash mid-handshake) leaves `__crsql_version` updates applied only
  to some tables. The handshake should only update the watermark in `settings` after
  all 21 table exchanges complete successfully.

**Timeline estimate:** 1–2 weeks for two developers working in parallel on transport
and sync manager, plus 1 week of multi-tablet integration testing.

---

### Option 2 — Switch Back to expo-sqlite

**Verdict: Viable fallback, but not the primary recommendation.**

expo-sqlite's async API was proven across 8 tablets. Migration from `executeSync()`
to async/await is mechanical (the wrapper functions in `db.ts` all have direct
async equivalents). The 21-table V2 schema is expo-sqlite-compatible.

**The cr-sqlite question for expo-sqlite:**  
expo-sqlite ships its own bundled SQLite binary. It exposes no API to load external
native extensions. There is no path to use cr-sqlite with expo-sqlite in a managed
or bare Expo project. If you switch to expo-sqlite, you are committing to manual sync
regardless — which is exactly what Option 1 does, while keeping the faster op-sqlite
synchronous API.

**Migration cost from op-sqlite to expo-sqlite:**  
- All `executeSync()` calls become async/await  
- Every function in `patients.ts`, `visits.ts`, and all other service files must
  become `async`  
- Every call site in the UI layer (`checkIn.tsx`, forms, etc.) must `await` those
  calls  
- The `initDB()` function in `db.ts` must become async  
- React hooks loading from DB must use `useEffect` + state instead of synchronous
  reads  

This is a significant refactor touching every file in the app. It de-risks nothing
compared to Option 1, and costs more time. **Only pursue this if op-sqlite proves
unstable on the target hardware during integration testing.**

---

### Option 3 — Eject from Expo to Bare React Native

**Verdict: Technically sound, but too risky for a May 2026 deadline.**

The `CRSQLiteTest/` proof-of-concept proves cr-sqlite works in bare React Native on
the Samsung Tab Active3 with op-sqlite v15.2.5. This is the strongest evidence in
the repository.

Expo Router (`expo-router`) is fully supported in bare React Native projects — it is
a separate package from Expo Managed workflow. Navigation would survive ejection.

**What breaks:**  
- `expo prebuild` / EAS Build managed workflow is lost  
- All `app.json` config plugins (`expo-splash-screen`, `expo-router`) need to be
  manually wired into `android/app/build.gradle` and `AndroidManifest.xml`  
- Any future Expo SDK upgrades become manual  
- The dev team loses `expo start` hot reload convenience and must use
  `npx react-native run-android`  
- `newArchEnabled: true` in `app.json` must be manually configured in bare gradle  

**What ejection would unlock:**  
- cr-sqlite works natively via op-sqlite's built-in extension support  
- `crsql_changes` virtual table becomes available — actual automatic CRDT sync  
- The `enableCRDT()` function in `db.ts` would work as written  
- Sync layer becomes dramatically simpler: query `crsql_changes`, send to peer,
  call `crsql_merge_changes` on receive  

**The honest risk assessment:**  
Ejecting a non-trivial Expo app mid-development is a 3–5 day task that frequently
uncovers dependency incompatibilities not visible until `react-native run-android`
is attempted. With `react-native 0.81.5` (V2 is on 0.81.5 per package.json) and
`newArchEnabled: true`, there is meaningful risk of native module incompatibilities
(NativeWind, react-native-reanimated, react-native-worklets) that require additional
debugging.

**The risk/reward calculation:** Ejecting buys you automatic CRDT conflict resolution
at column level, which is beautiful — but La Tortuga EMR's conflict patterns are
simple enough that last-writer-wins on UUID-keyed rows is adequate (V1's field data
confirms this). The elegance of cr-sqlite does not justify the infrastructure risk
given the deadline.

**Recommendation:** Keep this option in the back pocket. If the May 2026 deadline is
met with Option 1 and a V3 is planned, ejecting to bare RN and enabling cr-sqlite
properly is the right long-term architecture.

---

### Option 4 — Downgrade op-sqlite

**Verdict: Rule this out immediately.**

The original evaluation spike (`crsqlite-evaluation.md`) was conducted with
`@op-engineering/op-sqlite` at approximately v3.x in a **bare React Native** project.
That evaluation was not a test of "op-sqlite + Expo" compatibility — it was a test of
"op-sqlite + bare RN." The conclusion "confirmed working" applies only to bare RN.

Searching the op-sqlite changelog and GitHub issues: the `app.plugin.js` Expo
integration was present in versions roughly v7–v9 but was unreliable even then (it
was community-contributed, not officially maintained by OP Engineering). By v10 it
was removed. There is no op-sqlite version that cleanly provides:

1. Expo Managed workflow plugin support  
2. cr-sqlite extension loading  
3. API compatibility with the V2 codebase (`executeSync` was introduced in ~v5)

Downgrading to v3 or v7 would require rewriting the entire `db.ts` API layer,
would introduce known stability regressions on newer React Native versions, and
still would not guarantee cr-sqlite works in an Expo managed build. This option
offers no guaranteed payoff and measurable regression risk.

**Rule it out.**

---

### Option 5 — Hybrid Approach

**Verdict: Architecturally sound in theory, unnecessary in practice for this deadline.**

The idea of "port V1 transport + identity resolution, use cr-sqlite where available,
fall back to manual sync" collapses into a problem: cr-sqlite is either available or
it is not, and in the current Expo build it is not. A hybrid that gracefully degrades
to manual sync on every tablet is just Option 1 with extra complexity.

The place where hybrid thinking **is** valuable: use cr-sqlite's **conceptual model**
(site IDs, version counters, change logs) to structure the manual sync, which is
exactly what Option 1 recommends by using `__crsql_siteid` and `__crsql_version`.
The V2 schema was pre-populated with these columns precisely to enable this approach.
You get the conceptual benefits of CRDT design without the runtime dependency.

---

## Decision Matrix

| Option | Works in Expo | Build Risk | Dev Time (est.) | Field Reliability | Recommended |
|--------|--------------|------------|-----------------|-------------------|-------------|
| 1 — Port V1 sync | ✅ Yes | None | 2–3 weeks | ✅ Proven pattern | **✅ YES** |
| 2 — Switch to expo-sqlite | ✅ Yes | Low | 3–4 weeks | ✅ Proven (V1) | Fallback only |
| 3 — Eject to bare RN | N/A | **High** | 4–6 weeks | ✅ Would work | Post-deadline V3 |
| 4 — Downgrade op-sqlite | ❌ Unlikely | Medium | Unknown | ❌ Risky | **RULE OUT** |
| 5 — Hybrid | Partial | None | 3–4 weeks | ✅ Probably | Folds into Option 1 |

---

## What to Rule Out Immediately

1. **Option 4 (downgrade op-sqlite):** No version of op-sqlite has a clean,
   tested combination of Expo plugin + cr-sqlite + modern API. Researching this
   further wastes time that could be spent implementing Option 1.

2. **Spending any more time trying to make `crsql_as_crr()` work in the current
   Expo build:** The error is architectural, not a configuration mistake. No amount
   of `metro.config.js` tweaking, `babel.config.js` changes, or npm package flags
   will resolve a missing native `.so` that Expo's managed build pipeline was never
   told to include.

---

## Recommended Option 1 — Concrete First Steps

The work divides cleanly into two parallel tracks:

### Track A: Transport Layer (p2pMeshCoordinator)

**Step 1 (Day 1–2):** Verify the React Native TCP/UDP package used in V1 is
compatible with RN 0.81.5 + Expo SDK 54. Install it and confirm a basic TCP server
can bind to port 8889 on the Samsung Tab Active3 under the current build.

**Step 2 (Day 2–3):** Port `p2pMeshCoordinator.ts` as-is, replacing only the
import paths. Update peer data structures to use `__crsql_siteid` as the tablet
identifier instead of whatever V1 used. Confirm UDP broadcast works between two
devices on the same Wi-Fi network.

**Step 3 (Day 3–4):** Test peer rotation (2-minute cycle), peer shuffle, and
socket cleanup on disconnect. These were the three bugs that burned V1 in the field
— validate them before building any sync logic on top.

### Track B: Sync Manager

**Step 1 (Day 1–2):** Design the delta query template for V2 tables. The pattern:

```sql
SELECT * FROM <table>
WHERE __crsql_version > ?
ORDER BY __crsql_version ASC
LIMIT 500;
```

Where `?` is the watermark for that table stored in `settings` as
`lastSyncWatermark_<tableName>`. Write a utility function that runs this query for
all 21 tables and bundles the results into a sync payload.

**Step 2 (Day 2–4):** Port the handshake protocol from `syncManager.ts`. The
sequence (handshake → send delta → receive delta → apply → update watermark) is
unchanged. The `isSyncing` mutex and `resetSyncState()` cleanup are copied directly.

**Step 3 (Day 4–5):** Port `upsertPatient()` collision detection. Because V2 uses
UUID PKs, the logic simplifies: identical UUIDs always refer to the same record (no
cross-tablet collision possible). The identity collision check (`same name+DOB from
different UUIDs`) still applies for the edge case where two tablets checked in the
same physical patient independently before syncing. Keep this logic and the
`collision_remaps` table — it is cheap insurance.

### Integration (Week 3)

Run all 8 tablets on a local Wi-Fi network with a simulated 3-day clinic (patient
creation, visit flows, form completion) before the field deployment. Specifically test:

- Router restart mid-session (the March 2026 failure scenario)
- All tablets offline simultaneously, then reconnecting
- Two tablets creating a visit for the same physical patient independently
- Report counts before and after sync (the duplicate inflation check)

---

## Column Mapping Reference (V1 → V2)

| V1 Purpose | V1 Column | V2 Column | Notes |
|-----------|----------|----------|-------|
| Device identity | `originTablet TEXT` | `__crsql_siteid TEXT` | Set at first app launch, stored in `settings` |
| Row version / conflict ordering | `syncVersion INTEGER` | `__crsql_version INTEGER` | Increment on every write |
| Sync delta filter | `lastSyncedAt INTEGER` | `__crsql_version INTEGER` | Watermark-per-table in `settings` |
| Cloud upload tracking | `cloudSyncedAt INTEGER` | Not in V2 schema yet | Add to `settings` if needed |

The V2 `__crsql_siteid` column must be populated on every INSERT to identify the
creating tablet. Set it from a UUID generated at first app launch and stored in
`settings` under key `siteId`. This is the V2 equivalent of V1's `originTablet`.

The V2 `__crsql_version` column must be incremented on every UPDATE (including any
`formData`-equivalent JSON field updates). V1 learned this the hard way with dental
records — the syncVersion was not incremented on formData updates, causing stale
records to persist after sync.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| TCP socket library incompatible with RN 0.81.5 | Low | High | Verify on Day 1 before any sync work |
| 21-table delta loop saturates TCP buffer | Medium | Medium | Tune 500-record cap; add per-table payload size logging |
| `__crsql_version` not incremented on UPDATE | Medium | High | Add a DB utility wrapper that always increments on every write |
| Router failure during sync leaves partial watermark | Low | High | Only commit watermark update after all 21 tables complete |
| UUID collision between tablets | Extremely low | High | Keep collision_remaps as safety net |
| V1 TCP/UDP network module abandoned/incompatible | Low | Medium | Evaluate `react-native-tcp-socket` as alternative on Day 1 |

---

## Summary

The cr-sqlite dream is the right long-term architecture for this app. It is simply
not achievable in the current Expo managed build before May 2026. The correct path
for now is to trust what the team already proved works: the V1 P2P mesh with delta
sync and collision handling, adapted to the V2 schema.

V2 is actually in a better starting position than V1 was: UUID primary keys
eliminate the primary source of the March 2026 field incident, the schema already
has the right CRDT-inspired columns, and two full reference implementations
(V1's proven sync code, CRSQLiteTest's bare RN cr-sqlite proof) exist in the
same repository.

Build Option 1. Test it thoroughly. Ship it in May. After the deployment, if the
team wants cr-sqlite's automatic column-level merges, eject to bare RN in V3 with
confidence — the transport layer and schema will already be in place.
