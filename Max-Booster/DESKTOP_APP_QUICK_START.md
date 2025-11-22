# Desktop App Quick Start Guide

## What's Ready

✅ **Complete Electron Desktop App Infrastructure**

Your Max Booster platform now has a professional desktop app build system that generates native installers for Windows, macOS, and Linux.

## What Was Created

### 1. **Electron Application Files**
- `electron/main.js` - Main process (app window, menu, IPC)
- `electron/preload.js` - Secure bridge between renderer and main process
- `electron/entitlements.mac.plist` - macOS security permissions

### 2. **Build Configuration**
- `electron-builder.yml` - Professional build settings for all platforms
- Updated `package.json` with Electron dependencies and build scripts

### 3. **Asset Directory**
- `electron/assets/` - Placeholder for app icons (see below)
- `electron/assets/README.md` - Icon requirements guide

### 4. **Documentation**
- `DESKTOP_APP_BUILD_GUIDE.md` - Complete build and distribution guide
- This quick start guide

### 5. **Download Page**
- Updated `client/src/pages/DesktopApp.tsx` with actual download URLs
- Points to `https://releases.maxbooster.com/download/`

## Before Building: Create App Icons

**REQUIRED**: You must create branded icons before building:

```bash
electron/assets/
├── icon.icns           # macOS (512x512@2x)
├── icon.ico            # Windows (256x256, multiple sizes)
├── icon.png            # Linux (512x512)
├── dmg-background.png  # macOS installer background (optional)
└── installer-header.bmp # Windows installer header (optional)
```

**Quick Icon Creation**:
1. Create a 512x512px PNG with your Max Booster branding
2. Use online converters:
   - PNG → ICNS: https://cloudconvert.com/png-to-icns
   - PNG → ICO: https://convertio.co/png-ico/
3. Save all icons to `electron/assets/`

## Build Commands

### Install Dependencies
```bash
npm install
```

Installs:
- `electron` - Desktop runtime
- `electron-builder` - Build tool
- `concurrently` - Development mode
- `wait-on` - Server ready detection

### Development Mode
```bash
npm run electron:dev
```

Runs web server + Electron app with hot reload.

### Production Builds

**Build All Platforms**:
```bash
npm run electron:build:all
```

**Build Specific Platform**:
```bash
npm run electron:build:win      # Windows only
npm run electron:build:mac      # macOS only
npm run electron:build:linux    # Linux only
```

### Build Output

All installers go to `dist-electron/`:

**Windows**:
- `Max-Booster-Setup-1.0.0.exe` (NSIS installer)

**macOS**:
- `Max-Booster-1.0.0.dmg` (DMG installer)

**Linux**:
- `Max-Booster-1.0.0.AppImage` (Universal binary)
- `max-booster_1.0.0_amd64.deb` (Debian/Ubuntu)
- `max-booster-1.0.0.x86_64.rpm` (Red Hat/Fedora)

## Distribution Setup

### 1. Create Release Server

Set up a server at `https://releases.maxbooster.com`:

```
releases.maxbooster.com/
└── download/
    ├── Max-Booster-Setup-1.0.0.exe
    ├── Max-Booster-1.0.0.dmg
    ├── Max-Booster-1.0.0.AppImage
    ├── max-booster_1.0.0_amd64.deb
    └── max-booster-1.0.0.x86_64.rpm
```

### 2. Upload Installers

```bash
# After building, upload from dist-electron/
scp dist-electron/* user@releases.maxbooster.com:/var/www/releases/download/
```

### 3. Users Download

Paid users visit `/desktop-app` in your platform and click download buttons for their OS.

## Testing

**Windows**:
```bash
./Max-Booster-Setup-1.0.0.exe
```

**macOS**:
```bash
open Max-Booster-1.0.0.dmg
# Drag to Applications
```

**Linux**:
```bash
chmod +x Max-Booster-1.0.0.AppImage
./Max-Booster-1.0.0.AppImage
```

## Production Checklist

Before releasing to paid users:

- [ ] Create branded app icons in `electron/assets/`
- [ ] Test build on all platforms
- [ ] Set up release server at `releases.maxbooster.com`
- [ ] Build production installers: `npm run electron:build:all`
- [ ] Upload installers to release server
- [ ] Test fresh installs on clean machines
- [ ] Verify download page works for users
- [ ] (Optional) Set up code signing for Windows/macOS

## What Users Get

**Features**:
- ✅ Native performance and hardware acceleration
- ✅ Offline mode for working without internet
- ✅ OS integration (notifications, file associations)
- ✅ Secure credential storage
- ✅ Auto-updates (when configured)

**Platforms**:
- Windows 10/11 (x64, x86)
- macOS 10.13+ (Intel & Apple Silicon)
- Linux (AppImage, DEB, RPM)

## Next Steps

1. **Create Icons**: Add your branded icons to `electron/assets/`
2. **Test Build**: Run `npm run electron:build` to generate installers
3. **Set Up Server**: Configure `releases.maxbooster.com` for downloads
4. **Deploy**: Upload installers and let paid users download!

For detailed instructions, see `DESKTOP_APP_BUILD_GUIDE.md`.

---

**You now have a production-ready desktop app build system!** 🚀

Your paid users can download native installers for Windows, macOS, and Linux once you:
1. Create the app icons
2. Build the installers
3. Upload them to your release server
