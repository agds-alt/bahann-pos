/**
 * QRIS Generator Test
 * Run: npx tsx test-qris.ts
 */

import { generateQRISString, validateQRIS, parseQRIS, generateQRISImage } from './src/lib/payment/qris-generator'

console.log('🧪 QRIS GENERATOR TEST\n')
console.log('='.repeat(60))

// Test 1: Dynamic QRIS with Amount
console.log('\n📱 TEST 1: Dynamic QRIS (With Amount)')
console.log('-'.repeat(60))

const qrisConfig = {
  merchantName: 'AGDS Corp',
  merchantCity: 'Jakarta',
  amount: 50000,
  transactionId: 'TRX-TEST-001'
}

const qrisString = generateQRISString(qrisConfig)

console.log('✓ QRIS String Generated:')
console.log('  Length:', qrisString.length, 'characters')
console.log('  Full String:', qrisString)
console.log('\n✓ Format Check:')
console.log('  Starts with 000201:', qrisString.startsWith('000201') ? '✓ PASS' : '✗ FAIL')
console.log('  Ends with 6304xxxx:', qrisString.match(/6304[0-9A-F]{4}$/) ? '✓ PASS' : '✗ FAIL')

// Validation
const isValid = validateQRIS(qrisString)
console.log('\n✓ CRC Validation:', isValid ? '✅ PASS' : '❌ FAIL')

// Parse
const parsed = parseQRIS(qrisString)
console.log('\n✓ Parsed Fields:')
console.log('  Payload Format:', parsed.payloadFormatIndicator)
console.log('  Point of Init:', parsed.pointOfInitiation, '(12 = dynamic)')
console.log('  Currency:', parsed.transactionCurrency)
console.log('  Amount:', parsed.transactionAmount)
console.log('  Country:', parsed.countryCode)
console.log('  Merchant:', parsed.merchantName)
console.log('  City:', parsed.merchantCity)

// Test 2: Static QRIS (No Amount)
console.log('\n\n📱 TEST 2: Static QRIS (No Amount)')
console.log('-'.repeat(60))

const staticConfig = {
  merchantName: 'AGDS Corp',
  merchantCity: 'Jakarta'
}

const staticQRIS = generateQRISString(staticConfig)

console.log('✓ Static QRIS Generated:')
console.log('  Length:', staticQRIS.length, 'characters')
console.log('  Full String:', staticQRIS)

const staticParsed = parseQRIS(staticQRIS)
console.log('\n✓ Point of Initiation:', staticParsed.pointOfInitiation, '(11 = static)')
console.log('  Has Amount Field:', staticParsed.transactionAmount ? '✗ FAIL' : '✓ PASS')

const isStaticValid = validateQRIS(staticQRIS)
console.log('  CRC Validation:', isStaticValid ? '✅ PASS' : '❌ FAIL')

// Test 3: QR Image Generation
console.log('\n\n🖼️  TEST 3: QR Image Generation')
console.log('-'.repeat(60))

generateQRISImage(qrisConfig, { width: 300 })
  .then(dataUrl => {
    console.log('✓ QR Image Generated:')
    console.log('  Format:', dataUrl.startsWith('data:image/png;base64,') ? '✅ PNG' : '❌ Unknown')
    console.log('  Size:', dataUrl.length, 'characters')
    console.log('  Preview:', dataUrl.substring(0, 50) + '...')

    console.log('\n' + '='.repeat(60))
    console.log('✅ ALL TESTS COMPLETED')
  })
  .catch(err => {
    console.error('❌ QR Image Generation Failed:', err.message)
  })
