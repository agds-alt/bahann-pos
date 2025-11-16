# 📖 Dokumentasi Fitur Sistem POS AGDS Corp

**Versi Sistem:** 1.0
**Terakhir Diperbarui:** 16 November 2025
**Dibuat untuk:** Client & End User

---

## 🎯 Ringkasan Sistem

AGDS Corp POS adalah sistem Point of Sale (kasir) modern yang dirancang untuk memudahkan pengelolaan transaksi penjualan, stok barang, dan laporan bisnis. Sistem ini dapat diakses melalui komputer, tablet, maupun smartphone.

**Website:** http://localhost:3001 (Development)

---

## 📋 Daftar Fitur Lengkap

### 🔐 1. Sistem Keamanan & Akses

#### 1.1 Login & Registrasi
- **Login Aman** dengan email dan password
- **Registrasi User Baru** oleh admin
- **Show/Hide Password** - Tombol mata untuk lihat/sembunyikan password
- **Keamanan Berlapis** dengan enkripsi password

#### 1.2 Lupa Password (BARU ✨)
- **Request Reset Password** via email
- **Link Reset Valid 1 Jam** untuk keamanan
- **Email Otomatis** dengan template profesional
- **Token Single-Use** - Link hanya bisa dipakai 1 kali
- **Auto Logout Semua Device** setelah reset password

**Cara Pakai:**
1. Klik "Lupa password?" di halaman login
2. Masukkan email terdaftar
3. Cek email untuk link reset
4. Klik link, masukkan password baru
5. Login dengan password baru

#### 1.3 Manajemen User & Role
- **3 Level Akses:**
  - 👑 **Admin** - Akses penuh semua fitur
  - 👔 **Manager** - Kelola produk, stok, dan laporan
  - 👤 **User (Kasir)** - Akses transaksi dan kasir saja

- **Atur Hak Akses** untuk setiap user
- **Ganti Role** user (admin saja)
- **Status Visual** dengan badge warna:
  - Merah = Admin
  - Kuning = Manager
  - Hijau = User

---

### 🏪 2. Manajemen Outlet

#### 2.1 Daftar Outlet
- **Lihat Semua Outlet** dengan informasi lengkap
- **Tambah Outlet Baru** dengan form mudah
- **Edit & Hapus Outlet**
- **Status Aktif/Nonaktif**

**Informasi Outlet:**
- Nama outlet
- Alamat lengkap
- Status operasional
- Tanggal dibuat

#### 2.2 Pemilihan Outlet
- **Pilih Outlet** sebelum transaksi
- **Info Outlet Terpilih** ditampilkan jelas
- **Stok Otomatis** sesuai outlet yang dipilih

---

### 📦 3. Manajemen Produk

#### 3.1 Daftar Produk
- **Lihat Semua Produk** dengan tampilan grid/card
- **Search Produk** dengan nama atau SKU
- **Filter by Kategori**
- **Sort by** Nama, Harga, Stok

**Info Produk:**
- Foto produk (jika ada)
- Nama produk
- SKU (kode unik)
- Harga jual
- Kategori
- Stok tersedia

#### 3.2 Tambah/Edit Produk
- **Form Lengkap:**
  - Nama produk
  - SKU (auto-generate atau manual)
  - Harga jual
  - Kategori
  - Deskripsi
  - Upload foto produk

- **Validasi Otomatis** untuk cegah error
- **SKU Unik** - sistem cek duplikat otomatis

#### 3.3 Kategori Produk
- Makanan & Minuman
- Elektronik
- Fashion & Pakaian
- Kesehatan & Kecantikan
- Rumah Tangga
- Olahraga
- Dan kategori lainnya (bisa ditambah)

---

### 📊 4. Manajemen Stok

#### 4.1 Lihat Stok Real-Time
- **Stok per Outlet**
- **Stok Minimum** warning otomatis
- **History Pergerakan Stok**
- **Status Warna:**
  - ✅ Hijau = Stok aman
  - ⚠️ Kuning = Stok sedikit (≤10)
  - ❌ Merah = Habis

#### 4.2 Stok Masuk (Restocking)
- **Tambah Stok** untuk produk tertentu
- **Pilih Outlet** tujuan
- **Input Jumlah** yang masuk
- **Catatan** untuk referensi
- **Auto Update** stok langsung

#### 4.3 Transfer Stok Antar Outlet
- **Pindah Stok** dari outlet A ke B
- **Pilih Produk & Jumlah**
- **Validasi Stok** otomatis
- **Tracking** history transfer
- **Audit Log** lengkap

#### 4.4 Stok Opname
- **Cek Fisik Stok** vs sistem
- **Adjustment** jika ada selisih
- **Reason** kenapa ada perbedaan
- **Report** stok opname

---

### 💰 5. Point of Sale (Kasir)

#### 5.1 Transaksi Penjualan
**Fitur Utama:**
- **Pilih Outlet** sebelum mulai transaksi
- **Pilih Produk** dari dropdown dengan info:
  - Nama produk
  - Harga
  - Stok tersedia dengan status emoji

- **Input Jumlah** dengan:
  - Tombol cepat (1, 5, 10)
  - Input manual

- **Keranjang Belanja** multi-item:
  - Tambah banyak produk
  - Edit jumlah
  - Hapus item
  - Update otomatis total

#### 5.2 Scan Barcode (BARU ✨)
**3 Cara Scan:**

1. **📟 Input Manual/USB Scanner**
   - Ketik SKU produk langsung
   - Support USB barcode scanner
   - Tekan Enter untuk tambah ke keranjang

2. **📷 Kamera Scanner**
   - Buka kamera smartphone/webcam
   - Arahkan ke barcode
   - Auto-detect dan tambah ke keranjang
   - Support: QR Code, EAN-13, Code128, dll

3. **Keyboard Input**
   - Fokus otomatis ke input barcode
   - Quick entry untuk kasir cepat

**Visual Enhancement:**
- Border ungu tebal (mudah dilihat di mobile)
- Tombol gradient warna-warni
- Icon besar dan jelas
- Instruksi step-by-step

#### 5.3 Metode Pembayaran
- **Cash (Tunai)**
- **Debit Card**
- **Credit Card**
- **E-Wallet** (GoPay, OVO, Dana, dll)
- **Bank Transfer**

**Fitur Pembayaran:**
- **Tombol Cepat** nominal (50rb, 100rb, dll)
- **Uang Pas** otomatis isi total
- **Hitung Kembalian** otomatis
- **Validasi** jumlah bayar

#### 5.4 Promo & Diskon
- **Input Kode Promo**
- **Validasi Otomatis**
- **Show Potongan Harga**
- **Track Penggunaan Promo**

#### 5.5 Struk/Receipt
- **Preview Sebelum Print**
- **Print** langsung ke printer
- **Download PDF** untuk simpan
- **Email Struk** ke customer (opsional)

**Isi Struk:**
- Header toko & outlet
- Nomor transaksi unik
- Tanggal & waktu
- List produk + harga
- Subtotal
- Diskon (jika ada)
- Total bayar
- Uang terima
- Kembalian
- Metode pembayaran
- Footer terima kasih

#### 5.6 Riwayat Transaksi Terbaru
- **5 Transaksi Terakhir** ditampilkan
- **Info Lengkap:**
  - Nomor transaksi
  - Tanggal & jam
  - Total
  - Metode bayar
  - Outlet

---

### 📈 6. Dashboard & Laporan

#### 6.1 Dashboard Overview
**Statistik Real-Time:**
- 💰 **Total Penjualan** hari ini
- 📊 **Jumlah Transaksi** hari ini
- 📦 **Produk Terjual** hari ini
- ⚠️ **Stok Menipis** alert

**Grafik & Chart:**
- 📈 **Sales Trend** (7, 30, 90 hari)
- 🏆 **Top Products** best seller
- 📊 **Revenue by Outlet**
- 📉 **Low Stock Alert**

#### 6.2 Laporan Penjualan
**Filter Canggih:**
- Pilih tanggal (dari - sampai)
- Pilih outlet
- Pilih kasir
- Pilih metode bayar

**Export:**
- 📊 Excel (.xlsx)
- 📄 PDF Report
- 📧 Email Report

**Isi Laporan:**
- Total penjualan
- Jumlah transaksi
- Produk terlaris
- Ringkasan per kategori
- Perbandingan periode

#### 6.3 Laporan Stok
- **Current Stock** per outlet
- **Stock Movement** (masuk/keluar)
- **Low Stock Items**
- **Expired Items** (jika ada)
- **Stock Value** (nilai stok)

---

### 🔧 7. Pengaturan Sistem

#### 7.1 Manajemen User
- **Daftar Semua User**
- **Edit Hak Akses** (permissions)
- **Ganti Role** user
- **Nonaktifkan User** (soft delete)

**Permissions yang Bisa Diatur:**
- View/Create/Edit/Delete Produk
- View/Create/Edit/Delete Outlet
- View/Create Transaksi
- View Laporan
- Manage Users (admin only)

#### 7.2 Profil User
- **Lihat Info Profil**
- **Edit Nama & Email**
- **Ganti Password**
- **Logout**

---

## 🎨 Keunggulan Desain

### 📱 Responsive Design
- ✅ **Desktop** - Layout 3 kolom optimal
- ✅ **Tablet** - Layout adaptif 2 kolom
- ✅ **Mobile** - Layout 1 kolom, tombol besar

### 🎯 User Experience
- **Quick Actions** - Tombol cepat untuk fitur sering dipakai
- **Keyboard Shortcuts** - Tab, Enter untuk navigasi cepat
- **Auto Focus** - Input langsung fokus otomatis
- **Loading States** - Indikator loading jelas
- **Error Messages** - Pesan error mudah dipahami
- **Success Feedback** - Konfirmasi action berhasil

### 🎨 Visual Feedback
- **Status Colors:**
  - 🟢 Hijau = Success/Aman
  - 🟡 Kuning = Warning/Perhatian
  - 🔴 Merah = Error/Habis
  - 🔵 Biru = Info
  - 🟣 Ungu = Feature Highlight

- **Icons & Emoji** - Visual cues yang jelas
- **Cards & Shadows** - Hierarchy yang baik
- **Animations** - Smooth transitions

---

## 🔒 Keamanan Sistem

### Authentication & Authorization
- ✅ **JWT Tokens** dengan refresh mechanism
- ✅ **httpOnly Cookies** untuk keamanan
- ✅ **Password Hashing** (bcrypt)
- ✅ **Role-Based Access Control**
- ✅ **Session Management**
- ✅ **Auto Logout** setelah inactive

### Data Security
- ✅ **SQL Injection Protection**
- ✅ **XSS Prevention**
- ✅ **CSRF Protection**
- ✅ **Input Validation** di backend
- ✅ **Audit Logging** semua action penting

### Password Reset Security
- ✅ **Email Enumeration Protection**
- ✅ **Token Expiry** (1 jam)
- ✅ **Single-Use Tokens**
- ✅ **Revoke All Sessions** after reset

---

## 📊 Audit & Tracking

### Audit Log Features
**Semua Action Penting Tercatat:**
- Login/Logout user
- Create/Edit/Delete produk
- Transaksi penjualan
- Stok masuk/keluar/transfer
- Password reset request & complete
- User management actions

**Info Audit Log:**
- 👤 User yang melakukan action
- 📧 Email user
- 🎯 Action yang dilakukan
- 📝 Detail metadata
- ⏰ Timestamp (tanggal & waktu)
- 🏢 Outlet (jika relevan)

### Benefits Audit Log
- ✅ **Transparency** - Semua tercatat
- ✅ **Accountability** - Tahu siapa yang action
- ✅ **Security** - Detect suspicious activity
- ✅ **Compliance** - Untuk keperluan audit
- ✅ **Debugging** - Trace masalah

---

## 🚀 Teknologi yang Digunakan

### Frontend (Tampilan)
- **Next.js 16** - Framework React modern
- **React 19** - Library UI interactive
- **TypeScript** - Type-safe coding
- **Tailwind CSS** - Styling cepat & responsive
- **tRPC** - Type-safe API calls

### Backend (Server)
- **Next.js API Routes** - Serverless functions
- **Supabase (PostgreSQL)** - Database cloud
- **Redis (Upstash)** - Session & caching
- **Resend** - Email service
- **Sentry** - Error monitoring

### Libraries Tambahan
- **html5-qrcode** - Barcode scanner
- **recharts** - Grafik & chart
- **bcryptjs** - Password encryption
- **jsonwebtoken** - JWT auth
- **zod** - Validation schema
- **date-fns** - Date formatting

---

## 📱 Cara Menggunakan di Mobile

### Install sebagai App (PWA)
1. Buka website di browser mobile
2. Tap menu browser (3 titik)
3. Pilih "Add to Home Screen"
4. Icon muncul di home screen
5. Buka seperti aplikasi native

### Scan Barcode di Mobile
1. Pastikan outlet sudah dipilih
2. Scroll ke section "Scan Barcode" (border ungu tebal)
3. Tap tombol "📷 Buka Kamera Scanner"
4. Izinkan akses kamera
5. Arahkan ke barcode produk
6. Auto-detect dan masuk keranjang

### Tips Mobile
- **Portrait Mode** untuk kasir
- **Landscape** untuk lihat laporan
- **Auto-rotate** aktif untuk fleksibilitas
- **Font besar** untuk mudah dibaca
- **Tombol besar** untuk mudah tap

---

## 🎓 Panduan Pengguna by Role

### 👑 Admin
**Akses Penuh:**
1. Dashboard & Statistik
2. Kelola User (tambah, edit, hapus, ganti role)
3. Kelola Outlet (tambah, edit, hapus)
4. Kelola Produk (tambah, edit, hapus)
5. Kelola Stok (masuk, keluar, transfer, opname)
6. Transaksi Penjualan
7. Laporan Lengkap (sales, stok, user activity)
8. Audit Log (lihat semua activity)
9. Settings & Configuration

**Workflow Admin:**
- Setup outlet baru → Tambah user → Atur role & permission → Input produk → Restocking → Monitoring

### 👔 Manager
**Akses:**
1. Dashboard & Statistik
2. Lihat User (tidak bisa edit)
3. Kelola Produk (tambah, edit)
4. Kelola Stok (masuk, transfer, opname)
5. Transaksi Penjualan
6. Laporan (sales & stok)

**Workflow Manager:**
- Monitor stok → Restocking jika perlu → Tambah produk baru → Cek laporan → Bantu kasir jika busy

### 👤 User (Kasir)
**Akses:**
1. Transaksi Penjualan (focus utama)
2. Scan Barcode
3. Lihat Stok (read-only)
4. Lihat Produk (read-only)
5. Print Struk

**Workflow Kasir:**
1. Pilih outlet (jika multi-outlet)
2. Scan barcode atau pilih produk
3. Input jumlah
4. Tambah ke keranjang
5. Ulangi untuk produk lain
6. Input pembayaran
7. Proses transaksi
8. Print struk
9. Selesai!

---

## 📞 Troubleshooting & FAQ

### ❓ Lupa Password
**Solusi:**
1. Klik "Lupa password?" di login
2. Masukkan email terdaftar
3. Cek inbox email (atau folder spam)
4. Klik link reset (valid 1 jam)
5. Masukkan password baru
6. Login dengan password baru

### ❓ Kamera Scanner Tidak Muncul
**Cek:**
1. Browser support kamera? (Chrome/Safari recommended)
2. Izin kamera sudah granted?
3. HTTPS enabled? (http:// tidak support kamera)
4. Browser versi terbaru?

**Solusi:**
- Gunakan input manual/USB scanner
- Update browser
- Cek permission settings

### ❓ Stok Tidak Sesuai
**Kemungkinan:**
1. Transaksi belum diproses
2. Outlet yang dipilih berbeda
3. Ada transfer stok yang belum selesai

**Solusi:**
1. Refresh halaman
2. Cek outlet selection
3. Lakukan stok opname
4. Cek audit log untuk trace

### ❓ Printer Tidak Mau Print
**Cek:**
1. Printer terhubung ke jaringan?
2. Driver printer ter-install?
3. Paper ada?
4. Browser print settings?

**Solusi:**
- Download PDF dulu, print manual
- Restart printer
- Clear print queue
- Test print dari browser settings

### ❓ Transaksi Error
**Kemungkinan:**
1. Koneksi internet putus
2. Stok tidak cukup
3. Validation error

**Solusi:**
1. Cek koneksi internet
2. Reload page
3. Cek stok produk
4. Hubungi admin

---

## 🔄 Update & Maintenance

### Update Terbaru (16 Nov 2025)
- ✨ **Forgot Password Feature** - Reset password via email
- 📷 **Enhanced Barcode Scanner** - Visibility di mobile
- 🔧 **Role Management** - Ganti role user dari UI
- 🎨 **UI Improvements** - Font consistency, visual clarity
- 🐛 **Bug Fixes** - Recharts compatibility, performance optimization

### Scheduled Maintenance
- **Backup Database:** Setiap hari otomatis
- **Security Updates:** Bulanan
- **Feature Updates:** Sesuai kebutuhan
- **Performance Check:** Mingguan

### Roadmap Future
- 📧 Email struk otomatis ke customer
- 📊 Advanced analytics & BI
- 🔔 Push notifications
- 💳 Payment gateway integration
- 📱 Mobile app native (iOS/Android)
- 🌐 Multi-language support
- 🎁 Loyalty program
- 📦 Inventory forecasting

---

## 📄 Dokumentasi Teknis

Untuk developer dan technical team, tersedia dokumentasi tambahan:

1. **FORGOT_PASSWORD_SETUP.md** - Setup forgot password feature
2. **API Documentation** - tRPC endpoints
3. **Database Schema** - Supabase tables & relations
4. **Deployment Guide** - Vercel deployment steps
5. **Environment Variables** - Configuration setup

---

## 📞 Kontak Support

**Development Team:**
- **Email:** support@agdscorp.com
- **Phone:** +62 xxx-xxxx-xxxx
- **Working Hours:** Senin-Jumat, 09:00-17:00 WIB

**Emergency Support:**
- **WhatsApp:** +62 xxx-xxxx-xxxx (24/7)

---

## 📝 Notes Penting

### Untuk Client:
1. ✅ **Backup Data** rutin dilakukan otomatis
2. ✅ **Security** sudah enterprise-level
3. ✅ **Scalable** bisa handle ribuan transaksi
4. ✅ **Cloud-based** akses dari mana saja
5. ✅ **Support** tersedia untuk training & maintenance

### Untuk User:
1. ⚠️ **Jangan Share Password** dengan siapapun
2. ⚠️ **Logout** setelah selesai (khususnya di shared device)
3. ⚠️ **Report Bug** jika menemukan error
4. ⚠️ **Backup Struk** penting (download PDF)
5. ⚠️ **Update Browser** untuk performa optimal

---

## ✅ Kesimpulan

AGDS Corp POS adalah sistem kasir modern yang:
- 🚀 **Mudah digunakan** - Interface intuitif
- 🔒 **Aman** - Security enterprise-level
- 📱 **Responsive** - Desktop, tablet, mobile
- 📊 **Lengkap** - Semua fitur yang dibutuhkan
- ⚡ **Cepat** - Performance optimized
- 🔄 **Real-time** - Data sync instant
- 💰 **Efisien** - Hemat waktu & tenaga

**Cocok untuk:**
- Toko retail
- Minimarket
- Supermarket
- Franchise multi-outlet
- Bisnis F&B
- Dan bisnis retail lainnya

---

**Terima kasih telah menggunakan AGDS Corp POS!** 🙏

*Dokumentasi ini akan terus diperbarui seiring perkembangan sistem.*

**Version 1.0 - 16 November 2025**
