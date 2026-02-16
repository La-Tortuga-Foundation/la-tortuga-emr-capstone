# Contributing to La Tortuga EMR

Thank you for your interest in contributing to the La Tortuga Foundation EMR system! This document provides guidelines for contributing to the project.

## 🎯 Project Goals

This is a capstone project with real-world impact. Our code will be deployed in medical missions serving underserved communities in rural Mexico. Quality, reliability, and security are paramount.

## 👥 Team Structure

### Core Development Team
- **Jacob Luytjes**: Priority Queue & Medical Intake Forms
- **Jonathan Gomez**: Medical Forms, Dental Chart, Inventory & Login
- **Jose Rodriguez**: QA, Design, P2P Sync, Knox Security, Infrastructure

### Contribution Areas
- Application Development (Jacob, Jonathan)
- Quality Assurance & Testing (Jose)
- Infrastructure & DevOps (Jose)
- Documentation (All)

## 🔄 Development Workflow

### Branch Strategy

We use a feature branch workflow:

```
main (production-ready)
  ├── develop (integration branch)
  │   ├── feature/medical-intake-form
  │   ├── feature/dental-chart
  │   ├── feature/p2p-sync
  │   ├── feature/priority-queue
  │   └── feature/inventory-management
  └── hotfix/critical-bug-fix
```

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `docs/description` - Documentation updates
- `test/description` - Test additions/improvements
- `refactor/description` - Code refactoring

**Examples:**
- `feature/patient-intake-spanish`
- `bugfix/sync-conflict-resolution`
- `test/p2p-stress-test`

## 📝 Commit Message Guidelines

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(medical): add patient history form with Spanish translation

- Implemented checkbox-based system review
- Added common medications preset list
- Integrated stylus input support
- Added pain assessment section

Closes #15
```

```bash
fix(sync): resolve CRDT conflict in simultaneous patient updates

- Fixed race condition in gossip protocol
- Added timestamp-based conflict resolution
- Improved merge logic for vital signs

Fixes #42
```

## 🚀 Getting Started

### 1. Set Up Your Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/la-tortuga-emr.git
cd la-tortuga-emr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm start
```

### 2. Create a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, documented code
- Follow the style guide (ESLint configuration)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Run on Android emulator
npm run android

# Run on physical device (recommended for network sync testing)
npm run android -- --deviceId=<device-id>
```

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat(dental): implement 32-tooth chart component"

# Push to your branch
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select `develop` as base branch
4. Select your feature branch
5. Fill out PR template
6. Request review from team members
7. Address any feedback

## ✅ Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines (ESLint passes)
- [ ] All tests pass (`npm test`)
- [ ] New code has test coverage (minimum 80%)
- [ ] Documentation is updated (README, code comments, JSDoc)
- [ ] No console.log or debug statements
- [ ] Sensitive data is not committed (.env, API keys)
- [ ] PR description clearly explains changes
- [ ] Related issue is referenced (Closes #XX)
- [ ] Screenshots included for UI changes
- [ ] Tested on target hardware (Android tablet)

## 🎨 Code Style Guidelines

### JavaScript/React Native

```javascript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

const PatientIntakeForm = ({ patientId, onSubmit }) => {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    // Load existing patient data
    loadPatientData(patientId);
  }, [patientId]);
  
  const handleSubmit = async () => {
    // Validate and submit
    await onSubmit(formData);
  };
  
  return (
    // JSX
  );
};

export default PatientIntakeForm;
```

### File Organization

```javascript
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';

// 2. Constants
const MAX_RETRY_ATTEMPTS = 3;

// 3. Helper functions
const formatDate = (date) => {
  // ...
};

// 4. Component
const MyComponent = () => {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
};

// 5. Styles
const styles = StyleSheet.create({
  // ...
});

// 6. Export
export default MyComponent;
```

### Naming Conventions

- **Components**: PascalCase (`PatientIntakeForm`)
- **Files**: PascalCase for components (`PatientIntakeForm.js`)
- **Functions**: camelCase (`handleSubmit`, `fetchPatientData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PATIENTS`, `API_ENDPOINT`)
- **CSS/Styles**: camelCase (`containerStyle`, `headerText`)

### Documentation

Use JSDoc for functions and complex logic:

```javascript
/**
 * Synchronizes patient data across all connected tablets using WiFi Direct
 * 
 * @param {string} patientId - Unique patient identifier
 * @param {Object} updates - Patient data changes to broadcast
 * @param {number} [retryAttempts=3] - Number of retry attempts for failed syncs
 * @returns {Promise<SyncResult>} Result of sync operation
 * @throws {SyncError} If sync fails after all retry attempts
 */
const syncPatientData = async (patientId, updates, retryAttempts = 3) => {
  // Implementation
};
```

## 🧪 Testing Guidelines

### Unit Tests

Test individual components and functions:

```javascript
// PatientIntakeForm.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PatientIntakeForm from './PatientIntakeForm';

describe('PatientIntakeForm', () => {
  it('renders all required fields', () => {
    const { getByText } = render(<PatientIntakeForm />);
    expect(getByText('Patient Name')).toBeTruthy();
    expect(getByText('Date of Birth')).toBeTruthy();
  });
  
  it('validates required fields before submission', async () => {
    const onSubmit = jest.fn();
    const { getByText } = render(<PatientIntakeForm onSubmit={onSubmit} />);
    
    fireEvent.press(getByText('Submit'));
    
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

Test feature workflows:

```javascript
// sync.integration.test.js
describe('P2P Synchronization', () => {
  it('syncs patient updates across devices', async () => {
    // Simulate two tablets
    const tablet1 = createMockDevice();
    const tablet2 = createMockDevice();
    
    // Update patient on tablet 1
    await tablet1.updatePatient(patientId, { vitals: { bp: '120/80' } });
    
    // Wait for sync
    await waitForSync();
    
    // Verify tablet 2 received update
    const patient = await tablet2.getPatient(patientId);
    expect(patient.vitals.bp).toBe('120/80');
  });
});
```

### Stress Tests

Located in `tests/stress/`:

```javascript
// sync-stress.test.js
describe('Sync Stress Test', () => {
  it('handles 6 simultaneous device updates without data loss', async () => {
    const devices = createMockDevices(6);
    const patientId = 'patient-123';
    
    // All devices update same patient simultaneously
    await Promise.all(
      devices.map((device, i) => 
        device.updatePatient(patientId, { note: `Update ${i}` })
      )
    );
    
    // Verify no data loss, proper conflict resolution
    const finalStates = await Promise.all(
      devices.map(d => d.getPatient(patientId))
    );
    
    // All devices should have consistent state
    expect(new Set(finalStates).size).toBe(1);
  });
});
```

## 🔒 Security Guidelines

### Never Commit Sensitive Data

```bash
# Add to .gitignore
.env
.env.local
*.keystore
*.p12
secrets/
knox-config.json
```

### Handle PHI Properly

```javascript
// ❌ Bad - PHI in logs
console.log('Patient data:', patientData);

// ✅ Good - No PHI in logs
console.log('Patient data loaded successfully');
logger.debug('Record count:', patientData.length);
```

### Encryption Best Practices

```javascript
// Always encrypt before storing PHI
const encryptedData = await encryptWithKnox(patientData);
await database.save(encryptedData);

// Always decrypt after retrieving
const encryptedData = await database.load(patientId);
const patientData = await decryptWithKnox(encryptedData);
```

## 📋 Issue Tracking

### Creating Issues

Use issue templates for:
- 🐛 Bug reports
- ✨ Feature requests
- 📚 Documentation improvements
- ❓ Questions

### Issue Labels

- `priority:critical` - Blocking issues, data loss risk
- `priority:high` - Important for next release
- `priority:medium` - Should be addressed soon
- `priority:low` - Nice to have
- `type:bug` - Something isn't working
- `type:feature` - New functionality
- `type:docs` - Documentation updates
- `component:medical` - Medical intake features
- `component:dental` - Dental chart features
- `component:sync` - P2P synchronization
- `component:security` - Knox/encryption
- `component:ui` - User interface

## 👀 Code Review Process

### For Reviewers

- Review within 24 hours
- Test the changes locally if possible
- Check for:
  - Code quality and readability
  - Test coverage
  - Security implications (PHI handling)
  - Performance impact
  - Documentation completeness

### Review Checklist

- [ ] Code is clean and well-documented
- [ ] Tests are comprehensive and passing
- [ ] No security vulnerabilities introduced
- [ ] Performance is acceptable
- [ ] UI/UX is intuitive
- [ ] Works on target hardware (Android tablets)
- [ ] Handles edge cases and errors gracefully

### Providing Feedback

Be constructive and specific:

```markdown
❌ "This code is bad"

✅ "Consider extracting this logic into a separate function for reusability. 
   Also, we should add error handling for the network request on line 45."
```

## 🚨 Emergency Procedures

### Critical Bugs in Production

1. Create hotfix branch from `main`
2. Fix the issue
3. Test thoroughly
4. Create PR to `main` AND `develop`
5. Get expedited review
6. Deploy immediately

### Data Loss Incidents

1. Stop all sync operations
2. Notify team immediately
3. Preserve device state (don't wipe)
4. Create incident report issue
5. Begin recovery procedures

## 📅 Sprint Planning

### Sprint Duration
2 weeks per sprint

### Sprint Ceremonies

**Sprint Planning** (Monday, Week 1)
- Review backlog
- Assign stories to team members
- Estimate effort (story points)

**Daily Standups** (Daily, 15 min)
- What did you do yesterday?
- What will you do today?
- Any blockers?

**Sprint Review** (Friday, Week 2)
- Demo completed features
- Gather feedback

**Sprint Retrospective** (Friday, Week 2)
- What went well?
- What can improve?
- Action items

## 🎓 Learning Resources

### React Native
- [Official React Native Docs](https://reactnative.dev/)
- [React Native Express](http://www.reactnativeexpress.com/)

### P2P Networking
- [WiFi Direct API Guide](https://developer.android.com/guide/topics/connectivity/wifip2p)
- [CRDT Research Papers](https://crdt.tech/)

### Security
- [Samsung Knox Documentation](https://docs.samsungknox.com/)
- [SQLCipher for Android](https://www.zetetic.net/sqlcipher/sqlcipher-for-android/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)

## 🙋 Getting Help

### Stuck on Something?

1. Check documentation (README, docs/)
2. Search existing GitHub issues
3. Ask in team chat/Discord
4. Create a GitHub issue with `question` label
5. Schedule pair programming session

### Pair Programming

Available upon request:
- Schedule via team calendar
- Use VS Code Live Share
- Focus on complex features (P2P sync, encryption)

## 📧 Communication

### Channels
- **GitHub Issues**: Technical discussions, bug reports
- **Pull Requests**: Code review, feature discussions
- **Team Chat**: Quick questions, daily updates
- **Email**: Non-technical, administrative

### Response Times
- Critical issues: Within 4 hours
- Pull request reviews: Within 24 hours
- General questions: Within 48 hours

## 🎉 Recognition

Contributors will be acknowledged in:
- README.md Contributors section
- Project documentation
- Capstone presentation
- La Tortuga Foundation website (with permission)

---

## Questions?

Contact the team:
- Jacob Luytjes (Medical Forms, Priority Queue)
- Jonathan Gomez (Dental Chart, Inventory, Login)
- Jose Rodriguez (QA, Infrastructure, Sync)

Thank you for contributing to healthcare in underserved communities! 🙏
