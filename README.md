# KalkuSim

Kalkulator batch berbasis rumus matematika yang bersih, terfokus, dan deterministik. KalkuSim dirancang untuk mahasiswa, insinyur, dan profesional yang perlu menghitung satu rumus dengan banyak set data tanpa membuka spreadsheet penuh.

Setiap rumus, simbol, dan nama variabel ditampilkan sebagai **notasi matematika sungguhan** melalui MathLive — bukan string bergaya kode.

---

## Daftar Isi

- [Fitur](#fitur)
- [Cara Menggunakan](#cara-menggunakan)
- [Tumpukan Teknologi](#tumpukan-teknologi)
- [Struktur Direktori](#struktur-direktori)
- [Cara Kerja Mesin Matematika](#cara-kerja-mesin-matematika)
- [Tipografi](#tipografi)
- [Menjalankan Proyek](#menjalankan-proyek)
- [Privasi dan Keamanan](#privasi-dan-keamanan)
- [Batasan yang Diketahui](#batasan-yang-diketahui)

---

## Fitur

### 1. Editor Rumus

- Editor visual MathLive untuk pecahan, pangkat, akar, kurung, fungsi trigonometri, dan konstanta.
- Mode input ganda: **Visual** (MathLive) dan **Teks** (ekspresi biasa).
- Validasi sintaks real-time dan deteksi variabel otomatis.
- Deteksi variabel output dari bentuk penugasan, misalnya `s = v0 * t + 0.5 * a * t^2`.
- Katalog simbol dan fungsi yang bisa dicari serta difilter berdasarkan kategori:
  aritmatika, pecahan, pangkat & akar, kurung, trigonometri, log & eksponen,
  dan konstanta. Fungsi matematika seperti `min`, `max`, `abs`, dan `round`
  dapat ditemukan melalui pencarian.
- Tombol undo, redo, dan bersihkan rumus pada mode visual.
- Pemilih mode sudut **Radian / Derajat** yang ringkas.

### 2. Tabel Variabel

- Variabel input terdeteksi otomatis dan variabel output dikeluarkan dari tabel.
- Tabel lapang untuk hingga **10 baris** data.
- Tambah, duplikasi, hapus, dan kosongkan baris.
- Validasi sel langsung: nilai kosong atau non-numerik ditandai jelas.
- Data tetap tersimpan saat kembali ke layar rumus untuk memperbaiki formula.

### 3. Hasil Perhitungan

- Tabel hasil per baris berisi nilai input, hasil terformat, dan status validasi.
- **Isolasi galat per baris**: satu baris gagal tidak menghentikan baris lain.
- Pesan error yang spesifik untuk nilai kosong, input non-numerik, pembagian nol, dan hasil `NaN`/`Infinity`.
- **Inspektor Presisi** untuk melihat nilai mentah presisi penuh dan menyalinnya.
- Ekspor hasil ke **CSV**.
- Salin tabel sebagai **TSV** untuk Notion, Google Sheets, atau Excel.
- Simpan hasil ke riwayat, hitung ulang, atau mulai perhitungan baru.

### 4. Riwayat

- Laci riwayat yang menyimpan rumus, input, hasil, mode sudut, dan waktu perhitungan.
- Buka kembali perhitungan lama atau hapus satu per satu.
- Kosongkan seluruh riwayat bila diperlukan.
- Empty state singkat: “Belum ada riwayat”.

---

## Cara Menggunakan

1. **Tulis rumus** di layar pertama. Gunakan editor visual atau mode teks.
   Contoh:
   - `s = v0 * t + 0.5 * a * t^2`
   - `Ek = 0.5 * m * v^2`
   - `c = sqrt(a^2 + b^2)`
2. Periksa umpan balik validasi. Jika valid, lanjut ke layar variabel.
3. **Isi nilai** untuk setiap variabel pada tabel. Tambahkan baris sesuai kebutuhan (maksimal 10).
4. Tekan **Hitung** untuk mengevaluasi semua baris.
5. Tinjau hasil, periksa presisi bila perlu, lalu **ekspor**, **salin**, atau **simpan ke riwayat**.

Aplikasi dimulai dengan rumus kosong dan tiga baris data kosong.

---

## Tumpukan Teknologi

| Teknologi | Peran |
| --- | --- |
| React 19 + TypeScript | Komponen antarmuka dan state yang type-safe |
| Vite 8 | Development server dan bundling produksi |
| Tailwind CSS v4 | Sistem warna, tipografi, dan layout |
| mathjs | Parsing AST, ekstraksi variabel, evaluasi deterministik, dan serialisasi LaTeX |
| MathLive | Editor matematika visual dan renderer notasi read-only |
| lucide-react | Ikon antarmuka |
| Vitest | Unit test untuk parser, konverter LaTeX, dan kalkulator |

---

## Struktur Direktori

```text
src/
├── types/
│   ├── index.ts                 # Model domain: FormulaAnalysis, BatchRow, RowResult, HistoryItem
│   └── mathlive.d.ts            # Definisi tipe untuk elemen kustom MathLive
├── engine/
│   ├── latexConverter.ts        # Konversi LaTeX ↔ mathjs dan serialisasi AST ke LaTeX tampilan
│   ├── formulaParser.ts         # Validasi rumus, deteksi output, dan ekstraksi variabel
│   ├── calculator.ts            # Evaluasi batch independen per baris dan pemformatan hasil
│   ├── mathConstants.ts         # Fungsi/konstanta yang didukung dan katalog simbol
│   └── __tests__/
│       ├── latexConverter.test.ts
│       ├── formulaParser.test.ts
│       └── calculator.test.ts
├── components/
│   ├── common/
│   │   ├── Header.tsx           # Header minimalis: brand dan akses riwayat
│   │   ├── FormulaDisplay.tsx   # Renderer MathLive untuk rumus, math inline, dan variabel
│   │   └── HistoryDrawer.tsx    # Laci riwayat perhitungan
│   ├── screen1/
│   │   ├── FormulaScreen.tsx    # Layar editor rumus
│   │   ├── MathLiveEditor.tsx   # Editor visual/teks dengan kontrol rumus
│   │   └── SymbolPalette.tsx    # Katalog simbol dengan pencarian dan kategori
│   ├── screen2/
│   │   ├── VariableScreen.tsx   # Layar input variabel
│   │   └── VariableTable.tsx    # Tabel data hingga 10 baris
│   └── screen3/
│       ├── ResultsScreen.tsx    # Ringkasan hasil dan aksi simpan/navigasi
│       ├── ResultsTable.tsx     # Tabel hasil, ekspor CSV, salin TSV
│       └── PrecisionInspector.tsx # Modal presisi penuh
├── App.tsx                      # State global, navigasi langkah, dan persistensi riwayat
├── index.css                    # Tailwind, tema, dan gaya MathLive
└── main.tsx                     # Entry point React
```

---

## Cara Kerja Mesin Matematika

KalkuSim tidak menggunakan `eval()` atau `Function()`.

1. **Input** diterima sebagai LaTeX dari MathLive atau sebagai teks biasa.
2. **Konversi** LaTeX ke ekspresi mathjs dilakukan oleh `latexToMathjs()`.
3. **Parsing** memakai `mathjs.parse()` untuk membentuk AST.
4. **Ekstraksi variabel** dilakukan dengan menelusuri AST:
   - konstanta seperti `pi`, `e`, dan `tau` diabaikan;
   - fungsi seperti `sin`, `sqrt`, dan `log` diabaikan;
   - variabel output di sisi kiri `=` dikeluarkan dari daftar input.
5. **Evaluasi** memakai `mathjs.evaluate()` dengan scope terkontrol. Mode derajat
   menggunakan pembungkus trigonometri deterministik, bukan perubahan konfigurasi global.
6. **Tampilan** LaTeX dihasilkan dari AST melalui `toTex()`, lalu dirender oleh MathLive.
   Jalur tampilan ini terpisah dari jalur evaluasi sehingga tidak mengubah hasil hitung.

Hasil diformat hingga maksimal 8 angka desimal, memakai notasi ilmiah untuk nilai sangat
besar/kecil, dan mendukung bilangan kompleks serta `NaN`/`Infinity`.

### Aturan penamaan

- Nama variabel harus diawali huruf atau garis bawah, diikuti huruf, angka, atau garis bawah.
- Hanya boleh ada satu tanda `=` dalam rumus.
- Konstanta bawaan tidak dapat dipakai sebagai variabel output.
- Contoh valid: `s = v0 * t + 0.5 * a * t^2`, `E_k = 0.5 * m * v^2`.

---

## Tipografi

- **DM Sans** adalah typeface antarmuka aktif, dimuat dari Google Fonts dengan fallback
  `system-ui`.
- **Codec Pro tidak disertakan** karena tidak ada berkas `CodecPro-*.woff2` di
  `public/fonts/`. Deklarasi `@font-face`-nya dihapus agar browser tidak meminta font
  yang tidak ada.
- **Matematika tidak memakai monospace.** Rumus, simbol, dan nama variabel dirender oleh
  MathLive agar subscript, superscript, pecahan, dan akar tetap terbaca.
- Monospace hanya dipakai untuk nilai presisi mentah di Inspektor Presisi dan potongan
  kode pendek, bukan untuk ekspresi matematika utama.

Jika Codec Pro ingin diaktifkan nanti:

1. Letakkan `CodecPro-Regular.woff2`, `CodecPro-Medium.woff2`, `CodecPro-SemiBold.woff2`,
   dan `CodecPro-Bold.woff2` di `public/fonts/`.
2. Daftarkan kembali `@font-face` di `src/index.css`.
3. Letakkan `'Codec Pro'` di depan `--font-sans` dan `--notion-font-sans`.

---

## Menjalankan Proyek

### Prasyarat

- Node.js 20.19+ atau 22.12+ (sesuai kebutuhan Vite 8)
- npm

### Instalasi

```bash
npm install
```

### Development

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173).

### Build Produksi

```bash
npm run build
```

Hasil build berada di `dist/`.

### Pratinjau Build

```bash
npm run preview
```

### Unit Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

---

## Privasi dan Keamanan

- Tidak ada backend, tidak ada akun, dan tidak ada API AI.
- Riwayat disimpan di `localStorage` browser dengan kunci `calcbatch_history_v1`.
- Semua perhitungan berjalan di sisi klien.
- Ekspresi tidak pernah dieksekusi sebagai JavaScript; mathjs hanya mem-parsing dan
  mengevaluasi AST matematika dalam scope terbatas.
- Menghapus data situs di browser akan menghapus riwayat perhitungan.

---

## Batasan yang Diketahui

- Maksimal **10 baris** data per perhitungan.
- Setiap variabel harus berupa nilai numerik; input teks ditolak dengan pesan validasi.
- Rumus hanya mendukung satu persamaan dengan satu tanda `=`.
- Katalog simbol dan tabel menggunakan banyak elemen MathLive inline; pada perangkat
  sangat lambat, membuka katalog atau tabel besar dapat terasa lebih berat.
- Bundle produksi masih berupa satu chunk besar. Peringatan ukuran chunk dari Vite
  bersifat informatif dan dapat diatasi nanti dengan code splitting.
- Google Fonts memerlukan koneksi internet saat pertama kali dimuat; setelah itu browser
  dapat memakai cache. Fallback sistem tetap membuat aplikasi dapat digunakan offline.
- Aplikasi mengutamakan keyboard dan layar desktop, tetapi layout tabel dan navigasi
  sudah responsif untuk layar kecil.
