# GitHub Actions Workflows

This directory contains automated CI/CD workflows for Max Booster.

## Available Workflows

### `desktop-build.yml` - Desktop Installer Builder

**Purpose**: Automatically builds Windows, macOS, and Linux desktop installers

**Triggers**:
- Push a git tag starting with `v` (e.g., `v1.0.0`)
- Manual trigger via GitHub Actions UI

**What It Does**:
1. Builds installers on 3 parallel runners (Windows, macOS, Linux)
2. Uploads artifacts to workflow (30-day retention)
3. Publishes installers to GitHub Releases (if triggered by tag)

**Build Time**: 8-10 minutes (parallel execution)

**Output**:
- `Max-Booster-Setup-1.0.0.exe` - Windows installer (~150 MB)
- `Max-Booster-1.0.0.dmg` - macOS disk image (~150 MB)
- `Max-Booster-1.0.0.AppImage` - Linux portable app (~150 MB)

**How to Use**:
```bash
# Create and push a release tag
git tag v1.0.0
git push origin v1.0.0

# Or trigger manually via GitHub UI:
# Actions → Build Desktop Installers → Run workflow
```

**Download Results**:
- **GitHub Releases**: Repo → Releases → Click version
- **Workflow Artifacts**: Actions → Click workflow run → Artifacts section

---

## Why GitHub Actions?

Building Electron apps requires:
- **Native build tools** for each platform (Xcode, Visual Studio, etc.)
- **5-10 minutes** of sustained CPU for native module compilation
- **2-4 GB RAM** during build process
- **OS-specific toolchains** (codesign, notarization, etc.)

GitHub provides hosted runners with all of these pre-installed:
- **windows-latest**: Windows Server with Visual Studio build tools
- **macos-latest**: macOS with Xcode and codesign
- **ubuntu-latest**: Ubuntu with all Linux packaging tools

This means you get **professional build infrastructure for free**, with no manual setup required!

---

## Cost

**FREE** for public repositories (unlimited Actions minutes)

**Free tier** for private repositories:
- 2,000 minutes/month free
- Each release uses ~20 minutes total
- = **100 releases/month** on free tier

---

## Future Enhancements

Potential additions to this workflow:

1. **Code Signing**:
   - Add Windows code signing certificate
   - Add Apple Developer ID for macOS notarization
   - Removes security warnings on first launch

2. **Auto-Update Server**:
   - Integrate with electron-updater
   - Host update manifests on GitHub
   - Users get automatic updates

3. **Build Notifications**:
   - Slack/Discord notifications when builds complete
   - Email on build failures

4. **Release Notes**:
   - Auto-generate changelogs from git commits
   - Include in GitHub Release description

5. **Smoke Tests**:
   - Launch app in headless mode
   - Verify core functionality before publishing

For now, the basic automated build workflow provides everything you need to distribute professional desktop installers!
