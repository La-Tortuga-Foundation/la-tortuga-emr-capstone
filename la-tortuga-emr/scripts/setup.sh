#!/bin/bash

# La Tortuga EMR - Project Setup Script
# This script sets up the development environment for the project

set -e  # Exit on error

echo "🏥 La Tortuga EMR - Project Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher (found: $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v) installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v) installed"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    echo "Please install Git from https://git-scm.com/"
    exit 1
fi
print_success "Git $(git --version | cut -d' ' -f3) installed"

echo ""
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""
echo "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created .env file from template"
    print_info "Please edit .env to configure your environment"
else
    print_info ".env file already exists, skipping"
fi

echo ""
echo "Setting up Git hooks..."
if [ -d .git ]; then
    # Pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook - run linter

echo "Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
fi

echo "✅ Linting passed"
exit 0
EOF
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configured"
else
    print_info "Not a git repository, skipping git hooks"
fi

echo ""
echo "Checking for Android development environment..."
if command -v adb &> /dev/null; then
    print_success "Android Debug Bridge (adb) found"
    
    # Check for connected devices
    DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        print_success "$DEVICES Android device(s) connected"
    else
        print_info "No Android devices connected"
        print_info "Connect a device or start an emulator to test the app"
    fi
else
    print_info "Android tools not found"
    print_info "Install Android Studio to build for Android"
fi

echo ""
echo "=================================="
echo "✨ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start Metro bundler:    npm start"
echo "3. Run on Android:         npm run android"
echo "4. Run on iOS (Mac only):  npm run ios"
echo "5. Run tests:              npm test"
echo ""
echo "Documentation:"
echo "- README.md           - Project overview"
echo "- docs/QUICK_START.md - Getting started guide"
echo "- docs/ARCHITECTURE.md - Technical architecture"
echo "- CONTRIBUTING.md     - Contribution guidelines"
echo ""
echo "Happy coding! 🚀"
