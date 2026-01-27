# Quick Start Guide

Get the La Tortuga EMR project up and running on your development machine in under 30 minutes.

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 8.0.0 or higher
   ```
   Download: https://nodejs.org/

2. **Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK (API level 26+)
   - Set up Android emulator or connect physical device

3. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

4. **Git**
   ```bash
   git --version
   ```

### Optional but Recommended

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - React Native Tools
  - GitLens

- **Physical Android Tablet** (for WiFi Direct testing)
  - Samsung Galaxy Tab preferred (Knox support)
  - Android 8.0+ required

## Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone.git


# Checkout develop branch (main working branch)
git checkout develop
```

## Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# If on Mac and building for iOS
cd ios && pod install && cd ..
```

This will take 5-10 minutes depending on your internet speed.

## Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# For local development, defaults should work
```

Example `.env` file:
```bash
# Development environment
NODE_ENV=development

# Database
DB_NAME=latortuga_dev.db

# Knox (leave empty for development)
KNOX_LICENSE_KEY=

# Firebase (for cloud sync - optional for local dev)
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=

# Sync settings
SYNC_INTERVAL=30000  # 30 seconds
MAX_SYNC_RETRIES=3
```

## Step 4: Start Metro Bundler

Open a new terminal and start the Metro bundler:

```bash
npm start
```

Keep this terminal running. You should see:
```
Welcome to Metro!
Fast - Scalable - Integrated

To reload the app press "r"
To open developer menu press "d"
```

## Step 5: Run on Android

In a **new terminal** (keep Metro running):

```bash
# Run on Android emulator or connected device
npm run android
```

First build takes 5-10 minutes. Subsequent builds are much faster.

### Troubleshooting Android Build

**Issue**: Build fails with "SDK location not found"
```bash
# Solution: Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# Windows: Set in System Environment Variables
```

**Issue**: "Unable to load script from assets"
```bash
# Solution: Reset Metro bundler
npm start -- --reset-cache
```

**Issue**: App crashes on startup
```bash
# Solution: Clear app data and rebuild
adb shell pm clear com.latortugaemr
npm run android
```

## Step 6: Run on iOS (Mac only)

```bash
npm run ios
```

## Step 7: Verify Installation

Once the app launches, you should see:

1. **Login Screen** with username/password fields
2. Ability to navigate between tabs
3. No crash errors in terminal

### Test Basic Functionality

1. **Login**: Use test credentials
   - Username: `testuser`
   - Password: `password123`

2. **Create a Patient**:
   - Tap "Add Patient"
   - Fill in name, DOB
   - Save

3. **View Queue**:
   - Go to Queue tab
   - Should see empty queue or test data

4. **Check Inventory**:
   - Go to Inventory tab
   - Should see sample items

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code with Prettier
npm run format
```

### Debugging

#### React Native Debugger

1. In the running app, press `Cmd+D` (iOS) or `Cmd+M` (Android)
2. Select "Debug"
3. Opens Chrome DevTools or standalone debugger

#### Logging

```javascript
// Use console.log for development debugging
console.log('Patient data:', patient);

// Use logger service for production
import { logger } from './services/logger';
logger.debug('Patient loaded', { patientId });
logger.error('Failed to save', { error });
```

### Hot Reloading

- **Fast Refresh**: Edits automatically update in app
- If UI doesn't update, press `r` in Metro terminal to reload

## Common Development Tasks

### Add a New Screen

```bash
# Create component file
touch src/screens/NewScreen.js

# Add to navigation
# Edit src/navigation/AppNavigator.js
```

### Add a New Database Table

```bash
# Create migration file
touch src/database/migrations/003_add_new_table.sql

# Update schema documentation
# Edit docs/DATABASE_SCHEMA.md
```

### Add a New Redux Slice

```bash
# Create slice file
touch src/redux/slices/newFeatureSlice.js

# Add to store
# Edit src/redux/store.js
```

## Git Workflow

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "feat(component): add new feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Format

Follow Conventional Commits:
```
feat(scope): add new feature
fix(scope): fix bug
docs: update documentation
test: add tests
refactor: refactor code
```

Examples:
```bash
git commit -m "feat(medical): add pain assessment component"
git commit -m "fix(sync): resolve CRDT conflict in vitals"
git commit -m "docs: update README with setup instructions"
```

## Team Collaboration

### Daily Standup (Async)

Post in team Slack/Discord:
```
**Yesterday**: Implemented patient search functionality
**Today**: Working on queue auto-sorting
**Blockers**: None / Need help with WiFi Direct API
```

### Pull Request Review

When reviewing PRs:
1. Pull the branch locally
2. Test functionality
3. Review code quality
4. Check tests pass
5. Approve or request changes

### Asking for Help

1. Search existing GitHub issues
2. Check documentation (docs/)
3. Ask in team chat
4. Create GitHub issue with `question` label

## Troubleshooting

### App Won't Start

```bash
# Clean build
npm run clean
npm install
npm run android
```

### Database Issues

```bash
# Reset database (CAUTION: deletes all data)
adb shell
run-as com.latortugaemr
rm databases/latortuga.db
exit
```

### Sync Not Working

1. Check WiFi Direct permissions in Android settings
2. Verify both tablets on same network
3. Check sync_log table for pending changes
4. Review device logs: `adb logcat | grep Sync`

### Performance Issues

```bash
# Profile performance
npm run android -- --variant=release

# Analyze bundle size
npx react-native-bundle-visualizer
```

## Next Steps

Now that your dev environment is set up:

1. **Read the docs**:
   - [Architecture Overview](docs/ARCHITECTURE.md)
   - [Database Schema](docs/DATABASE_SCHEMA.md)
   - [Project Timeline](docs/PROJECT_TIMELINE.md)

2. **Pick a task** from the GitHub project board

3. **Create a branch** and start coding!

4. **Ask questions** - team is here to help

5. **Have fun** building healthcare tech! 🏥

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)
- [SQLite Guide](https://www.sqlite.org/docs.html)

### Team Resources
- GitHub: https://github.com/yourusername/la-tortuga-emr
- Project Board: https://github.com/yourusername/la-tortuga-emr/projects
- Wiki: https://github.com/yourusername/la-tortuga-emr/wiki

### Getting Help
- Create GitHub issue
- Team Slack/Discord
- Office hours (schedule TBD)

---

**Welcome to the team! Let's build something amazing together.** 🚀
