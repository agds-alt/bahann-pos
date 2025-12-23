const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

async function generatePDF() {
  try {
    console.log('📄 Reading markdown file...');
    const markdownPath = path.join(__dirname, '..', 'CUSTOMER_DOCUMENTATION.md');
    const markdown = fs.readFileSync(markdownPath, 'utf-8');

    console.log('🔄 Converting markdown to HTML...');
    const html = marked.parse(markdown);

    const styledHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bahann POS - Customer Documentation</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                   'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }

    h1 {
      color: #48B9C7;
      font-size: 2.5em;
      margin: 1em 0 0.5em 0;
      padding-bottom: 0.3em;
      border-bottom: 3px solid #48B9C7;
      page-break-after: avoid;
    }

    h2 {
      color: #2D3748;
      font-size: 1.8em;
      margin: 1.5em 0 0.8em 0;
      padding-top: 0.5em;
      border-bottom: 2px solid #E2E8F0;
      page-break-after: avoid;
    }

    h3 {
      color: #4A5568;
      font-size: 1.4em;
      margin: 1.2em 0 0.6em 0;
      page-break-after: avoid;
    }

    h4 {
      color: #718096;
      font-size: 1.1em;
      margin: 1em 0 0.5em 0;
      page-break-after: avoid;
    }

    p {
      margin: 0.8em 0;
      text-align: justify;
    }

    ul, ol {
      margin: 0.8em 0;
      padding-left: 2em;
    }

    li {
      margin: 0.4em 0;
    }

    code {
      background: #F7FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 3px;
      padding: 2px 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #D53F8C;
    }

    pre {
      background: #2D3748;
      color: #F7FAFC;
      border-radius: 6px;
      padding: 1em;
      overflow-x: auto;
      margin: 1em 0;
      page-break-inside: avoid;
    }

    pre code {
      background: transparent;
      border: none;
      color: #F7FAFC;
      padding: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #E2E8F0;
      padding: 0.75em;
      text-align: left;
    }

    th {
      background: #48B9C7;
      color: white;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #F7FAFC;
    }

    blockquote {
      border-left: 4px solid #48B9C7;
      background: #F7FAFC;
      padding: 1em 1em 1em 2em;
      margin: 1em 0;
      font-style: italic;
      page-break-inside: avoid;
    }

    hr {
      border: none;
      border-top: 2px solid #E2E8F0;
      margin: 2em 0;
    }

    .cover-page {
      text-align: center;
      padding: 4em 0;
      page-break-after: always;
    }

    .cover-page h1 {
      font-size: 3em;
      margin-bottom: 0.5em;
      border: none;
    }

    .cover-page .subtitle {
      font-size: 1.5em;
      color: #718096;
      margin-bottom: 2em;
    }

    .cover-page .version {
      font-size: 1.2em;
      color: #48B9C7;
      margin: 1em 0;
    }

    .footer {
      text-align: center;
      color: #718096;
      font-size: 0.9em;
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #E2E8F0;
    }

    /* Print optimizations */
    @media print {
      body {
        background: white;
      }

      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }

      table, figure, img, pre {
        page-break-inside: avoid;
      }

      ul, ol {
        page-break-before: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1>📊 BAHANN POS</h1>
    <div class="subtitle">Sistem Point of Sale Modern</div>
    <div class="subtitle">Dokumentasi Lengkap untuk Customer</div>
    <div class="version">Version 1.0.0</div>
    <div class="version">November 2024</div>
    <div style="margin-top: 3em; color: #4A5568;">
      <p>Dibuat dengan ❤️ menggunakan teknologi modern</p>
      <p>Next.js • React • TypeScript • Supabase</p>
    </div>
  </div>

  ${html}

  <div class="footer">
    <p>© 2024 Bahann POS. All rights reserved.</p>
    <p>Generated on ${new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
  </div>
</body>
</html>
    `;

    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(styledHTML, { waitUntil: 'networkidle0' });

    console.log('📄 Generating PDF...');
    const pdfPath = path.join(__dirname, '..', 'CUSTOMER_DOCUMENTATION.pdf');

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    const stats = fs.statSync(pdfPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ PDF generated successfully!');
    console.log(`📁 Location: ${pdfPath}`);
    console.log(`📊 File size: ${fileSizeInMB} MB`);
    console.log('');
    console.log('🎉 Documentation ready for customer!');

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

generatePDF();
