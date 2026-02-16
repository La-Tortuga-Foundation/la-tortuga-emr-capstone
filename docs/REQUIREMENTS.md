# Requirements Specification

**Project**: La Tortuga Foundation - Offline Medical EMR System
**Version**: 1.0
**Date**: January 26, 2026
**Status**: Draft

---

## Executive Summary

This document outlines the functional and non-functional requirements for the La Tortuga Foundation's offline-first medical EMR system, gathered from stakeholder meetings with medical and dental staff.

## Stakeholder Needs

### Primary Users
- Medical volunteers (doctors, nurses, physician assistants)
- Dental volunteers (dentists, dental hygienists)
- Mission coordinators
- NGO administrators

### User Goals
1. Replace paper-based intake forms with digital solution
2. Track patient data across multiple visits
3. Eliminate data silos between providers
4. Generate community health analytics
5. Operate reliably in areas without internet connectivity

---

## Functional Requirements

### 1. Medical Intake Forms

#### 1.1 Patient Demographics
**Priority**: Critical

**Requirements**:
- [ ] Capture patient name (first, last)
- [ ] Record date of birth
- [ ] Record gender (Male, Female, Other)
- [ ] Record village/community name
- [ ] Record phone number (optional)
- [ ] Record emergency contact (optional)
- [ ] **MUST** be in Spanish (patient-facing)

**Acceptance Criteria**:
- Form validates required fields before submission
- Spanish translations reviewed by bilingual staff
- Auto-complete for village names (from previous entries)

#### 1.2 Medical History
**Priority**: Critical

**Requirements**:
- [ ] Organize by body system (avoid endless scrolling)
- [ ] Use separate pages/tabs for each system:
  - Neurological
  - Ear, Nose, Throat (ENT)
  - Cardiac
  - Respiratory
  - Gastrointestinal (GI)
  - Genitourinary (GU)
  - Musculoskeletal
  - Skin/Integumentary
  - Endocrine
  - Psychiatric
  - Pain Assessment (NEW - stakeholder request)

**Stakeholder Quote**: *"I would reorder it a little bit so it should be neuro, then the ear, nose and throat, kind of like, maybe cardiac, into digestive, respiratory"*

**Acceptance Criteria**:
- Each system on separate page with "Next" button
- Option to navigate directly to any section via menu/tabs
- Checkbox-based inputs (minimize free text)
- All body systems covered per stakeholder feedback

#### 1.3 Vitals Recording
**Priority**: Critical

**Requirements**:
- [ ] Blood pressure (BP)
- [ ] Temperature
- [ ] Heart rate (HR)
- [ ] Respiratory rate (RR)
- [ ] Oxygen saturation (O2sat)
- [ ] Weight
- [ ] Height
- [ ] Pain level (0-10 scale) - NEW

**Stakeholder Quote**: *"I think that's like a vital sign too, right? [Pain] should be probably after vitals"*

**Acceptance Criteria**:
- Numeric input with validation (e.g., BP format: ###/##)
- Auto-calculate BMI from height/weight
- Pain scale visual (faces or numbers)
- Timestamp when vitals recorded

#### 1.4 Medication Prescriptions
**Priority**: High

**Requirements**:
- [ ] Common medications as checkboxes:
  - Tylenol (acetaminophen)
  - Ibuprofen
  - Pepto-Bismol
  - Vitamins (adult, children)
  - Stool softeners
  - Antacid (for reflux)
  - Metformin
  - Antibiotics (see section 1.5)
- [ ] Free text for uncommon medications
- [ ] Duration in days (3, 4, 7, 14 day options)
- [ ] Quantity of pills

**Stakeholder Quote**: *"On the medical side, do you think we should list like the common medications we give... to make those super common ones, so we'd have those, like checkable"*

**Acceptance Criteria**:
- List of 10-15 most common medications
- Dosage presets for each medication
- Duration dropdown (3, 4, 7, 14, 21, 28 days)
- Calculate total pills from dosage + duration

#### 1.5 Antibiotic Prescriptions
**Priority**: High

**Requirements**:
- [ ] Antibiotic types (checkbox):
  - Ampicillin
  - Amoxicillin
  - [Other common antibiotics]
- [ ] Dosage options
- [ ] Duration in days OR total pill count
- [ ] Special instructions (optional free text)

**Stakeholder Quote**: *"For antibiotics, if we were going to prescribe antibiotics, there's three that I think we would use... sometimes you give them four days worth 12 pills, or you give them a week's worth"*

**Acceptance Criteria**:
- Select antibiotic type from dropdown/checkbox
- Choose duration (4, 7, 14 days) or pill count (12, 21, 28 pills)
- Auto-calculate pills based on dosage frequency

#### 1.6 Wound Care Documentation
**Priority**: Medium

**Requirements**:
- [ ] Wound location (free text or body map)
- [ ] Wound size/description
- [ ] Dressing types (checkboxes):
  - 4x4 gauze
  - Hydrocolloid
  - [Other common dressings - to be specified]
- [ ] Wound care instructions
- [ ] Photos (future enhancement)

**Stakeholder Quote**: *"We've never really had it like a section for wounds and dressings... we do a lot of that... maybe we can just put it there, like any wound, any wound issues"*

**Acceptance Criteria**:
- Wound care section under "Skin/Integumentary" system
- List of 5-10 common dressing types
- Free text for wound description
- Document dressing changes

#### 1.7 Clinical Notes
**Priority**: Medium

**Requirements**:
- [ ] Free-text area for each body system
- [ ] Overall visit summary notes
- [ ] Support for stylus input (handwriting)
- [ ] Support for keyboard input

**Stakeholder Quote**: *"It would be nice, probably for the dental one, if there's just one spot that you can do, if nothing else, do a free writing, just in case something weird is there"*

**Acceptance Criteria**:
- At least one free-text field per system
- Overall "Notes" section at end
- Works with medical gloves + stylus
- Auto-save draft notes

#### 1.8 Education & Community Health
**Priority**: Low (Future)

**Requirements**:
- [ ] Track common diagnoses per community
- [ ] Generate educational recommendations
- [ ] Community health trends reporting

**Stakeholder Quote**: *"Julio had asked for more, like, what topics or what common threads we're seeing in the community, and also what our suggestion would be to help, kind of mitigate any long term issues"*

**Acceptance Criteria**:
- Export diagnosis frequency per village
- Suggest education topics (diabetes, hypertension, etc.)
- Community health summary reports

---

### 2. Dental Forms

#### 2.1 Dental Chart
**Priority**: Critical

**Requirements**:
- [ ] 32-tooth numbering system
- [ ] Tooth selection via dropdown (NOT visual chart)
- [ ] Categories for each tooth:
  - Painful teeth
  - Caries (cavities)
  - Fractured teeth

**Stakeholder Quote**: *"There's 32 teeth... that would be the easiest. Instead of a visual chart, it'd be a drop down exactly or check. We would get rid of the visual visual chart"*

**Acceptance Criteria**:
- Dropdown list of tooth numbers (1-32)
- Multi-select for each category
- Clear visual indication of selected teeth
- Easy to add/remove teeth from categories

#### 2.2 Dental Procedures
**Priority**: Critical

**Requirements**:
- [ ] Procedure tracking (checkboxes):
  - General cleanings (count)
  - Deep cleanings (count)
  - Extractions (list tooth numbers)
  - Fillings (list tooth numbers)
  - X-rays (count)
  - Fluoride treatment (yes/no)
- [ ] Automatically count procedures for daily totals

**Stakeholder Quote**: *"What we track is we did well, deep cleanings, three general cleanings, two extractions and things like that. And the boxes that we would have that you could make would be very helpful to track all of that"*

**Acceptance Criteria**:
- Quick checkboxes for procedures
- Auto-increment counters
- Daily summary: "3 cleanings, 2 extractions, 5 fillings"
- Tooth numbers for extractions/fillings

#### 2.3 Dental Medications
**Priority**: High

**Requirements**:
- [ ] Antibiotic selection:
  - Ampicillin
  - Amoxicillin
  - [Others TBD]
- [ ] Dosage: Dropdown or preset options
- [ ] Pill count: 28, 21, 15 pills (or custom)
- [ ] Pain medication options

**Stakeholder Quote**: *"I just didn't know how to handle how much we give the person, because sometimes you give them four days worth 12 pills, or you give them a week's worth... you could just, you know, come up with a few things. Because I think, you know, it's either like, 28 pills, 21 pills, 15 pills"*

**Acceptance Criteria**:
- Antibiotic dropdown with preset pills (28, 21, 15)
- Pain med options (ibuprofen, etc.)
- Optional free text for dosage notes

#### 2.4 Dental Notes
**Priority**: Low

**Requirements**:
- [ ] Free-text area for unusual cases
- [ ] Stylus support

**Stakeholder Quote**: *"It would be nice if there's just one spot that you can do, if nothing else, do a free writing, just in case something weird is there you can say, you know, something, we saw, something weird"*

**Acceptance Criteria**:
- One notes section at end of dental form
- Optional (not required)
- Works with stylus

---

### 3. User Interface Requirements

#### 3.1 Input Methods
**Priority**: Critical

**Requirements**:
- [ ] Touch-friendly (large buttons, no tiny targets)
- [ ] Stylus support (for providers wearing gloves)
- [ ] Works with medical gloves on

**Stakeholder Quote**: *"You know, do you have gloves on, or do you not? And does that affect how the tablet works?"*

**Acceptance Criteria**:
- Minimum 44x44pt touch targets
- Stylus works for all inputs
- Tested with nitrile gloves

#### 3.2 Form Layout
**Priority**: Critical

**Requirements**:
- [ ] Avoid endless scrolling
- [ ] Use separate pages/tabs for each section
- [ ] "Next" button to advance between sections
- [ ] Optional: Menu to jump to any section

**Stakeholder Quote**: *"I have found that to work better than to forever scroll... have the like next button to move on to the next system, like have cardiac a section, and then switch to respiratory"*

**Acceptance Criteria**:
- No more than 10 items per screen
- Clear "Next"/"Previous" navigation
- Progress indicator (e.g., "3 of 8")
- Tab menu to skip to sections

#### 3.3 Checkbox vs. Dropdown
**Priority**: Medium

**Requirements**:
- [ ] Prefer checkboxes over dropdowns for short lists
- [ ] Use dropdowns for long lists (e.g., tooth numbers)
- [ ] Checkboxes show all options at once (faster)

**Stakeholder Quote**: *"I think that the drop down might be just harder... I think check boxes might be easier, because if they're all laying out, if they're telling you, you could just kind of see them all at the same time"*

**Acceptance Criteria**:
- Checkboxes for <10 options
- Dropdowns for >10 options
- Large checkbox targets (easy to tap)

#### 3.4 Free Text Minimization
**Priority**: High

**Requirements**:
- [ ] Minimize free-text entry (typing is slow)
- [ ] Maximize checkboxes and presets
- [ ] Provide free text as "escape hatch" only

**Stakeholder Quote**: *"Anytime we can type it in, is easier. AI, potentially can make something like that easier... But ideally, we're looking at mostly tapping"*

**Acceptance Criteria**:
- 80%+ of inputs are tap-based (checkbox, radio, dropdown)
- <20% free text
- Free text for edge cases and notes only

---

### 4. Language & Localization

#### 4.1 Bilingual Support
**Priority**: Critical

**Requirements**:
- [ ] Patient intake forms in Spanish
- [ ] Clinical notes/provider interface in English
- [ ] Easy toggle between languages

**Stakeholder Quote**: *"It should both. Should be in Spanish and English... the health history, for sure, needs to be in Spanish. But I think our part of it, the exam procedures, and that doesn't need to be because that's, you know, we're the ones filling it out"*

**Acceptance Criteria**:
- Spanish: Patient demographics, medical history questions
- English: Provider notes, clinical interface
- Language toggle in settings
- Translations reviewed by bilingual staff

---

### 5. Priority Queue System

#### 5.1 Auto-Sorting Queue
**Priority**: Critical

**Requirements**:
- [ ] Patients sorted by priority:
  1. Critical (red)
  2. Urgent (yellow)
  3. Routine (green)
- [ ] Auto-reorder when priority changes
- [ ] Real-time updates across all tablets

**Acceptance Criteria**:
- Critical patients always at top
- Queue updates within 5 seconds across devices
- Visual color coding for priority levels
- No manual sorting needed

#### 5.2 Queue Management
**Priority**: High

**Requirements**:
- [ ] Add patient to queue
- [ ] Update patient status (waiting, in-progress, completed)
- [ ] Assign provider to patient
- [ ] Track wait time
- [ ] Remove from queue when complete

**Acceptance Criteria**:
- One-tap to add patient to queue
- Status updates sync across tablets
- Wait time auto-calculated
- Completed patients move to history (not deleted)

#### 5.3 Queue Notifications
**Priority**: Medium

**Requirements**:
- [ ] Alert assigned provider when patient ready
- [ ] Alert all providers for critical patients
- [ ] Customizable notification sounds

**Acceptance Criteria**:
- Push notification to assigned tablet
- Distinct sound for critical vs. routine
- Can silence notifications temporarily

---

### 6. Inventory Management

#### 6.1 Stock Tracking
**Priority**: High

**Requirements**:
- [ ] Track medication quantities
- [ ] Track supply quantities
- [ ] Set threshold for low stock alerts
- [ ] Categorize by type (medication, supply, equipment)

**Acceptance Criteria**:
- Real-time quantity updates
- Visual indicator for low stock (red, yellow, green)
- Easy to add/edit items
- Search and filter by category

#### 6.2 Low Stock Alerts
**Priority**: High

**Requirements**:
- [ ] Alert when quantity <= threshold
- [ ] Alert when quantity = 0 (depleted)
- [ ] Push alert to all connected tablets
- [ ] Prevent over-alerting (throttle)

**Acceptance Criteria**:
- Alert appears within 5 seconds on all tablets
- Visual + audio notification
- Only one alert per item per day (unless re-stocked)
- Alert shows item name and current quantity

#### 6.3 Usage Tracking
**Priority**: Medium

**Requirements**:
- [ ] Auto-decrement when medication prescribed
- [ ] Log who dispensed and to which patient
- [ ] Daily usage reports
- [ ] Audit trail for accountability

**Acceptance Criteria**:
- Quantity decreases when prescription saved
- Transaction log shows: time, provider, patient, amount
- Daily report: "Tylenol: Started 100, Dispensed 45, Remaining 55"

---

### 7. Data Synchronization

#### 7.1 P2P Mesh Sync
**Priority**: Critical

**Requirements**:
- [ ] Router-based mesh network (6 tablets)
- [ ] Gossip protocol for updates
- [ ] CRDT conflict resolution
- [ ] Background sync (doesn't interrupt UX)

**Acceptance Criteria**:
- Tablets auto-discover each other via mDNS
- Updates sync within 5 seconds
- No data loss in conflicts
- Sync works in background (battery optimized)

#### 7.2 Offline-First
**Priority**: Critical

**Requirements**:
- [ ] All features work without internet
- [ ] Data saved locally first
- [ ] Sync when peers available
- [ ] Cloud sync when internet available (optional)

**Acceptance Criteria**:
- App fully functional offline
- No "No internet" error messages
- Data never lost (always saved locally)
- Graceful handling of connectivity loss

#### 7.3 Conflict Resolution
**Priority**: High

**Requirements**:
- [ ] Handle simultaneous edits gracefully
- [ ] Last-write-wins with timestamp
- [ ] Field-level merging where possible
- [ ] No silent data loss

**Acceptance Criteria**:
- Two providers edit same patient → both updates preserved
- Conflicts resolved automatically (no user intervention)
- Audit log shows conflict resolution
- Test: 6 tablets edit same record → consistent final state

---

### 8. Security & Compliance

#### 8.1 Encryption
**Priority**: Critical

**Requirements**:
- [ ] SQLCipher database encryption
- [ ] Samsung Knox hardware-backed keys
- [ ] Encrypted P2P transmission (TLS)
- [ ] No PHI in plaintext on disk

**Acceptance Criteria**:
- Database file unreadable without key
- Keys stored in Knox hardware
- Stolen tablet → data is safe (encrypted)
- HIPAA audit passes

#### 8.2 Access Control
**Priority**: Critical

**Requirements**:
- [ ] Provider login (username/password)
- [ ] Optional: Biometric authentication
- [ ] Session timeout (15 min inactivity)
- [ ] Audit log of all PHI access

**Acceptance Criteria**:
- Cannot access app without login
- Auto-logout after 15 min
- Log shows: who, what, when for all patient access
- Role-based permissions (doctor, nurse, admin)

#### 8.3 Remote Wipe
**Priority**: High

**Requirements**:
- [ ] Ability to remotely wipe lost/stolen tablet
- [ ] Triggered from admin panel
- [ ] Wipe data but preserve app (for recovery)

**Acceptance Criteria**:
- Admin can mark tablet as lost
- Next time tablet connects → wipe PHI
- App remains installed (can be re-provisioned)
- Confirmation prompt before wipe

---

## Non-Functional Requirements

### Performance
- [ ] Form submission < 1 second
- [ ] Sync latency < 5 seconds (critical updates)
- [ ] Database query < 500ms (up to 1000 patients)
- [ ] App startup < 3 seconds
- [ ] Battery life > 8 hours (continuous use)

### Reliability
- [ ] 99.9% uptime during missions
- [ ] Zero data loss (tested with stress tests)
- [ ] Graceful error handling (no crashes)
- [ ] Auto-recovery from sync failures

### Usability
- [ ] Form completion time < 3 minutes (average)
- [ ] 90%+ user satisfaction rating
- [ ] < 30 min training time for new users
- [ ] Intuitive UI (minimal help needed)

### Compatibility
- [ ] Android 8.0+ (API level 26+)
- [ ] Samsung Knox-compatible tablets (preferred)
- [ ] Screen sizes: 7-10 inch tablets
- [ ] Minimum 4GB RAM, 32GB storage

### Scalability
- [ ] Handle 500+ patients per mission
- [ ] Support 6 tablets initially (expandable to 20+)
- [ ] Database size < 500MB for 1000 patients
- [ ] Sync protocol scales to 10+ devices

---

## Out of Scope (Future Enhancements)

- Photo attachments (wound photos, X-rays)
- Voice-to-text for clinical notes
- Cloud dashboard for analytics
- Integration with local health ministry systems
- iOS support
- Telemedicine video calls
- AI-assisted diagnosis
- Multi-language support beyond Spanish/English

---

## Acceptance Criteria Summary

**MVP (Minimum Viable Product) - Required for Deployment**:
- ✅ Medical intake forms (Spanish patient history, English clinical notes)
- ✅ Dental chart (32-tooth system, procedures)
- ✅ Priority queue (auto-sorting, real-time updates)
- ✅ Inventory management (tracking, low stock alerts)
- ✅ P2P sync (WiFi Direct, CRDT conflict resolution)
- ✅ Encryption (SQLCipher + Knox)
- ✅ Offline-first (all features work without internet)
- ✅ 6 tablets provisioned and tested

**Nice-to-Have (Post-MVP)**:
- Community health analytics
- Photo attachments
- Voice-to-text
- Advanced reporting

---

**Requirements Sign-Off**:
- [ ] Medical Team Lead
- [ ] Dental Team Lead
- [ ] Mission Coordinator
- [ ] Technical Lead (Jose Rodriguez)
- [ ] Capstone Advisors

**Last Updated**: January 26, 2026
**Version**: 1.0 (Draft)
