import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export interface SendPasswordResetEmailParams {
  to: string
  name: string
  resetToken: string
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: SendPasswordResetEmailParams) {
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset Password - AGDS Corp POS',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">AGDS Corp POS</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Point of Sale System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 24px;">Reset Password Anda</h2>

              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Halo <strong>${name}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Kami menerima permintaan untuk reset password akun Anda. Klik tombol di bawah untuk membuat password baru:
              </p>

              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      🔐 Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Atau copy dan paste link berikut ke browser Anda:
              </p>

              <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; word-break: break-all;">
                <a href="${resetLink}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                  ${resetLink}
                </a>
              </div>

              <!-- Warning Box -->
              <div style="background-color: #fef5e7; border-left: 4px solid #f39c12; padding: 16px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0; color: #d68910; font-size: 14px; font-weight: 600;">⚠️ Penting:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #d68910; font-size: 14px;">
                  <li>Link ini hanya berlaku selama <strong>1 jam</strong></li>
                  <li>Jika Anda tidak merasa meminta reset password, abaikan email ini</li>
                  <li>Jangan bagikan link ini ke siapapun</li>
                </ul>
              </div>

              <p style="margin: 20px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Jika Anda memiliki pertanyaan, hubungi administrator sistem.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 2px solid #e2e8f0;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} AGDS Corp. All rights reserved.
              </p>
              <p style="margin: 10px 0 0 0; color: #a0aec0; font-size: 12px;">
                Email otomatis - mohon tidak membalas email ini
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('❌ Failed to send password reset email:', error)
      throw new Error('Failed to send email')
    }

    console.log('✅ Password reset email sent:', { to, id: data?.id })
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}

/**
 * Generate secure random token for password reset
 */
export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const length = 64 // 64 character token

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}
