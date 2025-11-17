# Patch Manual untuk Filter Transaksi

Karena kompleksitas integrasi, berikut adalah patch manual yang perlu dilakukan:

## Status Saat Ini:
✅ Filter Simpanan - SUDAH BERFUNGSI (di pages.js)
✅ Filter Penjualan - SUDAH DITAMBAHKAN (di pages-transaksi.js)
✅ Filter Pengeluaran - SUDAH DITAMBAHKAN (di pages-transaksi.js)
⏳ Filter Partisipasi Anggota - PERLU DITAMBAHKAN
⏳ Filter Pendapatan Lain - PERLU DITAMBAHKAN

## Cara Kerja Filter:

Filter sudah dibuat di file `public/js/transaksi-filters.js` dengan fungsi:
- `renderPenjualanWithFilter()` - untuk penjualan
- `renderPengeluaranWithFilter()` - untuk pengeluaran  
- `renderPendapatanLainWithFilter()` - untuk pendapatan lain

Fungsi-fungsi ini sudah terintegrasi dengan:
- `renderPenjualan()` di pages-transaksi.js ✅
- `renderPengeluaran()` di pages-transaksi.js ✅

## Yang Perlu Dilakukan:

### 1. Untuk Pendapatan Lain:
Cari fungsi `window.renderPendapatanLain` di `pages-transaksi.js` atau `pages.js`
Tambahkan kode berikut di awal fungsi:

```javascript
// Use filter if available
let filteredData = pendapatanLain;
if (typeof window.renderPendapatanLainWithFilter === 'function') {
  await window.renderPendapatanLainWithFilter();
  filteredData = typeof filterPendapatanLainData === 'function' ? 
    filterPendapatanLainData(allPendapatanLainData) : pendapatanLain;
}

// Get filter section
let filterSection = '';
if (typeof window.renderPendapatanLainWithFilter === 'function') {
  const result = renderPendapatanLainTable();
  if (result && result.filterSection) {
    filterSection = `<div class="card-body">${result.filterSection}</div>`;
    filteredData = result.filtered;
  }
}
```

Lalu tambahkan `${filterSection}` setelah card-header dan ganti `pendapatanLain.map` dengan `filteredData.map`

### 2. Untuk Partisipasi Anggota:
Tambahkan filter section manual di HTML:

```javascript
${filterSection || `
  <div class="card-body">
    <div class="filter-section">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i data-feather="filter"></i>
        <label>Filter:</label>
      </div>
      <input type="date" id="filterTanggalDari" placeholder="Dari Tanggal">
      <input type="date" id="filterTanggalSampai" placeholder="Sampai Tanggal">
      <button class="btn btn-warning" onclick="resetPartisipasiFilter()">
        <i data-feather="refresh-cw"></i> Reset
      </button>
    </div>
  </div>
`}
```

## Alternatif Sederhana:

Jika terlalu kompleks, gunakan filter sederhana dengan JavaScript di browser console:

```javascript
// Filter by date range
function filterByDate(data, dari, sampai) {
  return data.filter(item => {
    const tanggal = item.tanggal_transaksi;
    return (!dari || tanggal >= dari) && (!sampai || tanggal <= sampai);
  });
}
```

## Testing:

1. Buka menu "Hasil Penjualan" - Filter HARUS muncul ✅
2. Buka menu "Pengeluaran" - Filter HARUS muncul ✅
3. Buka menu "Pendapatan Lain" - Filter perlu ditambahkan manual
4. Buka menu "Partisipasi Anggota" - Filter perlu ditambahkan manual

## Catatan:

File `transaksi-filters.js` sudah di-include di `index.html`, jadi fungsi-fungsinya tersedia global.
Tinggal memanggil fungsi yang sesuai di setiap render function.

Jika masih ada masalah, cek console browser untuk error JavaScript.
