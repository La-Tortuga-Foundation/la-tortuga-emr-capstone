import { useState, useRef, useEffect, useCallback } from "react";

const TEAL = "#0D9488";
const AMBER = "#F59E0B";
const SLATE = "#1E293B";
const SLATE_MID = "#334155";
const SLATE_LIGHT = "#64748B";

// ── Schema Definition ──────────────────────────────────────────────
const TABLES = {
  // ── DYNAMIC LOOKUPS (5) ─────────────────────────────────────────
  communities:            { section: "lookup", x: 20,   y: 20,  cols: ["communityId PK","name","region","...sync"] },
  condition_types:        { section: "lookup", x: 240,  y: 20,  cols: ["conditionTypeId PK","label","icd10Code","...sync"] },
  medication_categories:  { section: "lookup", x: 460,  y: 20,  cols: ["medicationCategoryId PK","label","...sync"] },
  medication_types:       { section: "lookup", x: 460,  y: 180, cols: ["medicationTypeId PK","name","categoryId FK","defaultUnit","...sync"] },
  inventory_categories:   { section: "lookup", x: 680,  y: 20,  cols: ["inventoryCategoryId PK","label","...sync"] },

  // ── CORE (3) ────────────────────────────────────────────────────
  patients:               { section: "core",   x: 20,   y: 360, cols: ["patientId PK","firstName","lastName","dateOfBirth","genderTypeId","communityId FK","phone","notes","...sync"] },
  visits:                 { section: "core",   x: 300,  y: 360, cols: ["visitId PK","patientId FK","clinicId","statusTypeId","shortCode","checkedInAt","closedAt","...sync"] },
  visit_services:         { section: "core",   x: 580,  y: 360, cols: ["visitServiceId PK","visitId FK","serviceTypeId","...sync"] },

  // ── MEDICAL (5) ─────────────────────────────────────────────────
  medical_intakes:        { section: "medical", x: 20,   y: 620, cols: ["intakeId PK","visitId FK UNIQUE","reasonForVisit","symptoms","familyHistory","familyHistoryDetails","painLevel","painDuration","painLocations","painQuality","woundCare","prescriptionMeds","otcMeds","herbalRemedies","carePlan","woundCareDetails","clinicalNotes","...sync"] },
  visit_vitals:           { section: "medical", x: 360,  y: 620, cols: ["vitalId PK","intakeId FK","vitalTypeId","value","recordedAt","...sync"] },
  visit_conditions:       { section: "medical", x: 580,  y: 620, cols: ["visitConditionId PK","intakeId FK","conditionTypeId FK","isPrimary","notes","...sync"] },
  visit_medications:      { section: "medical", x: 800,  y: 620, cols: ["visitMedicationId PK","intakeId FK","medicationTypeId FK","dosage","frequency","durationDays","quantity","unitTypeId","...sync"] },
  medications_dispensed:  { section: "medical", x: 1020, y: 620, cols: ["dispensedId PK","intakeId FK","medicationGivenTypeId","quantity","unitTypeId","...sync"] },

  // ── DENTAL (3) ──────────────────────────────────────────────────
  dental_intakes:         { section: "dental", x: 20,   y: 1000, cols: ["dentalIntakeId PK","visitId FK UNIQUE","chiefComplaint","painLevel","isEmergency","oralHygiene","visibleDecay","gingivalCondition","toothChart","diagnosis","treatmentPerformed","followUp","medications","dentistNotes","...sync"] },
  dental_procedures:      { section: "dental", x: 360,  y: 1000, cols: ["dentalProcedureId PK","dentalIntakeId FK","procedureTypeId","toothNumber","notes","...sync"] },
  dental_antibiotics:     { section: "dental", x: 600,  y: 1000, cols: ["dentalAntibioticId PK","dentalIntakeId FK","antibioticTypeId","dosage","durationDays","...sync"] },

  // ── INVENTORY (2) ───────────────────────────────────────────────
  inventory_items:        { section: "inventory", x: 900,  y: 360, cols: ["itemId PK","name","medicationTypeId FK","categoryId FK","quantity","unitTypeId","warningThreshold","expirationDate","...sync"] },
  inventory_transactions: { section: "inventory", x: 900,  y: 620, cols: ["transactionId PK","itemId FK","visitId FK","transactionType","quantityDelta","recordedAt","...sync"] },

  // ── SYSTEM (2) ──────────────────────────────────────────────────
  settings:               { section: "system", x: 1180, y: 360, cols: ["key PK","value","updatedAt"] },
  collision_remaps:       { section: "system", x: 1180, y: 520, cols: ["originalPatientId PK","originalOriginTablet PK","remappedPatientId","createdAt"] },
};

const RELATIONSHIPS = [
  // patients
  { from: "patients",              to: "communities",          label: "communityId" },
  // visits
  { from: "visits",                to: "patients",             label: "patientId" },
  // visit_services
  { from: "visit_services",        to: "visits",               label: "visitId" },
  // medical
  { from: "medical_intakes",       to: "visits",               label: "visitId" },
  { from: "visit_vitals",          to: "medical_intakes",      label: "intakeId" },
  { from: "visit_conditions",      to: "medical_intakes",      label: "intakeId" },
  { from: "visit_conditions",      to: "condition_types",      label: "conditionTypeId" },
  { from: "visit_medications",     to: "medical_intakes",      label: "intakeId" },
  { from: "visit_medications",     to: "medication_types",     label: "medicationTypeId" },
  { from: "medications_dispensed", to: "medical_intakes",      label: "intakeId" },
  // dental
  { from: "dental_intakes",        to: "visits",               label: "visitId" },
  { from: "dental_procedures",     to: "dental_intakes",       label: "dentalIntakeId" },
  { from: "dental_antibiotics",    to: "dental_intakes",       label: "dentalIntakeId" },
  // inventory
  { from: "inventory_items",       to: "inventory_categories", label: "categoryId" },
  { from: "inventory_items",       to: "medication_types",     label: "medicationTypeId" },
  { from: "inventory_transactions",to: "inventory_items",      label: "itemId" },
  { from: "inventory_transactions",to: "visits",               label: "visitId" },
  // medication_types
  { from: "medication_types",      to: "medication_categories",label: "categoryId" },
];

const SECTION_COLORS = {
  lookup:    { bg: "#022C22", border: "#059669", header: "#059669", badge: "#6EE7B7" },
  core:      { bg: "#0C1A2E", border: "#3B82F6", header: "#2563EB", badge: "#93C5FD" },
  medical:   { bg: "#1A0A2E", border: "#8B5CF6", header: "#7C3AED", badge: "#C4B5FD" },
  dental:    { bg: "#1A1400", border: "#D97706", header: "#B45309", badge: "#FCD34D" },
  inventory: { bg: "#1A0D0D", border: "#EF4444", header: "#DC2626", badge: "#FCA5A5" },
  system:    { bg: "#0F1010", border: "#6B7280", header: "#4B5563", badge: "#D1D5DB" },
};

const TABLE_W = 200;
const ROW_H = 22;
const HEADER_H = 28;

function tableHeight(t) { return HEADER_H + t.cols.length * ROW_H + 6; }

function edgePoints(from, to) {
  const tf = TABLES[from], tt = TABLES[to];
  const fh = tableHeight(tf), th = tableHeight(tt);
  const fx = tf.x + TABLE_W / 2, fy = tf.y + fh / 2;
  const tx = tt.x + TABLE_W / 2, ty = tt.y + th / 2;
  const dx = tx - fx, dy = ty - fy;
  let x1, y1, x2, y2;
  if (Math.abs(dx) > Math.abs(dy)) {
    x1 = dx > 0 ? tf.x + TABLE_W : tf.x;
    y1 = fy;
    x2 = dx > 0 ? tt.x : tt.x + TABLE_W;
    y2 = ty;
  } else {
    x1 = fx;
    y1 = dy > 0 ? tf.y + fh : tf.y;
    x2 = tx;
    y2 = dy > 0 ? tt.y : tt.y + th;
  }
  return { x1, y1, x2, y2 };
}

function BezierEdge({ from, to, highlight, dim }) {
  const { x1, y1, x2, y2 } = edgePoints(from, to);
  const dx = x2 - x1, dy = y2 - y1;
  const cx1 = x1 + dx * 0.4, cy1 = y1;
  const cx2 = x2 - dx * 0.4, cy2 = y2;
  const d = `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
  const sec = TABLES[from].section;
  const color = SECTION_COLORS[sec].border;
  return (
    <path d={d}
      stroke={highlight ? "#FBBF24" : dim ? "#1E293B" : color}
      strokeWidth={highlight ? 2.5 : 1.2}
      strokeOpacity={dim ? 0.2 : highlight ? 1 : 0.55}
      fill="none"
      strokeDasharray={highlight ? "none" : "4 3"}
      markerEnd={`url(#arrow-${sec})`}
    />
  );
}

function TableBox({ name, onHover, hovered, dimmed }) {
  const t = TABLES[name];
  const sc = SECTION_COLORS[t.section];
  const h = tableHeight(t);
  return (
    <g transform={`translate(${t.x},${t.y})`}
      opacity={dimmed ? 0.15 : 1}
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}>
      <rect width={TABLE_W} height={h} rx={4} fill="#0A1628"
        stroke={hovered ? "#FBBF24" : sc.border}
        strokeWidth={hovered ? 2 : 1} strokeOpacity={hovered ? 1 : 0.6} />
      <rect width={TABLE_W} height={HEADER_H} rx={4} fill={sc.header} opacity={0.9} />
      <rect y={HEADER_H - 4} width={TABLE_W} height={4} fill={sc.header} opacity={0.9} />
      <text x={TABLE_W / 2} y={HEADER_H / 2 + 4} textAnchor="middle"
        fontSize={9} fontWeight={700} fill="white"
        fontFamily="'JetBrains Mono', monospace"
        style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {name}
      </text>
      {t.cols.map((col, i) => {
        const isPK = col.includes("PK");
        const isFK = col.includes("FK");
        const isSync = col.startsWith("...");
        const isJSON = ["symptoms","familyHistory","painLocations","painQuality","woundCare","toothChart"].some(j => col.startsWith(j));
        const color = isPK ? "#6EE7B7" : isFK ? "#FCD34D" : isSync ? "#4B5563" : isJSON ? "#FB923C" : "#94A3B8";
        const label = col.replace(" PK","").replace(" FK","").replace(" UNIQUE","");
        return (
          <g key={i} transform={`translate(0,${HEADER_H + 3 + i * ROW_H})`}>
            <rect width={TABLE_W} height={ROW_H} fill={i % 2 === 0 ? "#0D1F35" : "#0A1628"} />
            {isPK && <rect width={3} height={ROW_H} fill="#6EE7B7" opacity={0.8} />}
            {isFK && !isPK && <rect width={3} height={ROW_H} fill="#FCD34D" opacity={0.6} />}
            {isJSON && <rect width={3} height={ROW_H} fill="#FB923C" opacity={0.6} />}
            <text x={10} y={ROW_H / 2 + 4} fontSize={8.5} fill={color}
              fontFamily="'JetBrains Mono', monospace">
              {label}
            </text>
            {isPK && <text x={TABLE_W - 6} y={ROW_H / 2 + 4} fontSize={7} fill="#6EE7B7" textAnchor="end" fontFamily="'JetBrains Mono', monospace" opacity={0.7}>PK</text>}
            {isFK && !isPK && <text x={TABLE_W - 6} y={ROW_H / 2 + 4} fontSize={7} fill="#FCD34D" textAnchor="end" fontFamily="'JetBrains Mono', monospace" opacity={0.7}>FK</text>}
            {isJSON && <text x={TABLE_W - 6} y={ROW_H / 2 + 4} fontSize={7} fill="#FB923C" textAnchor="end" fontFamily="'JetBrains Mono', monospace" opacity={0.7}>JSON</text>}
          </g>
        );
      })}
    </g>
  );
}

export default function ERDViewer() {
  const [hovered, setHovered] = useState(null);
  const [zoom, setZoom] = useState(0.55);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(null);
  const svgRef = useRef(null);

  const connected = hovered ? new Set(
    RELATIONSHIPS
      .filter(r => r.from === hovered || r.to === hovered)
      .flatMap(r => [r.from, r.to])
  ) : null;

  const sectionBounds = {};
  Object.entries(TABLES).forEach(([, t]) => {
    const sec = t.section;
    const h = tableHeight(t);
    if (!sectionBounds[sec]) {
      sectionBounds[sec] = { x: t.x, y: t.y, x2: t.x + TABLE_W, y2: t.y + h };
    } else {
      sectionBounds[sec].x = Math.min(sectionBounds[sec].x, t.x);
      sectionBounds[sec].y = Math.min(sectionBounds[sec].y, t.y);
      sectionBounds[sec].x2 = Math.max(sectionBounds[sec].x2, t.x + TABLE_W);
      sectionBounds[sec].y2 = Math.max(sectionBounds[sec].y2, t.y + h);
    }
  });
  Object.keys(sectionBounds).forEach(sec => {
    const b = sectionBounds[sec];
    b.w = b.x2 - b.x + 30; b.h = b.y2 - b.y + 30;
    b.x -= 15; b.y -= 20;
  });

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.15, Math.min(1.5, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  }, []);

  const onMouseDown = useCallback((e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  const sections = [...new Set(Object.values(TABLES).map(t => t.section))];
  const totalTables = Object.keys(TABLES).length;

  return (
    <div style={{ width:"100%", height:"100vh", background:"#050A0F", position:"relative", overflow:"hidden", fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
      {/* Header */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, height:44,
        background:"rgba(5,10,15,0.95)", borderBottom:"1px solid #0F2D2A",
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:TEAL, boxShadow:`0 0 8px ${TEAL}` }} />
          <span style={{ color:TEAL, fontSize:13, fontWeight:700, letterSpacing:2 }}>LA TORTUGA EMR</span>
          <span style={{ color:"#334155", fontSize:11 }}>|</span>
          <span style={{ color:"#64748B", fontSize:11 }}>Database Schema V2  ·  {totalTables} Tables  ·  Hybrid Architecture</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {sections.map(sec => (
            <button key={sec} onClick={() => setActiveSection(activeSection === sec ? null : sec)}
              style={{ padding:"3px 10px", borderRadius:4, fontSize:9, fontWeight:700,
                background: activeSection === sec ? SECTION_COLORS[sec].header : "transparent",
                color: activeSection === sec ? "white" : SECTION_COLORS[sec].badge,
                border:`1px solid ${SECTION_COLORS[sec].border}`, cursor:"pointer",
                letterSpacing:1, textTransform:"uppercase",
                opacity: activeSection && activeSection !== sec ? 0.4 : 1 }}>
              {sec}
            </button>
          ))}
        </div>
        <div style={{ color:"#334155", fontSize:10 }}>scroll to zoom · drag to pan · hover to trace</div>
      </div>

      {/* Legend */}
      <div style={{ position:"absolute", bottom:16, left:16, zIndex:10,
        background:"rgba(5,10,15,0.88)", border:"1px solid #0F2D2A",
        borderRadius:6, padding:"8px 14px", display:"flex", flexDirection:"column", gap:5 }}>
        {[
          { color:"#6EE7B7", label:"Primary Key (PK)" },
          { color:"#FCD34D", label:"Foreign Key (FK)" },
          { color:"#FB923C", label:"JSON column" },
          { color:"#94A3B8", label:"Regular column" },
          { color:"#4B5563", label:"Sync metadata" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:3, background:color, borderRadius:2 }} />
            <span style={{ color:"#64748B", fontSize:9 }}>{label}</span>
          </div>
        ))}
        <div style={{ marginTop:4, borderTop:"1px solid #1E293B", paddingTop:5 }}>
          {sections.map(sec => (
            <div key={sec} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:SECTION_COLORS[sec].header }} />
              <span style={{ color:"#64748B", fontSize:9, textTransform:"capitalize" }}>{sec}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:4, borderTop:"1px solid #1E293B", paddingTop:5 }}>
          <span style={{ color:"#334155", fontSize:9 }}>{totalTables} tables · static lookups → TS constants</span>
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{ position:"absolute", bottom:16, right:16, zIndex:10, display:"flex", gap:6 }}>
        {[["−",0.85],["+",1.15],["⟳","reset"]].map(([label, factor]) => (
          <button key={label}
            onClick={() => factor === "reset" ? (setZoom(0.55), setPan({x:0,y:0})) : setZoom(z => Math.max(0.15, Math.min(1.5, z * factor)))}
            style={{ width:30, height:30, borderRadius:4, background:"#0F1A1F",
              border:"1px solid #0F2D2A", color:TEAL, fontSize:14, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
            {label}
          </button>
        ))}
        <div style={{ padding:"0 10px", height:30, borderRadius:4, background:"#0F1A1F",
          border:"1px solid #0F2D2A", color:"#64748B", fontSize:10,
          display:"flex", alignItems:"center" }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} width="100%" height="100%"
        onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        style={{ cursor: dragging ? "grabbing" : "grab", display:"block" }}>
        <defs>
          {sections.map(sec => (
            <marker key={sec} id={`arrow-${sec}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={SECTION_COLORS[sec].border} opacity={0.7} />
            </marker>
          ))}
        </defs>
        <g transform={`translate(${pan.x + 20},${pan.y + 50}) scale(${zoom})`}>
          {sections.map(sec => {
            const b = sectionBounds[sec];
            if (!b) return null;
            const sc = SECTION_COLORS[sec];
            const dimSec = activeSection && activeSection !== sec;
            return (
              <g key={sec} opacity={dimSec ? 0.15 : 1}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8}
                  fill={sc.bg} stroke={sc.border} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="6 4" />
                <text x={b.x+10} y={b.y+14} fontSize={9} fontWeight={700}
                  fill={sc.badge} fontFamily="'JetBrains Mono',monospace"
                  style={{ textTransform:"uppercase", letterSpacing:2 }}>
                  {sec}
                </text>
              </g>
            );
          })}
          {RELATIONSHIPS.map((r, i) => {
            const fromSec = TABLES[r.from]?.section;
            const toSec = TABLES[r.to]?.section;
            const dimSec = activeSection && fromSec !== activeSection && toSec !== activeSection;
            const highlight = hovered && (r.from === hovered || r.to === hovered);
            const dim = (hovered && !highlight) || dimSec;
            return <BezierEdge key={i} from={r.from} to={r.to} highlight={highlight} dim={dim} />;
          })}
          {Object.keys(TABLES).map(name => {
            const sec = TABLES[name].section;
            const dimSec = activeSection && sec !== activeSection;
            const dimHover = hovered && connected && !connected.has(name);
            return (
              <TableBox key={name} name={name} onHover={setHovered}
                hovered={hovered === name} dimmed={dimSec || dimHover} />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
