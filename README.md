# La Tortuga Foundation - Offline-First Medical EMR System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🏥 Project Overview

An offline-first, peer-to-peer synchronized Electronic Medical Records (EMR) system designed for medical missions in rural Chiapas, Mexico, where internet connectivity is unreliable or non-existent. This system enables volunteer medical and dental staff to provide coordinated care in "Internet Deserts" without data silos.

### Problem Statement

Medical missions in rural areas face critical challenges:
- **Data Silos**: Patient information trapped on individual devices
- **Duplicate Treatments**: No shared patient history across providers
- **Connectivity Gap**: Traditional EMRs (Epic, Athena) require persistent internet/cloud access
- **Patient Safety**: Risk of missed medical histories or contradictory treatments

### Solution

A React Native mobile application with:
- ✅ **Offline-First Architecture**: All data stored locally, works without internet
- ✅ **P2P Mesh Synchronization**: WiFi Direct enables device-to-device data sharing
- ✅ **HIPAA-Compliant Encryption**: Samsung Knox hardware-backed database security
- ✅ **Real-time Updates**: Priority queue and inventory alerts across all tablets
- ✅ **Bilingual Interface**: Spanish/English support for patient intake and medical forms

---

## 🎯 Core Features

### 1. P2P Mesh Synchronization
- **Technology**: WiFi Direct gossip protocol
- **Purpose**: When a nurse updates vitals on Tablet A, the dentist on Tablet B instantly receives the update
- **Implementation**: CRDT-inspired conflict resolution for simultaneous edits

### 2. Data Protection & Compliance
- **Encryption**: SQLCipher with Samsung Knox hardware-backed keys
- **Security**: PHI (Protected Health Information) encrypted at rest
- **Remote Wipe**: Disconnect/wipe capability if device is lost or stolen

### 3. Inventory Management
- **Real-time Tracking**: Monitor medication and supply levels
- **Synchronized Alerts**: Push notifications when supplies fall below threshold or reach zero
- **Multi-tablet Awareness**: All devices see current inventory status

### 4. Priority Queue System
- **Automatic Sorting**: Critical patients displayed at top of queue
- **Dynamic Updates**: Queue reorders as patient status changes
- **Clinical Visibility**: Prevents overlooking urgent cases

### 5. Comprehensive Medical/Dental Forms
- **Medical Intake**: Complete patient history with vitals, systems review, and treatment plans
- **Dental Chart**: Tooth-by-tooth assessment (32 teeth), procedures tracking
- **Bilingual**: Spanish intake forms for patients, English clinical notes for providers

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend
- **Framework**: React Native 0.73+
- **UI Components**: Custom component library optimized for tablet use
- **State Management**: Redux Toolkit with offline-first patterns
- **Forms**: React Hook Form with stylus/touch input support

#### Backend/Data Layer
- **Local Database**: SQLite with SQLCipher encryption
- **Security**: Samsung Knox hardware integration
- **Sync Protocol**: Custom WiFi Direct mesh with gossip protocol
- **Conflict Resolution**: CRDT (Conflict-free Replicated Data Types) patterns

#### Infrastructure
- **Target Platform**: Android tablets (Samsung Knox-compatible)
- **Connectivity**: WiFi Direct for P2P, optional cloud sync when available
- **Backup**: Firebase/AWS cloud backup when internet accessible

### System Requirements
- Android 8.0+ (API level 26+)
- Samsung Knox-compatible device (for hardware encryption)
- WiFi Direct capable
- Minimum 4GB RAM, 32GB storage recommended

---

## 📂 Project Structure

```
la-tortuga-emr/
├── src/
│   ├── components/
│   │   ├── medical/          # Medical intake forms
│   │   ├── dental/           # Dental chart components
│   │   ├── queue/            # Priority queue UI
│   │   ├── inventory/        # Inventory management
│   │   └── common/           # Shared UI components
│   ├── services/
│   │   ├── sync/             # P2P synchronization logic
│   │   ├── encryption/       # Knox & SQLCipher integration
│   │   ├── database/         # SQLite schemas and queries
│   │   └── networking/       # WiFi Direct mesh protocols
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── PatientSelectScreen.js
│   │   ├── MedicalIntakeScreen.js
│   │   ├── DentalChartScreen.js
│   │   ├── QueueScreen.js
│   │   └── InventoryScreen.js
│   ├── navigation/
│   ├── redux/
│   │   ├── slices/
│   │   └── store.js
│   ├── utils/
│   └── constants/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SYNC_PROTOCOL.md
│   ├── SECURITY.md
│   └── USER_GUIDE.md
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── android/
├── ios/
├── .github/
│   └── workflows/
├── package.json
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# React Native CLI
npm install -g react-native-cli

# Android Studio with Android SDK
# Samsung Knox SDK (for encryption features)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/la-tortuga-emr.git
cd la-tortuga-emr
```

2. **Install dependencies**
```bash
npm install
```

3. **Install iOS dependencies** (if building for iOS)
```bash
cd ios && pod install && cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run on Android**
```bash
npm run android
```

6. **Run on iOS**
```bash
npm run ios
```

### Development Workflow

```bash
# Start Metro bundler
npm start

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build:android
npm run build:ios
```

---

## 👥 Team & Roles

### Development Team
- **Jacob Luytjes** - Application Development
  - Priority Queue System
  - Medical Patient Intake Forms
  - React component architecture

- **Jonathan Gomez** - Application Development
  - Medical Form Implementation
  - Dental Chart Interface
  - Inventory Management System
  - Login/Authentication

- **Jose Rodriguez** - Quality Assurance & Infrastructure
  - UI/UX Design
  - P2P Sync Logic & Stress Testing
  - Samsung Knox Deployment
  - SQLite Schema Design
  - Master Image Creation (6-tablet fleet)
  - Git Repository Management

---

## 📅 Project Timeline

**Duration**: January 26, 2026 - May 2026 (End of Semester)

### Phase 1: Foundation (Weeks 1-4)
- [ ] Project setup and repository initialization
- [ ] SQLite schema design
- [ ] Basic React Native UI scaffolding
- [ ] Authentication/Login implementation

### Phase 2: Core Features (Weeks 5-10)
- [ ] Medical intake forms (Spanish/English)
- [ ] Dental chart component
- [ ] Priority queue system
- [ ] Inventory management
- [ ] Local database integration

### Phase 3: P2P Synchronization (Weeks 11-14)
- [ ] WiFi Direct mesh implementation
- [ ] Gossip protocol for data broadcast
- [ ] CRDT conflict resolution
- [ ] Background sync service
- [ ] Sync stress testing

### Phase 4: Security & Compliance (Weeks 15-16)
- [ ] Samsung Knox integration
- [ ] SQLCipher encryption
- [ ] Hardware-backed key storage
- [ ] Remote wipe capability
- [ ] HIPAA compliance audit

### Phase 5: Testing & Deployment (Weeks 17-19)
- [ ] Unit testing (>80% coverage)
- [ ] Integration testing
- [ ] User acceptance testing with medical staff
- [ ] Master image creation for 6 tablets
- [ ] Field deployment preparation

### Phase 6: Documentation & Handoff (Week 20)
- [ ] Technical documentation
- [ ] User guides (English/Spanish)
- [ ] Deployment playbook
- [ ] Final presentation

---

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Jest and React Testing Library
- Service layer testing (sync, encryption, database)
- Utility function coverage

### Integration Tests
- Database operations
- P2P synchronization scenarios
- Form validation workflows

### Stress Tests
- **Sync Stress Test**: 6 tablets simultaneously updating same patient record
- **Network Resilience**: Connection loss/recovery scenarios
- **Battery Impact**: Long-running background sync
- **Data Volume**: 1000+ patient records

### User Acceptance Testing
- Field testing with medical staff
- Usability testing with non-technical volunteers
- Performance validation on target hardware

---

## 📋 Requirements from Field Research

### Medical Intake Requirements
- Patient history organized by body system (neuro, cardiac, respiratory, GI, etc.)
- Checkbox-based inputs to minimize scrolling and text entry
- Stylus support for gloved hands
- Common medications as preset options (Tylenol, ibuprofen, antibiotics)
- Pain assessment section
- Wound care tracking with dressing types
- Vital signs recording
- Free-text notes section for edge cases

### Dental Requirements
- 32-tooth numbering system
- Categories: Painful teeth, Caries (cavities), Fractured teeth
- Procedure tracking: Cleanings (general/deep), Extractions
- Antibiotic prescriptions with dosage (28/21/15 pills)
- Dropdown/checkbox inputs instead of visual charts
- Minimal free-text areas

### General UX Requirements
- Each body system on separate page/tab (avoid endless scrolling)
- Large touch targets for stylus/finger input
- Works with medical gloves
- Spanish language for patient-facing screens
- English for clinical documentation
- Offline-first operation
- Quick patient summary view

---

## 🔐 Security & Compliance

### HIPAA Compliance
- All PHI encrypted at rest (SQLCipher + Knox)
- Encrypted transmission during P2P sync
- Access controls and audit logging
- Secure device wipe capability

### Data Protection
- Hardware-backed encryption keys (Samsung Knox)
- No PHI stored in plain text
- Secure key derivation
- Protection against device theft

### Privacy Considerations
- Minimum necessary data collection
- Patient consent documentation
- De-identification for analytics
- Regular security audits

---

## 🌐 Internationalization

### Supported Languages
- **Spanish**: Patient intake forms, consent forms
- **English**: Clinical notes, provider interface

### Translation Strategy
- React i18next for string management
- Medical terminology reviewed by bilingual clinicians
- Cultural sensitivity in form design

---

## 📊 Success Metrics

### Technical Metrics
- **Sync Latency**: <5 seconds for critical updates
- **Data Loss**: 0% in sync scenarios
- **Uptime**: 99.9% during mission operations
- **Battery Life**: >8 hours of continuous use

### User Metrics
- **Form Completion Time**: <3 minutes per patient
- **User Satisfaction**: >90% approval from medical staff
- **Error Rate**: <1% data entry errors
- **Training Time**: <30 minutes for new users

### Impact Metrics
- **Patients Served**: Target 500+ per mission
- **Duplicate Treatments**: Reduced by 100%
- **Data Accessibility**: Real-time across all providers
- **Historical Records**: 100% retention and availability

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- ESLint configuration must pass
- 80%+ test coverage for new code
- Follow React Native best practices
- Document complex logic

---

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Sync Protocol Specification](docs/SYNC_PROTOCOL.md)
- [Security Implementation](docs/SECURITY.md)
- [User Guide](docs/USER_GUIDE.md)

---

## 🐛 Known Issues & Limitations

- WiFi Direct bandwidth limited to ~25 Mbps
- Samsung Knox requires specific device models
- Background sync may be interrupted by aggressive battery optimization
- Initial sync of large datasets (500+ patients) may take 2-3 minutes

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- La Tortuga Foundation medical and dental volunteers
- Rural communities in Chiapas, Mexico
- Our capstone advisors and peer reviewers
- React Native and open-source community

---

## 📞 Contact & Support

**Project Team**
- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/la-tortuga-emr/issues)


**La Tortuga Foundation**
- Website: https://latortugafoundation.org/

---

## 🗺️ Roadmap

### Future Enhancements
- [ ] iOS support (currently Android-only)
- [ ] Cloud dashboard for mission analytics
- [ ] Photo attachment capability (lesions, wounds)
- [ ] Voice-to-text for clinical notes
- [ ] Integration with local health ministry systems
- [ ] Expanded language support (indigenous languages)
- [ ] Telemedicine consultation features

---

**Built with ❤️ for healthcare in underserved communities**
