# Desktop App Release Guide

## 🚀 How to Build & Release Desktop Installers

Your desktop app is configured to **automatically build installers** using GitHub Actions when you push a release tag.

---

## Quick Release Process

### 1. Commit Your Changes
```bash
cd Max-Booster
git add .
git commit -m "Release v1.0.0"
```

### 2. Create a Release Tag
```bash
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### 3. Wait for Builds (5-15 minutes)
- GitHub Actions automatically builds Windows, macOS, and Linux installers
- Check progress: Go to your GitHub repo → Actions tab
- You'll see "Build Desktop Installers" workflow running

### 4. Download Installers
Once complete, installers appear in two places:

**Option A: GitHub Release Page** (Recommended)
- Go to your repo → Releases
- Click on the `v1.0.0` release
- Download installers:
  - `Max-Booster-Setup-1.0.0.exe` (Windows)
  - `Max-Booster-1.0.0.dmg` (macOS)
  - `Max-Booster-1.0.0.AppImage` (Linux)

**Option B: Workflow Artifacts**
- Go to Actions → Click the completed workflow
- Scroll to "Artifacts" section
- Download each platform's installer

### 5. Upload to Your Server
```bash
# Upload to releases.maxbooster.com/download/
scp Max-Booster-Setup-1.0.0.exe user@releases.maxbooster.com:/var/www/download/
scp Max-Booster-1.0.0.dmg user@releases.maxbooster.com:/var/www/download/
scp Max-Booster-1.0.0.AppImage user@releases.maxbooster.com:/var/www/download/
```

### 6. Users Can Now Download!
Your `/desktop-app` page already points to the download URLs - users can download and install immediately!

---

## Manual Build Trigger

You can also trigger builds **without creating a tag**:

1. Go to your GitHub repo
2. Click **Actions** tab
3. Click **Build Desktop Installers** workflow
4. Click **Run workflow** button
5. Select branch and click **Run workflow**

Installers will be available as workflow artifacts (30-day retention).

---

## What Gets Built

Each platform builds specific installers:

### Windows (windows-latest runner)
- `Max-Booster-Setup-1.0.0.exe` (~150 MB)
- NSIS installer with wizard
- Auto-creates desktop shortcuts

### macOS (macos-latest runner)
- `Max-Booster-1.0.0.dmg` (~150 MB)
- Universal app (Intel + Apple Silicon)
- Drag-to-Applications installer

### Linux (ubuntu-latest runner)
- `Max-Booster-1.0.0.AppImage` (~150 MB)
- Portable executable (works on all distros)
- No installation required

---

## Build Time

**Total build time: 5-15 minutes**

- Windows: ~5 min
- macOS: ~8 min (slowest)
- Linux: ~4 min

Builds run in **parallel** across 3 runners, so total wall time is ~8-10 minutes.

---

## Cost

**100% FREE** if using:
- Public GitHub repository → Unlimited Actions minutes
- Private GitHub repository → 2,000 free minutes/month (plenty for releases)

Each release uses ~20 minutes total (across 3 parallel runners), so you can do **100+ releases/month** on the free tier.

---

## First-Time Setup

### If You Don't Have a GitHub Repo Yet

1. **Create GitHub repository**:
   ```bash
   cd Max-Booster
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/max-booster.git
   git push -u origin main
   ```

2. **Push the workflow**:
   ```bash
   git add .github/workflows/desktop-build.yml
   git commit -m "Add GitHub Actions for desktop builds"
   git push
   ```

3. **Create your first release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

Done! Installers will build automatically.

---

## Troubleshooting

### Build Fails on macOS
- **Issue**: Code signing required for notarization
- **Solution**: For now, users can right-click → Open to bypass Gatekeeper
- **Future**: Add Apple Developer certificate to GitHub secrets for automatic signing

### Build Fails on Windows
- **Issue**: Antivirus false positives
- **Solution**: Add code signing certificate (optional)

### Build Takes Too Long
- **Issue**: Large node_modules
- **Solution**: Already optimized with npm cache in workflow

---

## Advanced: Code Signing

To distribute without security warnings:

### Windows Code Signing
1. Purchase Windows code signing certificate
2. Add to GitHub Secrets: `WINDOWS_CSC_LINK` and `WINDOWS_CSC_KEY_PASSWORD`
3. Update `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: env.WINDOWS_CSC_LINK
     certificatePassword: env.WINDOWS_CSC_KEY_PASSWORD
   ```

### macOS Code Signing
1. Enroll in Apple Developer Program ($99/year)
2. Create Developer ID certificate
3. Add to GitHub Secrets: `CSC_LINK` and `CSC_KEY_PASSWORD`
4. Add notarization credentials: `APPLE_ID` and `APPLE_APP_SPECIFIC_PASSWORD`

For now, unsigned builds work fine - users just need to right-click → Open on first launch.

---

## Summary

**Current Setup** ✅
- Automated builds via GitHub Actions
- Windows, macOS, Linux installers
- Triggered by git tags or manual dispatch
- Artifacts uploaded to GitHub Releases
- 100% free on public repos

**What You Do** ⚡
```bash
git tag v1.0.0
git push origin v1.0.0
```

**What Happens** 🤖
1. GitHub Actions starts 3 parallel builds
2. 8-10 minutes later: All installers ready
3. Download from Releases page
4. Upload to `releases.maxbooster.com`
5. Users download from `/desktop-app` page

**Zero manual building required!** 🎉
