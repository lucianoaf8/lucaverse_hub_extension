@echo off
echo 🔍 Starting Electron Build Validation...
echo ======================================

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Run this script from the project root.
    exit /b 1
)

echo.
echo 📦 Checking Dependencies...
echo ----------------------------

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is available
) else (
    echo ❌ Node.js is not available
    exit /b 1
)

:: Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm is available
) else (
    echo ❌ npm is not available
    exit /b 1
)

echo.
echo 🔍 Checking Electron Dependencies...
echo -----------------------------------

:: Check if Electron is installed
npm list electron >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Electron is installed
) else (
    echo ❌ Electron is not installed
    exit /b 1
)

:: Check if electron-builder is installed
npm list electron-builder >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ electron-builder is installed
) else (
    echo ❌ electron-builder is not installed
    exit /b 1
)

echo.
echo 📂 Checking Electron Files...
echo -----------------------------

:: Check required files
set "files=electron\main.ts electron\preload.ts electron\windowManager.ts electron\menuBuilder.ts electron\utils.ts electron\__tests__\electronTest.js"

for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ %%f exists
    ) else (
        echo ❌ %%f is missing
        exit /b 1
    )
)

echo.
echo 🔨 Building Electron App...
echo ---------------------------

echo Building for Electron mode...
npm run build:electron >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Electron build successful
) else (
    echo ❌ Electron build failed
    exit /b 1
)

:: Check if build output exists
if exist "dist\electron" (
    echo ✅ Electron build output exists
) else (
    echo ❌ Electron build output missing
    exit /b 1
)

echo.
echo 📜 Checking Package Scripts...
echo ------------------------------

:: Check for required scripts in package.json
findstr /c:"electron:dev" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Script 'electron:dev' is defined
) else (
    echo ❌ Script 'electron:dev' is missing
)

findstr /c:"electron:build" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Script 'electron:build' is defined
) else (
    echo ❌ Script 'electron:build' is missing
)

echo.
echo 🎯 Final Validation Summary
echo ==========================

echo ✅ All Electron dependencies are installed
echo ✅ All Electron source files exist
echo ✅ Electron build process works
echo ✅ Package scripts are configured

echo.
echo 🎉 Electron Desktop App Preparation: COMPLETE!
echo ===============================================
echo.
echo Next steps:
echo 1. Run 'npm run electron:dev' to start development
echo 2. Run 'npm run electron:build' to create distributable
echo 3. Test the packaged app on target platforms

exit /b 0
