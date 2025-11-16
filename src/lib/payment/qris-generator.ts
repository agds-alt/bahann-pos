/**
 * QRIS Generator - EMV QRCPS-MPM Standard
 *
 * Generates static QRIS codes for Indonesian payment systems.
 * Follows Bank Indonesia and EMV specifications.
 *
 * @see https://www.emvco.com/emv-technologies/qrcodes/
 * @see https://qris.id
 */

import QRCode from 'qrcode'

interface QRISConfig {
  merchantName: string
  merchantCity: string
  merchantPAN?: string // Primary Account Number (optional for static)
  amount?: number // Optional for static QRIS (customer enters amount)
  transactionId?: string
}

interface QRISDataField {
  id: string
  value: string
}

/**
 * Generate QRIS string based on EMV QRCPS-MPM standard
 */
export function generateQRISString(config: QRISConfig): string {
  const fields: QRISDataField[] = []

  // 00: Payload Format Indicator (fixed)
  fields.push({ id: '00', value: '01' })

  // 01: Point of Initiation Method
  // 11 = Static (same QR for all transactions)
  // 12 = Dynamic (unique QR per transaction)
  fields.push({ id: '01', value: config.amount ? '12' : '11' })

  // 26-51: Merchant Account Information (26 for Indonesia)
  // This is where QRIS/NMID goes - simplified for static QRIS
  if (config.merchantPAN) {
    fields.push({
      id: '26',
      value: formatSubfield([
        { id: '00', value: 'ID.CO.QRIS.WWW' }, // Global ID
        { id: '01', value: config.merchantPAN } // Merchant PAN/NMID
      ])
    })
  }

  // 52: Merchant Category Code (5411 = Grocery/Supermarket, 5999 = Miscellaneous)
  fields.push({ id: '52', value: '5999' })

  // 53: Transaction Currency (360 = IDR)
  fields.push({ id: '53', value: '360' })

  // 54: Transaction Amount (if specified)
  if (config.amount && config.amount > 0) {
    fields.push({ id: '54', value: config.amount.toFixed(2) })
  }

  // 58: Country Code (ID = Indonesia)
  fields.push({ id: '58', value: 'ID' })

  // 59: Merchant Name (max 25 chars)
  fields.push({ id: '59', value: config.merchantName.substring(0, 25) })

  // 60: Merchant City (max 15 chars)
  fields.push({ id: '60', value: config.merchantCity.substring(0, 15) })

  // 62: Additional Data Field Template (optional)
  if (config.transactionId) {
    fields.push({
      id: '62',
      value: formatSubfield([
        { id: '01', value: config.transactionId } // Bill Number
      ])
    })
  }

  // Build QRIS string (without CRC yet)
  let qrisString = fields.map(field => formatField(field)).join('')

  // 63: CRC (must be last field) - calculated over all previous fields + '6304'
  const crc = calculateCRC16(qrisString + '6304')
  qrisString += formatField({ id: '63', value: crc })

  return qrisString
}

/**
 * Format a field in EMV format: ID(2) + Length(2) + Value
 */
function formatField(field: QRISDataField): string {
  const length = field.value.length.toString().padStart(2, '0')
  return `${field.id}${length}${field.value}`
}

/**
 * Format subfields (nested fields)
 */
function formatSubfield(subfields: QRISDataField[]): string {
  return subfields.map(field => formatField(field)).join('')
}

/**
 * Calculate CRC-16/CCITT-FALSE checksum
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
function calculateCRC16(data: string): string {
  let crc = 0xFFFF
  const polynomial = 0x1021

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8

    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc = crc << 1
      }
    }
  }

  crc = crc & 0xFFFF
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Generate QRIS QR code as Data URL (PNG)
 */
export async function generateQRISImage(
  config: QRISConfig,
  options?: {
    width?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    margin?: number
  }
): Promise<string> {
  const qrisString = generateQRISString(config)

  return await QRCode.toDataURL(qrisString, {
    width: options?.width || 300,
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    margin: options?.margin || 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
}

/**
 * Generate QRIS QR code as SVG
 */
export async function generateQRISSVG(config: QRISConfig): Promise<string> {
  const qrisString = generateQRISString(config)

  return await QRCode.toString(qrisString, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2
  })
}

/**
 * Validate QRIS string format
 */
export function validateQRIS(qrisString: string): boolean {
  try {
    // Check minimum length
    if (qrisString.length < 50) return false

    // Check payload format indicator (must be '0001')
    if (!qrisString.startsWith('000201')) return false

    // Check if CRC field exists (last 8 chars should be '63' + length + 4-char CRC)
    if (!qrisString.match(/6304[0-9A-F]{4}$/)) return false

    // Validate CRC
    const dataWithoutCRC = qrisString.substring(0, qrisString.length - 4)
    const providedCRC = qrisString.substring(qrisString.length - 4)
    const calculatedCRC = calculateCRC16(dataWithoutCRC)

    return providedCRC === calculatedCRC
  } catch (error) {
    return false
  }
}

/**
 * Parse QRIS string into readable fields
 */
export function parseQRIS(qrisString: string): Record<string, any> {
  const fields: Record<string, any> = {}
  let position = 0

  while (position < qrisString.length) {
    const id = qrisString.substring(position, position + 2)
    const length = parseInt(qrisString.substring(position + 2, position + 4), 10)
    const value = qrisString.substring(position + 4, position + 4 + length)

    // Map IDs to readable names
    const fieldNames: Record<string, string> = {
      '00': 'payloadFormatIndicator',
      '01': 'pointOfInitiation',
      '26': 'merchantAccountInfo',
      '52': 'merchantCategoryCode',
      '53': 'transactionCurrency',
      '54': 'transactionAmount',
      '58': 'countryCode',
      '59': 'merchantName',
      '60': 'merchantCity',
      '62': 'additionalData',
      '63': 'crc'
    }

    const fieldName = fieldNames[id] || `field_${id}`
    fields[fieldName] = value

    position += 4 + length
  }

  return fields
}
