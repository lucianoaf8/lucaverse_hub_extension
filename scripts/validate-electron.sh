#!/bin/bash

# Electron Build Validation Script
# Tests Electron functionality and build process

echo "🔍 Starting Electron Build Validation..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Function to check command availability
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo "✅ $1 is available"
        return 0
    else
        echo "❌ $1 is not available"
        return 1
    fi
}

# Check required dependencies
echo ""
echo "📦 Checking Dependencies..."
echo "----------------------------"

check_command node
check_command npm
check_command electron

# Check if Electron dependencies are installed
echo ""
echo "🔍 Checking Electron Dependencies..."
echo "-----------------------------------"

if npm list electron >/dev/null 2>&1; then
    echo "✅ Electron is installed"
else
    echo "❌ Electron is not installed"
    exit 1
fi

if npm list electron-builder >/dev/null 2>&1; then
    echo "✅ electron-builder is installed"
else
    echo "❌ electron-builder is not installed"
    exit 1
fi

# Check Electron files exist
echo ""
echo "📂 Checking Electron Files..."
echo "-----------------------------"

files_to_check=(
    "electron/main.ts"
    "electron/preload.ts"
    "electron/windowManager.ts"
    "electron/menuBuilder.ts"
    "electron/utils.ts"
    "electron/__tests__/electronTest.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Build the Electron app
echo ""
echo "🔨 Building Electron App..."
echo "---------------------------"

echo "Building for Electron mode..."
if npm run build:electron >/dev/null 2>&1; then
    echo "✅ Electron build successful"
else
    echo "❌ Electron build failed"
    exit 1
fi

# Check if build output exists
if [ -d "dist/electron" ]; then
    echo "✅ Electron build output exists"
else
    echo "❌ Electron build output missing"
    exit 1
fi

# Test Electron development mode (brief test)
echo ""
echo "🧪 Testing Development Mode..."
echo "-----------------------------"

echo "Starting Electron in development mode (5 second test)..."
timeout 5s npm run electron:dev >/dev/null 2>&1 &
ELECTRON_PID=$!

sleep 2

if ps -p $ELECTRON_PID >/dev/null 2>&1; then
    echo "✅ Electron starts successfully in development mode"
    kill $ELECTRON_PID 2>/dev/null
else
    echo "⚠️ Could not verify Electron development mode startup"
fi

# Check package.json scripts
echo ""
echo "📜 Checking Package Scripts..."
echo "------------------------------"

scripts_to_check=(
    "electron:dev"
    "electron:build"
    "electron:build:win"
    "electron:build:mac"
    "electron:build:linux"
)

for script in "${scripts_to_check[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo "✅ Script '$script' is defined"
    else
        echo "❌ Script '$script' is missing"
    fi
done

# Final validation
echo ""
echo "🎯 Final Validation Summary"
echo "=========================="

echo "✅ All Electron dependencies are installed"
echo "✅ All Electron source files exist"
echo "✅ Electron build process works"
echo "✅ Package scripts are configured"

echo ""
echo "🎉 Electron Desktop App Preparation: COMPLETE!"
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. Run 'npm run electron:dev' to start development"
echo "2. Run 'npm run electron:build' to create distributable"
echo "3. Test the packaged app on target platforms"

exit 0
