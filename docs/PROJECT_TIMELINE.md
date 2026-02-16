# Project Timeline & Milestones

**Project Duration**: January 26, 2026 - May 2026 (End of Semester)
**Team**: Jacob Luytjes, Jonathan Gomez, Jose Rodriguez

---

## Sprint Overview

| Sprint | Dates | Focus Area | Deliverables |
|--------|-------|------------|--------------|
| Sprint 0 | Jan 26 - Feb 8 | Setup & Planning | Repo, schemas, prototypes |
| Sprint 1 | Feb 9 - Feb 22 | Core UI | Login, forms scaffolding |
| Sprint 2 | Feb 23 - Mar 8 | Medical Features | Intake forms, vitals |
| Sprint 3 | Mar 9 - Mar 22 | Dental Features | Dental chart, procedures |
| Sprint 4 | Mar 23 - Apr 5 | Queue & Inventory | Priority queue, stock alerts |
| Sprint 5 | Apr 6 - Apr 19 | P2P Sync | WiFi Direct, gossip protocol |
| Sprint 6 | Apr 20 - May 3 | Security | Knox, encryption |
| Sprint 7 | May 4 - May 17 | Testing & Polish | Integration tests, UX refinement |
| Sprint 8 | May 18 - End | Deployment & Docs | Master image, handoff |

---

## Detailed Sprint Breakdown

### Sprint 0: Project Foundation (Jan 26 - Feb 8, 2026)

**Goals**: Establish development environment, finalize requirements, create technical foundation

#### Week 1 (Jan 26 - Feb 1)
**All Team**
- [x] GitHub repository setup
- [ ] Development environment setup (Android Studio, React Native)
- [ ] Project structure creation
- [ ] Team roles and communication protocols established

**Jose (Infrastructure Lead)**
- [ ] Design SQLite database schema
- [ ] Create ER diagrams
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure ESLint, Prettier, testing frameworks

**Jacob (Medical Forms)**
- [ ] Create UI mockups for medical intake
- [ ] Design component hierarchy
- [ ] List all required form fields from stakeholder meetings

**Jonathan (Dental & Inventory)**
- [ ] Create UI mockups for dental chart
- [ ] Design 32-tooth selection interface
- [ ] Draft inventory management schema

#### Week 2 (Feb 2 - Feb 8)
**All Team**
- [ ] Sprint retrospective
- [ ] Demo basic app shell to stakeholders
- [ ] Gather feedback, adjust plans

**Jose**
- [ ] Implement database layer (SQLite setup)
- [ ] Create migration scripts
- [ ] Write database service tests

**Jacob**
- [ ] Build reusable form components
- [ ] Implement form validation library integration
- [ ] Create Spanish/English translation files

**Jonathan**
- [ ] Build login screen UI
- [ ] Implement authentication flow
- [ ] Create navigation structure

**Deliverables**:
- ✅ GitHub repository with complete structure
- ✅ Database schema document
- ✅ UI mockups for all screens
- ✅ Basic React Native app running on device
- ✅ Sprint 1 backlog prioritized

---

### Sprint 1: Core UI Development (Feb 9 - Feb 22, 2026)

**Goals**: Build functional UI for all screens (no backend integration yet)

#### Week 3 (Feb 9 - Feb 15)
**Jacob (Medical Intake)**
- [ ] Build patient search screen
- [ ] Create patient demographics form
- [ ] Implement medical history tabs (neuro, cardiac, respiratory, etc.)
- [ ] Add systems review checkboxes
- [ ] Build vitals recording component

**Jonathan (Login & Dental)**
- [ ] Complete login screen with validation
- [ ] Build patient selection screen
- [ ] Create dental chart visual component
- [ ] Implement tooth number selector (1-32)
- [ ] Add procedure checkboxes (cleanings, extractions)

**Jose (Navigation & Common Components)**
- [ ] Implement tab navigation (Medical, Dental, Queue, Inventory)
- [ ] Create header components with language toggle
- [ ] Build loading indicators
- [ ] Implement error message components
- [ ] Create sync status indicator

#### Week 4 (Feb 16 - Feb 22)
**Jacob**
- [ ] Add free-text notes sections
- [ ] Implement medication preset list (Tylenol, ibuprofen, etc.)
- [ ] Build pain assessment component
- [ ] Create treatment plan section

**Jonathan**
- [ ] Add antibiotic prescription selector
- [ ] Implement dosage options (28/21/15 pills)
- [ ] Create dental notes section
- [ ] Build inventory list view

**Jose**
- [ ] Integrate i18next for Spanish/English
- [ ] Create style guide and theme
- [ ] Set up Redux store structure
- [ ] Write component unit tests

**Deliverables**:
- ✅ All screens navigable with dummy data
- ✅ Forms validate input (client-side)
- ✅ Spanish/English toggle works
- ✅ Stylus/touch input tested on tablet
- ✅ 70%+ component test coverage

---

### Sprint 2: Medical Features Integration (Feb 23 - Mar 8, 2026)

**Goals**: Connect medical intake forms to database, implement CRUD operations

#### Week 5 (Feb 23 - Mar 1)
**Jacob (Medical Forms)**
- [ ] Connect patient search to SQLite
- [ ] Implement patient creation (INSERT)
- [ ] Save medical history to database
- [ ] Load existing patient records (SELECT)
- [ ] Handle form state with Redux

**Jose (Database Integration)**
- [ ] Implement patient service layer
- [ ] Create medical record service
- [ ] Write SQL queries for CRUD operations
- [ ] Add database migrations for schema updates
- [ ] Build data access layer tests

**Jonathan (Inventory Foundation)**
- [ ] Design inventory database schema
- [ ] Create inventory service layer
- [ ] Build inventory CRUD operations
- [ ] Implement stock level tracking

#### Week 6 (Mar 2 - Mar 8)
**Jacob**
- [ ] Implement update patient records
- [ ] Add visit history view
- [ ] Create vitals trend visualization
- [ ] Handle edge cases (missing data, validation errors)

**Jose**
- [ ] Optimize database queries (indexing)
- [ ] Implement transaction handling
- [ ] Add data validation at service layer
- [ ] Create database backup utility

**Jonathan**
- [ ] Build inventory add/edit screens
- [ ] Implement category filtering
- [ ] Add search functionality
- [ ] Create usage history log

**Deliverables**:
- ✅ Medical intake fully functional (create, read, update)
- ✅ Data persists in SQLite
- ✅ Inventory CRUD complete
- ✅ Integration tests for database operations
- ✅ Performance benchmarks documented

---

### Sprint 3: Dental Features (Mar 9 - Mar 22, 2026)

**Goals**: Complete dental chart functionality and integrate with database

#### Week 7 (Mar 9 - Mar 15)
**Jonathan (Dental Chart)**
- [ ] Build interactive 32-tooth selector
- [ ] Implement tooth category tagging (painful, caries, fractured)
- [ ] Create procedure tracker (cleanings, extractions)
- [ ] Add antibiotic prescription flow
- [ ] Connect dental chart to database

**Jacob (Medical Polish)**
- [ ] Add wound care section
- [ ] Implement dressing type selector
- [ ] Create wound documentation fields
- [ ] Refine Spanish translations with feedback

**Jose (Testing & Infrastructure)**
- [ ] Write integration tests for dental features
- [ ] Set up end-to-end testing framework
- [ ] Create test data generator
- [ ] Document API for dental services

#### Week 8 (Mar 16 - Mar 22)
**Jonathan**
- [ ] Implement dental record history view
- [ ] Add procedure count tracking
- [ ] Create dental summary report
- [ ] Handle multi-visit scenarios

**Jacob**
- [ ] Build patient summary dashboard
- [ ] Show combined medical + dental history
- [ ] Add quick access to recent visits
- [ ] Implement print/export functionality

**Jose**
- [ ] Performance testing on target tablets
- [ ] Optimize render performance
- [ ] Battery usage profiling
- [ ] Create performance benchmark report

**Deliverables**:
- ✅ Dental chart fully functional
- ✅ Dental records persist and load correctly
- ✅ Patient summary shows both medical & dental
- ✅ E2E tests cover main workflows
- ✅ App runs smoothly on Samsung tablets

---

### Sprint 4: Queue & Inventory Management (Mar 23 - Apr 5, 2026)

**Goals**: Implement priority queue system and inventory alerts

#### Week 9 (Mar 23 - Mar 29)
**Jacob (Priority Queue)**
- [ ] Build queue list component
- [ ] Implement auto-sorting algorithm (critical → routine)
- [ ] Create patient status updates (waiting, in-progress, completed)
- [ ] Add wait time calculation
- [ ] Design queue notification system

**Jonathan (Inventory Alerts)**
- [ ] Implement threshold-based alerts
- [ ] Create low stock notification UI
- [ ] Build inventory depletion tracker
- [ ] Add reorder suggestion system
- [ ] Create inventory dashboard

**Jose (Queue Backend)**
- [ ] Design queue database schema
- [ ] Implement queue service layer
- [ ] Create priority calculation logic
- [ ] Add queue state management (Redux)
- [ ] Write queue service tests

#### Week 10 (Mar 30 - Apr 5)
**Jacob**
- [ ] Add queue filtering (by status, priority)
- [ ] Implement provider assignment
- [ ] Create queue history log
- [ ] Build queue analytics (avg wait time, throughput)

**Jonathan**
- [ ] Implement inventory usage tracking
- [ ] Add automatic stock deduction on prescription
- [ ] Create inventory reports
- [ ] Build category-based views

**Jose**
- [ ] Optimize queue updates for real-time performance
- [ ] Implement notification service
- [ ] Add alert throttling (prevent spam)
- [ ] Create stress test for queue updates

**Deliverables**:
- ✅ Priority queue auto-sorts correctly
- ✅ Queue updates in real-time (local device)
- ✅ Inventory alerts trigger at thresholds
- ✅ Stock levels update on prescription
- ✅ Queue stress test passes (100+ patients)

---

### Sprint 5: P2P Synchronization (Apr 6 - Apr 19, 2026)

**Goals**: Implement router-based mesh networking and gossip protocol

#### Week 11 (Apr 6 - Apr 12)
**Jose (Sync Architecture)**
- [ ] Research mDNS/Bonjour for peer discovery
- [ ] Design gossip protocol specification
- [ ] Implement mDNS-based peer discovery
- [ ] Create HTTP/WebSocket connection manager
- [ ] Build message serialization/deserialization

**Jacob (Sync UI)**
- [ ] Create sync status indicator
- [ ] Build connection list screen (show connected tablets)
- [ ] Add manual sync trigger button
- [ ] Implement sync progress indicator

**Jonathan (Conflict Handling)**
- [ ] Research CRDT algorithms
- [ ] Design conflict resolution strategy
- [ ] Implement version vector tracking
- [ ] Create merge logic for patient records

#### Week 12 (Apr 13 - Apr 19)
**Jose**
- [ ] Implement gossip broadcast mechanism
- [ ] Add sync queue for pending changes
- [ ] Create background sync service
- [ ] Prevent Android OS from killing sync process
- [ ] Write sync protocol tests

**Jacob**
- [ ] Handle sync errors gracefully in UI
- [ ] Show conflict resolution to user (if needed)
- [ ] Add retry mechanism for failed syncs
- [ ] Create sync log viewer

**Jonathan**
- [ ] Implement field-level merging
- [ ] Add timestamp-based tie-breaking
- [ ] Test conflict scenarios (2+ tablets editing same patient)
- [ ] Document conflict resolution rules

**Deliverables**:
- ✅ Router-based mesh connects 6 tablets
- ✅ Patient updates sync across devices (< 5 sec latency)
- ✅ Conflicts resolved without data loss
- ✅ Background sync works reliably
- ✅ Sync stress test passes (6 devices, 100 updates/min)

---

### Sprint 6: Security & Encryption (Apr 20 - May 3, 2026)

**Goals**: Implement Samsung Knox encryption and HIPAA compliance

#### Week 13 (Apr 20 - Apr 26)
**Jose (Knox Integration)**
- [ ] Set up Samsung Knox SDK
- [ ] Implement hardware-backed key generation
- [ ] Create key storage service
- [ ] Integrate SQLCipher with Knox keys
- [ ] Test encryption/decryption performance

**Jacob (Access Control)**
- [ ] Implement PIN/biometric login
- [ ] Add session timeout
- [ ] Create audit logging
- [ ] Track PHI access events

**Jonathan (Security UI)**
- [ ] Build security settings screen
- [ ] Add remote wipe trigger
- [ ] Create device lock mechanism
- [ ] Implement password reset flow

#### Week 14 (Apr 27 - May 3)
**Jose**
- [ ] Enable database encryption at rest
- [ ] Implement TLS for P2P communication
- [ ] Add secure key derivation
- [ ] Write security tests (penetration testing)
- [ ] Document security architecture

**Jacob**
- [ ] Test encrypted data access patterns
- [ ] Verify no PHI in logs
- [ ] Implement data anonymization for analytics
- [ ] Create HIPAA compliance checklist

**Jonathan**
- [ ] Build admin panel for device management
- [ ] Add device provisioning workflow
- [ ] Create security incident response plan
- [ ] Test remote wipe functionality

**Deliverables**:
- ✅ All PHI encrypted with Knox hardware keys
- ✅ SQLCipher database unreadable without key
- ✅ P2P traffic encrypted with TLS
- ✅ Remote wipe functional
- ✅ HIPAA compliance audit passed
- ✅ Security documentation complete

---

### Sprint 7: Testing & Polish (May 4 - May 17, 2026)

**Goals**: Comprehensive testing, bug fixes, UX improvements

#### Week 15 (May 4 - May 10)
**All Team (Testing Focus)**
- [ ] Run full integration test suite
- [ ] Perform user acceptance testing with volunteers
- [ ] Conduct field simulation (6 tablets, mock medical mission)
- [ ] Identify and prioritize bugs

**Jose (Quality Assurance)**
- [ ] Execute sync stress test (extended duration)
- [ ] Test battery life (8+ hour mission)
- [ ] Verify data integrity across all scenarios
- [ ] Create bug report database

**Jacob (UX Refinement)**
- [ ] Gather user feedback on medical forms
- [ ] Optimize form flow (reduce clicks)
- [ ] Improve error messages
- [ ] Add tooltips and help text

**Jonathan (UX Refinement)**
- [ ] Improve dental chart usability
- [ ] Optimize inventory interface
- [ ] Add keyboard shortcuts for common actions
- [ ] Polish animations and transitions

#### Week 16 (May 11 - May 17)
**All Team (Bug Fixes)**
- [ ] Fix all critical bugs
- [ ] Address high-priority issues
- [ ] Refactor code for maintainability
- [ ] Update documentation with changes

**Jose**
- [ ] Perform final security audit
- [ ] Optimize database performance
- [ ] Run load tests (500+ patients)
- [ ] Create deployment checklist

**Jacob**
- [ ] Finalize Spanish translations
- [ ] Test on low-end tablets
- [ ] Optimize memory usage
- [ ] Create user training materials

**Jonathan**
- [ ] Test offline scenarios extensively
- [ ] Verify all features work without internet
- [ ] Create troubleshooting guide
- [ ] Build FAQs document

**Deliverables**:
- ✅ All critical and high-priority bugs fixed
- ✅ User acceptance testing passed
- ✅ 80%+ test coverage achieved
- ✅ App stable and performant on target hardware
- ✅ User documentation complete

---

### Sprint 8: Deployment & Handoff (May 18 - End of Semester)

**Goals**: Create master image, deploy to tablets, finalize documentation

#### Week 17 (May 18 - May 24)
**Jose (Deployment Lead)**
- [ ] Create master tablet image
- [ ] Install app on all 6 tablets
- [ ] Configure Knox security policies
- [ ] Test inter-tablet connectivity
- [ ] Create deployment playbook

**Jacob (Documentation)**
- [ ] Write technical documentation
- [ ] Create API reference guide
- [ ] Document database schema
- [ ] Write developer handoff guide

**Jonathan (Documentation)**
- [ ] Create user manual (Spanish/English)
- [ ] Build training video tutorials
- [ ] Write troubleshooting guide
- [ ] Create quick reference cards

#### Final Week (May 25 - End of Semester)
**All Team (Final Presentation)**
- [ ] Prepare capstone presentation
- [ ] Create demo video
- [ ] Practice presentation
- [ ] Gather stakeholder testimonials

**Jose**
- [ ] Finalize GitHub repository
- [ ] Create release notes
- [ ] Archive project artifacts
- [ ] Hand off to La Tortuga Foundation

**Jacob & Jonathan**
- [ ] Support final testing with medical staff
- [ ] Address any last-minute issues
- [ ] Provide training to volunteers
- [ ] Celebrate project completion! 🎉

**Final Deliverables**:
- ✅ 6 tablets provisioned and ready for field deployment
- ✅ Master image backed up and documented
- ✅ Complete technical documentation
- ✅ User manuals in Spanish and English
- ✅ Training materials and videos
- ✅ Capstone presentation delivered
- ✅ GitHub repository finalized and archived

---

## Risk Management

### High-Risk Items
| Risk | Mitigation | Owner |
|------|-----------|--------|
| Local network reliability | Test with portable router, ensure offline mode | Jose |
| Knox SDK compatibility issues | Early prototype, test on target hardware | Jose |
| Sync conflicts cause data loss | Comprehensive conflict tests, version vectors | Jonathan |
| Battery drain from P2P | Power profiling, optimize sync frequency | Jose |
| Forms too slow on tablets | Performance testing, lazy loading | Jacob |

### Contingency Plans
- **If Knox unavailable**: Fall back to software-only encryption (SQLCipher)
- **If router setup fails**: Use alternative networking approach (WiFi hotspot)
- **If 6 tablets too ambitious**: Start with 3, add more post-capstone
- **If timeline slips**: Deprioritize nice-to-have features, focus on core

---

## Success Criteria

### Technical Metrics
- [ ] App runs on Android 8.0+ tablets
- [ ] Sync latency < 5 seconds for critical updates
- [ ] Zero data loss in stress tests
- [ ] 80%+ test coverage
- [ ] Battery lasts 8+ hours with continuous use
- [ ] Database handles 1000+ patients without slowdown

### User Metrics
- [ ] Medical staff can complete intake in < 3 minutes
- [ ] 90%+ user satisfaction rating
- [ ] < 1% data entry error rate
- [ ] Volunteers trained in < 30 minutes

### Project Metrics
- [ ] All sprints completed on time
- [ ] Codebase well-documented
- [ ] Deployable to production
- [ ] Handed off to stakeholders successfully

---

## Communication Plan

### Team Meetings
- **Daily Standups**: 15 min, every morning (async Slack update OK)
- **Sprint Planning**: Monday, start of each sprint (2 hours)
- **Sprint Review**: Friday, end of each sprint (1 hour)
- **Sprint Retrospective**: Friday, end of each sprint (30 min)

### Stakeholder Updates
- **Bi-weekly demos**: Show progress to La Tortuga Foundation
- **Monthly status reports**: Written update on milestones
- **Ad-hoc consultation**: As needed for requirements clarification

### Tools
- **GitHub**: Code, issues, pull requests, project board
- **Slack/Discord**: Daily communication
- **Google Drive**: Shared documents, mockups
- **Zoom**: Virtual meetings

---

**Last Updated**: January 26, 2026
**Next Review**: End of Sprint 0 (Feb 8, 2026)
