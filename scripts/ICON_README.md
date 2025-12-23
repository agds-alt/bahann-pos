# 🎨 Logo & Icon Update Guide

## Steps to Update App Logo

### 1. Prepare Your Icon

Requirements:
- **Format:** PNG with transparent background
- **Size:** Minimum 512x512px (recommended 1024x1024px)
- **Aspect Ratio:** Square (1:1)
- **Background:** Transparent
- **File name:** `icon.png`

### 2. Place Icon File

Copy your `icon.png` to the root project folder:
```
/DataPopOS/projects/POS/bahann-pos/icon.png
```

### 3. Generate All Icon Sizes

Run the icon generator script:
```bash
node scripts/generate-icons.js
```

This will automatically generate:
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png (PWA standard)
- ✅ icon-384x384.png
- ✅ icon-512x512.png (PWA standard)
- ✅ favicon.png (32x32)
- ✅ apple-touch-icon.png (180x180)

### 4. Verify

Check `public/` folder for all generated icons:
```bash
ls -lh public/icon-*.png
```

### 5. Test

1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload app (Ctrl+F5)
3. Check favicon in browser tab
4. Check PWA icon when installed
5. Check Apple touch icon on iOS

### 6. Commit Changes

```bash
git add public/icon-*.png public/favicon.png public/apple-touch-icon.png
git commit -m "chore: Update app logo/icon"
git push
```

## Troubleshooting

**Error: icon.png not found**
- Make sure file is in root project folder
- Check file name is exactly `icon.png` (lowercase)

**Low quality icons**
- Use higher resolution source (1024x1024px minimum)
- Ensure source has transparent background

**Icons not updating in browser**
- Clear browser cache
- Hard reload (Ctrl+F5)
- Try incognito/private window

## Current Icon Status

Run this to check:
```bash
ls -lh public/icon-* public/favicon.png public/apple-touch-icon.png
```

