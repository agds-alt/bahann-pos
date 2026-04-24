export const PLAN_PRICES_IDR: Record<string, number> = {
  warung: 99_000,
  starter: 299_000,
  professional: 1_200_000,
}

export function generateUniqueAmountIDR(basePriceIDR: number): number {
  const offset = Math.floor(Math.random() * 999) + 1
  return basePriceIDR + offset
}

export function formatWaPaymentNotif(params: {
  userEmail: string
  userName: string
  plan: string
  uniqueAmount: number
}): string {
  const fmt = new Intl.NumberFormat('id-ID').format(params.uniqueAmount)
  return [
    `💰 *Payment Request Baru*`,
    ``,
    `Dari: ${params.userName} (${params.userEmail})`,
    `Plan: ${params.plan.toUpperCase()}`,
    `Nominal: Rp ${fmt}`,
    ``,
    `Cek /admin/payments untuk approve.`,
  ].join('\n')
}

export function buildWaDeepLink(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  const intl = clean.startsWith('0') ? `62${clean.slice(1)}` : clean
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
}
