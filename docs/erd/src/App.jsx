import { useState, useRef, useEffect, useCallback } from "react";

const TEAL = "#0D9488";
const TEAL_DARK = "#0F766E";
const TEAL_LIGHT = "#CCFBF1";
const AMBER = "#F59E0B";
const SLATE = "#1E293B";
const SLATE_MID = "#334155";
const SLATE_LIGHT = "#64748B";
const WHITE = "#F8FAFC";

// ── Schema Definition ──────────────────────────────────────────────
const TABLES = {
  // LOOKUPS
  status_types:            { section: "lookup", x: 20,  y: 20,  cols: ["statusTypeId PK","label","displayOrder","color"] },
  gender_types:            { section: "lookup", x: 220, y: 20,  cols: ["genderTypeId PK","label"] },
  communities:             { section: "lookup", x: 420, y: 20,  cols: ["communityId PK","name","region","...sync"] },
  vital_types:             { section: "lookup", x: 640, y: 20,  cols: ["vitalTypeId PK","label","unit","displayOrder"] },
  condition_types:         { section: "lookup", x: 860, y: 20,  cols: ["conditionTypeId PK","label","icd10Code","...sync"] },
  medication_categories:   { section: "lookup", x: 1100,y: 20,  cols: ["medicationCategoryId PK","label","...sync"] },
  medication_types:        { section: "lookup", x: 1100,y: 160, cols: ["medicationTypeId PK","name","categoryId FK","defaultUnit","...sync"] },
  unit_types:              { section: "lookup", x: 1340,y: 20,  cols: ["unitTypeId PK","label","abbreviation"] },
  service_types:           { section: "lookup", x: 1340,y: 160, cols: ["serviceTypeId PK","label"] },
  dental_procedure_types:  { section: "lookup", x: 1580,y: 20,  cols: ["dentalProcedureTypeId PK","label","description"] },
  antibiotic_types:        { section: "lookup", x: 1580,y: 160, cols: ["antibioticTypeId PK","name","defaultDosage"] },
  inventory_categories:    { section: "lookup", x: 1820,y: 20,  cols: ["inventoryCategoryId PK","label","...sync"] },

  // CORE
  patients:                { section: "core",   x: 340, y: 390, cols: ["patientId PK","firstName","lastName","dateOfBirth","genderTypeId FK","communityId FK","phone","notes","...sync"] },
  visits:                  { section: "core",   x: 680, y: 390, cols: ["visitId PK","patientId FK","clinicId","statusTypeId FK","shortCode","checkedInAt","closedAt","...sync"] },
  visit_services:          { section: "core",   x: 1060, y: 390, cols: ["visitServiceId PK","visitId FK","serviceTypeId FK","...sync"] },

  // MEDICAL
  medical_intakes:         { section: "medical",x: 340, y: 650, cols: ["intakeId PK","visitId FK UNIQUE","chiefComplaint","nurseNotes","...sync"] },
  visit_vitals:            { section: "medical",x: 60,  y: 860, cols: ["vitalId PK","intakeId FK","vitalTypeId FK","value","recordedAt","...sync"] },
  visit_conditions:        { section: "medical",x: 310, y: 860, cols: ["visitConditionId PK","intakeId FK","conditionTypeId FK","isPrimary","notes","...sync"] },
  visit_medications:       { section: "medical",x: 570, y: 860, cols: ["visitMedicationId PK","intakeId FK","medicationTypeId FK","dosage","frequency","durationDays","quantity","unitTypeId FK","...sync"] },

  // DENTAL
  dental_intakes:          { section: "dental", x: 940, y: 560, cols: ["dentalIntakeId PK","visitId FK UNIQUE","chiefComplaint","dentistNotes","...sync"] },
  dental_procedures:       { section: "dental", x: 830, y: 760, cols: ["dentalProcedureId PK","dentalIntakeId FK","procedureTypeId FK","toothNumber","notes","...sync"] },
  dental_antibiotics:      { section: "dental", x: 1100,y: 760, cols: ["dentalAntibioticId PK","dentalIntakeId FK","antibioticTypeId FK","dosage","durationDays","...sync"] },

  // INVENTORY
  inventory_items:         { section: "inventory",x: 1400,y: 340, cols: ["itemId PK","name","medicationTypeId FK","categoryId FK","quantity","unitTypeId FK","warningThreshold","expirationDate","...sync"] },
  inventory_transactions:  { section: "inventory",x: 1400,y: 560, cols: ["transactionId PK","itemId FK","visitId FK","transactionType","quantityDelta","recordedAt","...sync"] },

  // SYSTEM
  settings:                { section: "system", x: 1700,y: 560, cols: ["key PK","value","updatedAt"] },
  collision_remaps:        { section: "system", x: 1700,y: 700, cols: ["originalPatientId PK","originalOriginTablet PK","remappedPatientId","createdAt"] },
};

const RELATIONSHIPS = [
  // patients
  { from: "patients", to: "gender_types",      fromCol: "genderTypeId FK", label: "genderTypeId" },
  { from: "patients", to: "communities",        fromCol: "communityId FK",  label: "communityId" },
  // visits
  { from: "visits",   to: "patients",           fromCol: "patientId FK",    label: "patientId" },
  { from: "visits",   to: "status_types",       fromCol: "statusTypeId FK", label: "statusTypeId" },
  // visit_services
  { from: "visit_services", to: "visits",       fromCol: "visitId FK",      label: "visitId" },
  { from: "visit_services", to: "service_types",fromCol: "serviceTypeId FK",label: "serviceTypeId" },
  // medical
  { from: "medical_intakes",   to: "visits",          fromCol: "visitId FK UNIQUE", label: "visitId" },
  { from: "visit_vitals",      to: "medical_intakes", fromCol: "intakeId FK",       label: "intakeId" },
  { from: "visit_vitals",      to: "vital_types",     fromCol: "vitalTypeId FK",    label: "vitalTypeId" },
  { from: "visit_conditions",  to: "medical_intakes", fromCol: "intakeId FK",       label: "intakeId" },
  { from: "visit_conditions",  to: "condition_types", fromCol: "conditionTypeId FK",label: "conditionTypeId" },
  { from: "visit_medications", to: "medical_intakes", fromCol: "intakeId FK",       label: "intakeId" },
  { from: "visit_medications", to: "medication_types",fromCol: "medicationTypeId FK",label: "medicationTypeId" },
  { from: "visit_medications", to: "unit_types",      fromCol: "unitTypeId FK",     label: "unitTypeId" },
  // dental
  { from: "dental_intakes",    to: "visits",                  fromCol: "visitId FK UNIQUE",  label: "visitId" },
  { from: "dental_procedures", to: "dental_intakes",          fromCol: "dentalIntakeId FK",  label: "dentalIntakeId" },
  { from: "dental_procedures", to: "dental_procedure_types",  fromCol: "procedureTypeId FK", label: "procedureTypeId" },
  { from: "dental_antibiotics",to: "dental_intakes",          fromCol: "dentalIntakeId FK",  label: "dentalIntakeId" },
  { from: "dental_antibiotics",to: "antibiotic_types",        fromCol: "antibioticTypeId FK",label: "antibioticTypeId" },
  // inventory
  { from: "inventory_items",        to: "inventory_categories", fromCol: "categoryId FK",       label: "categoryId" },
  { from: "inventory_items",        to: "unit_types",            fromCol: "unitTypeId FK",       label: "unitTypeId" },
  { from: "inventory_items",        to: "medication_types",      fromCol: "medicationTypeId FK", label: "medicationTypeId" },
  { from: "inventory_transactions", to: "inventory_items",       fromCol: "itemId FK",           label: "itemId" },
  { from: "inventory_transactions", to: "visits",                fromCol: "visitId FK",          label: "visitId" },
  // medication_types -> categories
  { from: "medication_types", to: "medication_categories", fromCol: "categoryId FK", label: "categoryId" },
];

const SECTION_COLORS = {
  lookup:    { bg: "#022C22", border: "#059669", header: "#059669", badge: "#6EE7B7" },
  core:      { bg: "#0C1A2E", border: "#3B82F6", header: "#2563EB", badge: "#93C5FD" },
  medical:   { bg: "#1A0A2E", border: "#8B5CF6", header: "#7C3AED", badge: "#C4B5FD" },
  dental:    { bg: "#1A1400", border: "#D97706", header: "#B45309", badge: "#FCD34D" },
  inventory: { bg: "#1A0D0D", border: "#EF4444", header: "#DC2626", badge: "#FCA5A5" },
  system:    { bg: "#0F1010", border: "#6B7280", header: "#4B5563", badge: "#D1D5DB" },
};

const TABLE_W = 190;
const ROW_H = 22;
const HEADER_H = 28;

function tableHeight(t) { return HEADER_H + t.cols.length * ROW_H + 6; }

function tableCenter(name) {
  const t = TABLES[name];
  return { x: t.x + TABLE_W / 2, y: t.y + tableHeight(t) / 2 };
}

function edgePoints(from, to) {
  const tf = TABLES[from], tt = TABLES[to];
  const fh = tableHeight(tf), th = tableHeight(tt);
  const fx = tf.x + TABLE_W / 2, fy = tf.y + fh / 2;
  const tx = tt.x + TABLE_W / 2, ty = tt.y + th / 2;
  const dx = tx - fx, dy = ty - fy;

  // Exit/entry sides
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
    <path
      d={d}
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
    <g
      transform={`translate(${t.x},${t.y})`}
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
    >
      {/* Shadow */}
      <rect x={3} y={3} width={TABLE_W} height={h} rx={5} fill="black" opacity={0.4} />
      {/* Body */}
      <rect
        width={TABLE_W} height={h} rx={5}
        fill={sc.bg}
        stroke={hovered ? "#FBBF24" : sc.border}
        strokeWidth={hovered ? 2 : 1}
        opacity={dimmed ? 0.25 : 1}
      />
      {/* Header */}
      <rect width={TABLE_W} height={HEADER_H} rx={5} fill={sc.header} opacity={dimmed ? 0.25 : 1} />
      <rect y={HEADER_H - 5} width={TABLE_W} height={5} fill={sc.header} opacity={dimmed ? 0.25 : 1} />
      {/* Table name */}
      <text
        x={TABLE_W / 2} y={HEADER_H / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={9.5} fontWeight="700"
        fontFamily="'JetBrains Mono', 'Courier New', monospace"
        opacity={dimmed ? 0.25 : 1}
      >
        {name}
      </text>
      {/* Columns */}
      {t.cols.map((col, i) => {
        const isPK = col.includes("PK");
        const isFK = col.includes("FK");
        const isSys = col.startsWith("...");
        const colName = col.replace(" PK","").replace(" FK","").replace(" UNIQUE","").replace(" ...sync","");
        return (
          <g key={col} transform={`translate(0,${HEADER_H + 3 + i * ROW_H})`} opacity={dimmed ? 0.25 : 1}>
            <rect width={TABLE_W} height={ROW_H} fill={i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.1)"} />
            {isPK && <rect width={3} height={ROW_H} fill={sc.badge} />}
            {isFK && !isPK && <rect width={3} height={ROW_H} fill="#F59E0B" />}
            <text
              x={9} y={ROW_H / 2 + 1}
              dominantBaseline="middle"
              fill={isPK ? sc.badge : isFK ? "#FCD34D" : isSys ? "#4B5563" : "#94A3B8"}
              fontSize={8}
              fontFamily="'JetBrains Mono', 'Courier New', monospace"
              fontWeight={isPK ? "700" : "400"}
              fontStyle={isSys ? "italic" : "normal"}
            >
              {isSys ? "○ sync metadata" : col}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function ERD() {
  const [hovered, setHovered] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.55);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const svgRef = useRef(null);

  const CANVAS_W = 2100;
  const CANVAS_H = 1050;

  const connectedTo = useCallback((name) => {
    if (!name) return new Set();
    const connected = new Set([name]);
    RELATIONSHIPS.forEach(r => {
      if (r.from === name) connected.add(r.to);
      if (r.to === name) connected.add(r.from);
    });
    return connected;
  }, []);

  const connected = hovered ? connectedTo(hovered) : null;

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.2, Math.min(1.5, z * factor)));
  };

  const onMouseDown = (e) => {
    if (e.target.closest("g[style]")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  const sections = ["lookup", "core", "medical", "dental", "inventory", "system"];

  const sectionBounds = {};
  sections.forEach(sec => {
    const tables = Object.entries(TABLES).filter(([,t]) => t.section === sec);
    if (!tables.length) return;
    const xs = tables.flatMap(([,t]) => [t.x, t.x + TABLE_W]);
    const ys = tables.flatMap(([,t]) => [t.y, t.y + tableHeight(t)]);
    sectionBounds[sec] = {
      x: Math.min(...xs) - 12,
      y: Math.min(...ys) - 22,
      w: Math.max(...xs) - Math.min(...xs) + 24,
      h: Math.max(...ys) - Math.min(...ys) + 34,
    };
  });

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "#050A0F",
      fontFamily: "'JetBrains Mono', monospace",
      overflow: "hidden",
      userSelect: "none",
    }}>
      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "10px 20px",
        background: "rgba(5,10,15,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #0F2D2A",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL, boxShadow: `0 0 8px ${TEAL}` }} />
          <span style={{ color: TEAL, fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>LA TORTUGA EMR</span>
          <span style={{ color: "#334155", fontSize: 11 }}>|</span>
          <span style={{ color: "#64748B", fontSize: 11 }}>Database Schema V2  ·  Entity Relationship Diagram</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {sections.map(sec => (
            <button key={sec} onClick={() => setActiveSection(activeSection === sec ? null : sec)}
              style={{
                padding: "3px 10px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                background: activeSection === sec ? SECTION_COLORS[sec].header : "transparent",
                color: activeSection === sec ? "white" : SECTION_COLORS[sec].badge,
                border: `1px solid ${SECTION_COLORS[sec].border}`,
                cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
                opacity: activeSection && activeSection !== sec ? 0.4 : 1,
              }}>
              {sec}
            </button>
          ))}
        </div>
        <div style={{ color: "#334155", fontSize: 10 }}>
          scroll to zoom  ·  drag to pan  ·  hover table to trace relations
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, left: 16, zIndex: 10,
        background: "rgba(5,10,15,0.88)",
        border: "1px solid #0F2D2A",
        borderRadius: 6, padding: "8px 14px",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        {[
          { color: "#6EE7B7", label: "Primary Key (PK)" },
          { color: "#FCD34D", label: "Foreign Key (FK)" },
          { color: "#94A3B8", label: "Regular column" },
          { color: "#4B5563", label: "Sync metadata" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 3, background: color, borderRadius: 2 }} />
            <span style={{ color: "#64748B", fontSize: 9 }}>{label}</span>
          </div>
        ))}
        <div style={{ marginTop: 4, borderTop: "1px solid #1E293B", paddingTop: 5 }}>
          {sections.map(sec => (
            <div key={sec} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: SECTION_COLORS[sec].header }} />
              <span style={{ color: "#64748B", fontSize: 9, textTransform: "capitalize" }}>{sec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{
        position: "absolute", bottom: 16, right: 16, zIndex: 10,
        display: "flex", gap: 6,
      }}>
        {[["−", 0.85], ["+", 1.15], ["⟳", "reset"]].map(([label, factor]) => (
          <button key={label}
            onClick={() => factor === "reset" ? (setZoom(0.55), setPan({ x: 0, y: 0 })) : setZoom(z => Math.max(0.2, Math.min(1.5, z * factor)))}
            style={{
              width: 30, height: 30, borderRadius: 4,
              background: "#0F1A1F", border: "1px solid #0F2D2A",
              color: TEAL, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {label}
          </button>
        ))}
        <div style={{
          padding: "0 10px", height: 30, borderRadius: 4,
          background: "#0F1A1F", border: "1px solid #0F2D2A",
          color: "#64748B", fontSize: 10,
          display: "flex", alignItems: "center",
        }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%" height="100%"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: dragging ? "grabbing" : "grab", display: "block" }}
      >
        <defs>
          {sections.map(sec => (
            <marker key={sec} id={`arrow-${sec}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={SECTION_COLORS[sec].border} opacity={0.7} />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${pan.x + 20},${pan.y + 50}) scale(${zoom})`}>
          {/* Section backgrounds */}
          {sections.map(sec => {
            const b = sectionBounds[sec];
            if (!b) return null;
            const sc = SECTION_COLORS[sec];
            const dimSec = activeSection && activeSection !== sec;
            return (
              <g key={sec} opacity={dimSec ? 0.15 : 1}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8}
                  fill={sc.bg} stroke={sc.border} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="6 4" />
                <text x={b.x + 10} y={b.y + 14} fontSize={9} fontWeight={700}
                  fill={sc.badge} fontFamily="'JetBrains Mono', monospace"
                  style={{ textTransform: "uppercase", letterSpacing: 2 }}>
                  {sec}
                </text>
              </g>
            );
          })}

          {/* Edges */}
          {RELATIONSHIPS.map((r, i) => {
            const fromSec = TABLES[r.from]?.section;
            const toSec = TABLES[r.to]?.section;
            const dimSec = activeSection && fromSec !== activeSection && toSec !== activeSection;
            const highlight = hovered && (r.from === hovered || r.to === hovered);
            const dim = (hovered && !highlight) || dimSec;
            return <BezierEdge key={i} from={r.from} to={r.to} highlight={highlight} dim={dim} />;
          })}

          {/* Tables */}
          {Object.keys(TABLES).map(name => {
            const sec = TABLES[name].section;
            const dimSec = activeSection && sec !== activeSection;
            const dimHover = hovered && connected && !connected.has(name);
            return (
              <TableBox
                key={name} name={name}
                onHover={setHovered}
                hovered={hovered === name}
                dimmed={dimSec || dimHover}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
