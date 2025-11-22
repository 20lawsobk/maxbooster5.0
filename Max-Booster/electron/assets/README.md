# Desktop App Icon Assets

This directory contains the icon assets for the Max Booster desktop application.

## Required Files

### macOS
- `icon.icns` - macOS app icon (512x512@2x, 256x256@2x, 128x128@2x, 32x32@2x, 16x16@2x)
- `dmg-background.png` - DMG installer background (540x380px)

### Windows
- `icon.ico` - Windows app icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
- `installer-header.bmp` - NSIS installer header (150x57px)

### Linux
- `icon.png` - Linux app icon (512x512px PNG)

## Generating Icons

You can use your brand assets and convert them to the required formats using:

1. **macOS (.icns)**: Use `iconutil` or online converters
2. **Windows (.ico)**: Use ImageMagick or online converters
3. **Linux (.png)**: Standard PNG image editor

## Current Status

Placeholder icons should be replaced with actual Max Booster branded icons before production release.

The build system requires these files to exist. If missing, electron-builder will fail.

## Design Guidelines

- Use the Max Booster brand colors (cyan/blue gradient)
- Include the "M" logo or "Max Booster" branding
- Ensure icons are clear and recognizable at all sizes
- Follow platform-specific icon guidelines (macOS HIG, Windows fluent design, Linux freedesktop)
