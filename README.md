# Pertamina SPBU POS & Thermal Receipt Engine

Aplikasi POS Kasir SPBU Pertamina dengan pencetakan struk thermal 58mm/80mm (ESC/POS), kalkulator dua arah Liter & Rupiah, manajemen nozzle, shift operator, riwayat transaksi, dan kustomisasi logo struk (upload galeri/preset).

---

## Panduan Deploy ke Vercel

Aplikasi ini sudah dilengkapi dengan konfigurasi `vercel.json` untuk SPA Vite.

### Cara 1: Menggunakan Vercel Dashboard (Rekomendasi)
1. Push kode repository ke GitHub / GitLab / Bitbucket.
2. Buka [Vercel Dashboard](https://vercel.com/new) dan klik **Add New Project**.
3. Import repository proyek ini.
4. Vercel akan otomatis mendeteksi konfigurasi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**. Selesai!

### Cara 2: Menggunakan Vercel CLI
```bash
npm install -g vercel
vercel
# Untuk production:
vercel --prod
```

---

## Panduan Deploy ke Cloudflare Pages

Aplikasi ini sudah dilengkapi dengan file `public/_redirects` dan `public/_headers` untuk routing SPA dan caching aset.

### Cara 1: Menggunakan Cloudflare Dashboard (Git Integration)
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Pilih repository Anda.
3. Pada bagian **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (kosongkan atau isi `/`)
4. Klik **Save and Deploy**. Selesai!

### Cara 2: Menggunakan Wrangler CLI (Direct Deploy)
```bash
npm run build
npx wrangler pages deploy dist --project-name=pertamina-spbu-pos
```

---

## Fitur Aplikasi
- **Buat Struk**: Nozzle 01–06, Pertamax, Pertalite, Turbo, Dexlite, Pertamina Dex, Biosolar.
- **Kalkulator Auto-Sync**: Nominal Rupiah $\leftrightarrow$ Volume Liter otomatis sinkron.
- **Preview & Cetak**: Kertas 58mm/80mm realistis dengan tepi zig-zag, font thermal ESC/POS, density setting, dan barcode.
- **Riwayat Struk**: Filter shift, pencarian plat nomor kendaraan, dan rekap tutup buku shift.
- **Pengaturan & Upload Logo**: Upload logo kustom dari galeri/file, pilih dari preset SPBU, serta atur ukuran dan efek monokrom thermal.
- **Manajemen Tarif BBM & Identitas SPBU**: Tarif dan alamat SPBU tersimpan di `localStorage`.
