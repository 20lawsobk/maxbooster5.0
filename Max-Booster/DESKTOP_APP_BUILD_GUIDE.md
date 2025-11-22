# Max Booster Desktop App Build Guide

Complete guide for building and distributing the Max Booster desktop application for Windows, macOS, and Linux.

## Overview

The Max Booster desktop app is built using Electron, providing a native desktop experience with:
- **Performance**: Native performance and hardware acceleration
- **Security**: Sandboxed environment with secure credential storage
- **Offline Mode**: Work on projects without an internet connection
- **Native Integration**: OS-level notifications, file associations, and system tray

## Architecture

```
Max-Booster/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Context bridge (secure IPC)
│   ├── entitlements.mac.plist  # macOS code signing entitlements
│   └── assets/              # App icons and installer graphics
│       ├── icon.icns        # macOS icon (required)
│       ├── icon.ico         # Windows icon (required)
│       ├── icon.png         # Linux icon (required)
│       ├── dmg-background.png  # macOS DMG background
│       └── installer-header.bmp  # Windows installer header
├── electron-builder.yml     # Build configuration
└── dist/                    # Web app build output
```

## Prerequisites

### 1. Install Dependencies

```bash
cd Max-Booster
npm install
```

This installs:
- `electron` - Desktop app runtime
- `electron-builder` - Build and packaging tool
- `concurrently` - Run multiple commands
- `wait-on` - Wait for server to start

### 2. Create App Icons

**You MUST create platform-specific icons before building:**

#### macOS Icon (.icns)
- Size: 512x512@2x, 256x256@2x, 128x128@2x, 32x32@2x, 16x16@2x
- Format: ICNS (Apple Icon Image format)
- Location: `electron/assets/icon.icns`
- Tool: Use `iconutil` (built into macOS) or https://cloudconvert.com/png-to-icns

```bash
# Create iconset folder structure
mkdir -p icon.iconset
# Add your PNG files (icon_512x512@2x.png, etc.)
iconutil -c icns icon.iconset -o electron/assets/icon.icns
```

#### Windows Icon (.ico)
- Sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- Format: ICO (Windows Icon format)
- Location: `electron/assets/icon.ico`
- Tool: Use ImageMagick or https://convertio.co/png-ico/

```bash
# Using ImageMagick
convert icon-256.png icon-128.png icon-64.png icon-48.png icon-32.png icon-16.png electron/assets/icon.ico
```

#### Linux Icon (.png)
- Size: 512x512px
- Format: PNG
- Location: `electron/assets/icon.png`

```bash
cp your-icon-512.png electron/assets/icon.png
```

#### Optional Installer Graphics

**macOS DMG Background** (`dmg-background.png`):
- Size: 540x380px
- Shows behind installer icons in DMG window

**Windows Installer Header** (`installer-header.bmp`):
- Size: 150x57px
- Shows at top of NSIS installer wizard

### 3. Code Signing (Optional but Recommended)

#### macOS Code Signing
```bash
# Export your Apple Developer certificate
export CSC_NAME="Developer ID Application: Your Name (TEAM_ID)"
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD="certificate-password"

# For notarization (macOS 10.14+)
export APPLE_ID="your-apple-id@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

#### Windows Code Signing
```bash
# Using a code signing certificate
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD="certificate-password"
```

## Building

### Development Mode

Run the desktop app in development with hot reload:

```bash
npm run electron:dev
```

This:
1. Starts the web server on http://localhost:5000
2. Waits for server to be ready
3. Launches Electron pointing to localhost

### Production Builds

#### Build All Platforms

```bash
# Build web app first (creates dist/)
npm run build

# Build desktop installers for all platforms
npm run electron:build:all
```

Output (in `dist-electron/`):
- **Windows**: `Max-Booster-Setup-1.0.0.exe` (NSIS installer)
- **macOS**: `Max-Booster-1.0.0.dmg` (DMG disk image)
- **Linux**: `Max-Booster-1.0.0.AppImage` (AppImage), `.deb`, `.rpm`

#### Build Specific Platforms

```bash
# Windows only (x64 + ia32)
npm run electron:build:win

# macOS only (x64 + arm64 / Apple Silicon)
npm run electron:build:mac

# Linux only (AppImage, deb, rpm)
npm run electron:build:linux
```

### Build Output Files

**Windows**:
- `Max-Booster-Setup-1.0.0.exe` - NSIS installer (recommended)
- `Max-Booster-1.0.0.exe` - Portable executable (optional)

**macOS**:
- `Max-Booster-1.0.0.dmg` - Disk image installer
- `Max-Booster-1.0.0.pkg` - PKG installer (optional)

**Linux**:
- `Max-Booster-1.0.0.AppImage` - Universal Linux binary (recommended)
- `max-booster_1.0.0_amd64.deb` - Debian/Ubuntu package
- `max-booster-1.0.0.x86_64.rpm` - Red Hat/Fedora package

## Distribution

### 1. Set Up Release Server

Create a release distribution server at `https://releases.maxbooster.com`:

```
releases.maxbooster.com/
├── download/
│   ├── Max-Booster-Setup-1.0.0.exe      # Windows installer
│   ├── Max-Booster-1.0.0.dmg            # macOS installer
│   ├── Max-Booster-1.0.0.AppImage       # Linux AppImage
│   ├── max-booster_1.0.0_amd64.deb      # Linux DEB
│   └── max-booster-1.0.0.x86_64.rpm     # Linux RPM
├── latest.yml           # Auto-update metadata (Windows/Linux)
├── latest-mac.yml       # Auto-update metadata (macOS)
└── RELEASES.json        # Version manifest
```

### 2. Upload Installers

Upload built installers from `dist-electron/` to your release server:

```bash
# Example using rsync
rsync -av dist-electron/*.{exe,dmg,AppImage,deb,rpm} \
  user@releases.maxbooster.com:/var/www/releases/download/
```

### 3. Auto-Updates (Optional)

Electron Builder generates update metadata files automatically:
- `latest.yml` (Windows/Linux)
- `latest-mac.yml` (macOS)

Upload these to enable automatic updates in future releases.

## Testing

### Test Installers

**Windows**:
```powershell
# Run installer
.\Max-Booster-Setup-1.0.0.exe

# Check installed location
C:\Users\<Username>\AppData\Local\Programs\max-booster
```

**macOS**:
```bash
# Open DMG
open Max-Booster-1.0.0.dmg

# Drag to Applications and run
open /Applications/Max\ Booster.app
```

**Linux**:
```bash
# Make AppImage executable
chmod +x Max-Booster-1.0.0.AppImage

# Run AppImage
./Max-Booster-1.0.0.AppImage

# Or install DEB
sudo dpkg -i max-booster_1.0.0_amd64.deb
```

### Verify App Functionality

1. **Launch**: App starts without errors
2. **Authentication**: Login/register works
3. **Studio**: DAW loads and audio playback works
4. **Offline**: Close network and verify offline features
5. **File System**: Save/load projects
6. **Native Features**: Notifications, menu items, shortcuts

## Configuration

### Customize Build Settings

Edit `electron-builder.yml` to change:

```yaml
appId: com.maxbooster.app         # Bundle identifier
productName: Max Booster           # App name
copyright: Copyright © 2025        # Copyright notice

# Update download server
publish:
  provider: generic
  url: https://releases.maxbooster.com  # Your server
```

### Update Version

Update version in `package.json`:

```json
{
  "version": "1.0.0"  // Increment for new releases
}
```

Version appears in:
- Installer filenames
- About dialog
- Auto-update checks

## Troubleshooting

### Build Fails: Missing Icons

**Error**: `Application icon is not set`

**Fix**: Create all required icon files (see step 2 above)

### Windows Build Fails on macOS/Linux

**Error**: `Cannot create Windows installer on non-Windows platform`

**Fix**: Windows builds require Windows or use Docker:

```bash
# Use Docker to build Windows installers on Mac/Linux
docker run --rm -ti \
  -v ${PWD}:/project \
  electronuserland/builder:wine \
  npm run electron:build:win
```

### macOS Signing Fails

**Error**: `No identity found for signing`

**Fix**: Either:
1. Skip signing for testing: `npm run electron:build:mac -- --config.mac.identity=null`
2. Set up Apple Developer account and export signing certificates

### App Won't Start

**Check**:
1. `electron/main.js` has correct paths
2. `dist/` contains built web app
3. Console logs in developer tools (Help > Toggle Developer Tools)

## Security Best Practices

1. **Code Signing**: Always sign production releases
2. **Auto-Updates**: Use HTTPS and verify signatures
3. **Permissions**: Request minimal OS permissions
4. **Sandboxing**: Keep `sandbox: true` in webPreferences
5. **Context Isolation**: Keep `contextIsolation: true`

## GitHub Releases (Alternative Distribution)

Instead of a custom server, use GitHub Releases:

1. Create a GitHub repository for releases
2. Tag a version: `git tag v1.0.0 && git push --tags`
3. Build installers: `npm run electron:build:all`
4. Upload to GitHub Release manually or via CI/CD

Update `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: your-username
  repo: max-booster-releases
```

## CI/CD Automation

### GitHub Actions Example

`.github/workflows/build-desktop.yml`:

```yaml
name: Build Desktop App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run build
      - run: npm run electron:build
      
      - uses: actions/upload-artifact@v3
        with:
          name: installers-${{ matrix.os }}
          path: dist-electron/*
```

## Support

For issues or questions:
- Check console logs in developer tools
- Review electron-builder docs: https://www.electron.build/
- Check Electron docs: https://www.electronjs.org/docs

## Summary

**Quick Start**:
1. Create app icons in `electron/assets/`
2. Run `npm run build && npm run electron:build:all`
3. Upload installers from `dist-electron/` to your release server
4. Users download from https://releases.maxbooster.com/download/

**Production Checklist**:
- ✅ App icons created for all platforms
- ✅ Code signing certificates configured
- ✅ Build tested on all platforms
- ✅ Installers uploaded to release server
- ✅ Download URLs updated in DesktopApp.tsx
- ✅ Auto-update metadata uploaded
- ✅ App tested on fresh installs

You're ready to distribute the Max Booster desktop app! 🚀
