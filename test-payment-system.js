/**
 * Payment System Test Script
 *
 * Tests QRIS generation and payment service functionality
 */

// Mock imports for Node.js testing
const { generateQRISString, validateQRIS, parseQRIS } = require('./dist-test/qris-generator.cjs')

console.log('🧪 PAYMENT SYSTEM COMPREHENSIVE TEST\n')
console.log('=' .repeat(60))

// Test 1: QRIS Generator
console.log('\n📱 TEST 1: QRIS Generator')
console.log('-'.repeat(60))

try {
  const qrisConfig = {
    merchantName: 'AGDS Corp',
    merchantCity: 'Jakarta',
    amount: 50000,
    transactionId: 'TRX-TEST-001'
  }

  const qrisString = generateQRISString(qrisConfig)

  console.log('✓ QRIS String Generated:')
  console.log('  Length:', qrisString.length, 'characters')
  console.log('  First 50 chars:', qrisString.substring(0, 50))
  console.log('  Format indicator:', qrisString.substring(0, 6))
  console.log('  Contains merchant:', qrisString.includes('AGDS Corp') ? '✓' : '✗')
  console.log('  Contains amount:', qrisString.includes('50000.00') ? '✓' : '✗')

  // Test validation
  const isValid = validateQRIS(qrisString)
  console.log('\n✓ QRIS Validation:', isValid ? 'PASS ✓' : 'FAIL ✗')

  // Test parsing
  const parsed = parseQRIS(qrisString)
  console.log('\n✓ QRIS Parsed Fields:')
  console.log('  Payload Format:', parsed.payloadFormatIndicator)
  console.log('  Merchant Name:', parsed.merchantName)
  console.log('  Merchant City:', parsed.merchantCity)
  console.log('  Currency:', parsed.transactionCurrency)
  console.log('  Amount:', parsed.transactionAmount)

} catch (error) {
  console.error('✗ QRIS Generator Test Failed:', error.message)
}

// Test 2: Static QRIS (no amount)
console.log('\n\n📱 TEST 2: Static QRIS (No Amount)')
console.log('-'.repeat(60))

try {
  const staticConfig = {
    merchantName: 'AGDS Corp',
    merchantCity: 'Jakarta'
  }

  const staticQRIS = generateQRISString(staticConfig)

  console.log('✓ Static QRIS Generated:')
  console.log('  Length:', staticQRIS.length, 'characters')
  console.log('  Point of Initiation:', staticQRIS.substring(4, 8), '(should be 0111 for static)')
  console.log('  Contains amount field:', staticQRIS.includes('54') ? '✗ Has amount' : '✓ No amount')

  const isValid = validateQRIS(staticQRIS)
  console.log('  Validation:', isValid ? 'PASS ✓' : 'FAIL ✗')

} catch (error) {
  console.error('✗ Static QRIS Test Failed:', error.message)
}

// Test 3: CRC Validation
console.log('\n\n🔐 TEST 3: CRC Checksum Validation')
console.log('-'.repeat(60))

try {
  const testConfig = {
    merchantName: 'Test Merchant',
    merchantCity: 'Jakarta',
    amount: 100000
  }

  const qris1 = generateQRISString(testConfig)
  const qris2 = generateQRISString(testConfig)

  console.log('✓ Consistency Test:')
  console.log('  QRIS 1 == QRIS 2:', qris1 === qris2 ? '✓ PASS' : '✗ FAIL')

  // Tamper test
  const tamperedQRIS = qris1.substring(0, qris1.length - 4) + 'FFFF'
  const isTamperedValid = validateQRIS(tamperedQRIS)
  console.log('  Tampered QRIS detected:', !isTamperedValid ? '✓ PASS' : '✗ FAIL')

} catch (error) {
  console.error('✗ CRC Test Failed:', error.message)
}

console.log('\n' + '='.repeat(60))
console.log('✅ QRIS GENERATOR TESTS COMPLETED\n')
