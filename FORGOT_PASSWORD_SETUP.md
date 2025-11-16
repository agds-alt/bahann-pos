# Forgot Password Setup Guide

Panduan lengkap untuk mengaktifkan fitur forgot password.

## ✅ Yang Sudah Dikerjakan

1. ✅ Database migration (`012_password_reset_tokens.sql`)
2. ✅ Email service integration (Resend)
3. ✅ Backend tRPC endpoints
4. ✅ Frontend pages (forgot-password & reset-password)
5. ✅ Security features (token expiry, single-use, email enumeration protection)

## 📋 Setup Yang Perlu Dilakukan

### 1. Jalankan Migration di Supabase

**Step-by-step:**

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New query**
5. Copy-paste isi file `supabase/migrations/012_password_reset_tokens.sql`
6. Klik **Run** atau tekan `Ctrl+Enter`

**Verifikasi:**
```sql
-- Cek apakah tabel sudah dibuat
SELECT * FROM password_reset_tokens LIMIT 1;
```

### 2. Setup Resend Email Service

**Step 1: Daftar di Resend**
1. Buka https://resend.com
2. Sign up gratis (100 emails/day untuk free tier)
3. Verifikasi email Anda

**Step 2: Dapatkan API Key**
1. Login ke Resend dashboard
2. Klik **API Keys** di sidebar
3. Klik **Create API Key**
4. Berikan nama: `AGDS POS Production` atau `AGDS POS Development`
5. Copy API key yang digenerate (hanya muncul sekali!)

**Step 3: Konfigurasi Domain Email (Opsional tapi Recommended)**

Untuk production, gunakan domain sendiri:
1. Di Resend dashboard, klik **Domains**
2. Klik **Add Domain**
3. Masukkan domain Anda (contoh: `agdscorp.com`)
4. Tambahkan DNS records yang diminta ke domain provider Anda
5. Tunggu verifikasi (biasanya 5-30 menit)

Setelah verified, email akan terkirim dari `noreply@agdscorp.com` (atau domain Anda)

**Untuk Development/Testing:**
- Bisa pakai `onboarding@resend.dev` (default)
- Email hanya bisa dikirim ke email yang verified di akun Resend Anda
- Jadi harus verify email tujuan dulu di Resend dashboard

### 3. Update Environment Variables

Edit file `.env.local`:

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx  # Paste API key dari Resend
FROM_EMAIL=noreply@agdscorp.com          # Ganti dengan domain Anda, atau gunakan onboarding@resend.dev untuk testing
```

**PENTING:**
- Jangan commit `.env.local` ke git!
- Untuk production, set environment variables di hosting provider (Vercel, dll)

### 4. Restart Development Server

```bash
# Ctrl+C untuk stop server yang running
pnpm dev
```

## 🧪 Testing Flow

### Test Forgot Password Flow:

1. **Request Reset Password**
   - Buka http://localhost:3000/forgot-password
   - Masukkan email user yang ada di database
   - Klik "Kirim Link Reset"
   - Cek email (atau Resend Logs jika development)

2. **Cek Email**
   - Buka email yang masuk
   - Klik tombol "Reset Password" atau copy link
   - Link format: `http://localhost:3000/reset-password?token=...`

3. **Reset Password**
   - Masukkan password baru (min 8 karakter)
   - Konfirmasi password
   - Klik "Reset Password"
   - Akan redirect ke login page

4. **Login dengan Password Baru**
   - Login dengan email dan password baru
   - Harus berhasil!

### Test Edge Cases:

**1. Token Expired:**
```sql
-- Set token expired (untuk testing)
UPDATE password_reset_tokens
SET expires_at = NOW() - INTERVAL '2 hours'
WHERE token = 'your_token_here';
```
- Akses link reset password → harus muncul error "Token sudah kadaluarsa"

**2. Token Already Used:**
- Reset password sekali (berhasil)
- Coba pakai link yang sama lagi
- Harus muncul error "Token sudah digunakan"

**3. Invalid Token:**
- Akses `http://localhost:3000/reset-password?token=invalid123`
- Harus muncul error "Token tidak valid"

**4. Email Enumeration Protection:**
- Request reset dengan email yang tidak terdaftar
- Tetap muncul success message (security!)
- Tapi email tidak terkirim (cek logs)

## 📧 Email Template Preview

Email yang terkirim memiliki:
- ✅ Beautiful gradient header
- ✅ Clear call-to-action button
- ✅ Fallback link text
- ✅ Warning box dengan informasi penting
- ✅ Responsive design
- ✅ Professional branding

## 🔒 Security Features

1. **Token Security:**
   - 64 karakter random string
   - Expires dalam 1 jam
   - Single-use only (tidak bisa dipakai 2x)
   - Stored hashed di database

2. **Email Enumeration Protection:**
   - Selalu return success message
   - Tidak expose apakah email exist atau tidak

3. **Auto Logout:**
   - Setelah reset password, semua device otomatis logout
   - Revoke all refresh tokens untuk user tersebut

4. **Audit Logging:**
   - Password reset request logged
   - Password reset complete logged
   - Track userId, email, timestamp

## 🚀 Production Deployment

### Vercel (Recommended):

1. **Set Environment Variables:**
   ```
   RESEND_API_KEY=re_xxxxx
   FROM_EMAIL=noreply@agdscorp.com
   NEXT_PUBLIC_APP_URL=https://pos.agdscorp.com
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Verify:**
   - Test forgot password flow di production URL
   - Cek email delivery

### Other Hosting:

- Pastikan semua env vars ter-set
- `NEXT_PUBLIC_APP_URL` harus production URL
- Resend API key harus production key (bukan test)

## 🐛 Troubleshooting

### Email Tidak Terkirim

**Check 1: Resend API Key**
```bash
# Test API key dengan curl
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

**Check 2: Logs**
- Cek terminal untuk error logs
- Cek Resend dashboard → Logs

**Check 3: Email Domain**
- Pastikan FROM_EMAIL sudah verified
- Atau gunakan `onboarding@resend.dev` untuk testing

### Token Tidak Valid

**Check Database:**
```sql
-- Cek token di database
SELECT * FROM password_reset_tokens
WHERE token = 'your_token_here';

-- Cek apakah expired
SELECT *,
  CASE
    WHEN expires_at > NOW() THEN 'valid'
    ELSE 'expired'
  END as status
FROM password_reset_tokens
WHERE token = 'your_token_here';
```

### Migration Gagal

**Check Permissions:**
```sql
-- Cek user permissions
SELECT * FROM pg_roles WHERE rolname = 'authenticator';
```

**Manual Fix:**
- Copy SQL dari migration file
- Run satu per satu di SQL editor
- Cek error message untuk detail

## 📞 Support

Jika ada masalah:
1. Cek logs di terminal
2. Cek Resend dashboard logs
3. Cek Supabase logs
4. Verify semua env vars sudah benar

## 🎉 Success Checklist

- [ ] Migration berhasil di Supabase
- [ ] Resend API key sudah di set
- [ ] Email domain sudah verified (production)
- [ ] Test request reset password berhasil
- [ ] Email terkirim dan diterima
- [ ] Reset password berhasil
- [ ] Login dengan password baru berhasil
- [ ] Token expired case tested
- [ ] Token reuse case tested

Jika semua checklist ✅, congratulations! Forgot password flow sudah aktif! 🚀
