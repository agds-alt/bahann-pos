# 📄 Documentation Scripts

## Generate Customer Documentation PDF

Script ini digunakan untuk generate dokumentasi customer dalam format PDF dari file markdown.

### Prerequisites

```bash
npm install marked puppeteer --save-dev
```

### Usage

```bash
node scripts/generate-pdf.js
```

### Output

- **File:** `CUSTOMER_DOCUMENTATION.pdf`
- **Location:** Root project folder
- **Size:** ~0.7 MB
- **Format:** A4, professional styling

### Features

- ✅ Professional styling dengan Pop!OS color scheme
- ✅ Cover page dengan branding
- ✅ Table of contents friendly
- ✅ Print-optimized layout
- ✅ Syntax highlighting untuk code blocks
- ✅ Responsive tables
- ✅ Footer dengan timestamp

### Note

PDF file sudah ditambahkan ke `.gitignore` sehingga tidak akan di-push ke repository.
Generate ulang PDF setiap kali ada perubahan di `CUSTOMER_DOCUMENTATION.md`.

### Editing Documentation

1. Edit file `CUSTOMER_DOCUMENTATION.md`
2. Run `node scripts/generate-pdf.js`
3. PDF akan di-update otomatis

### Troubleshooting

**Error: Cannot find module 'marked'**
```bash
npm install marked puppeteer --save-dev
```

**Error: Browser not found**
```bash
# Puppeteer will download Chromium automatically
# Just run the script again
```

**PDF too large**
```bash
# Reduce image sizes in markdown
# Or compress PDF using online tools
```
