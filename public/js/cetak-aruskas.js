// Cetak Laporan Arus Kas
window.cetakLaporanArusKas = async function(periode, tahun, bulan, tanggal) {
  try {
    const info = await API.get('/api/koperasi-info');
    const simpananPokok = await API.get('/api/simpanan/pokok');
    const simpananWajib = await API.get('/api/simpanan/wajib');
    const simpananKhusus = await API.get('/api/simpanan/khusus');
    const simpananSukarela = await API.get('/api/simpanan/sukarela');
    const penjualan = await API.get('/api/transaksi/penjualan');
    const pengeluaran = await API.get('/api/transaksi/pengeluaran');
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    
    // Filter by periode
    let filteredSimpananPokok = simpananPokok;
    let filteredSimpananWajib = simpananWajib;
    let filteredSimpananKhusus = simpananKhusus;
    let filteredSimpananSukarela = simpananSukarela;
    let filteredPenjualan = penjualan;
    let filteredPengeluaran = pengeluaran;
    let filteredPendapatanLain = pendapatanLain;
    
    if (periode === 'harian' && tanggal) {
      filteredSimpananPokok = simpananPokok.filter(s => s.tanggal_transaksi === tanggal);
      filteredSimpananWajib = simpananWajib.filter(s => s.tanggal_transaksi === tanggal);
      filteredSimpananKhusus = simpananKhusus.filter(s => s.tanggal_transaksi === tanggal);
      filteredSimpananSukarela = simpananSukarela.filter(s => s.tanggal_transaksi === tanggal);
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi === tanggal);
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi === tanggal);
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi === tanggal);
    } else if (periode === 'bulanan' && bulan) {
      filteredSimpananPokok = simpananPokok.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredSimpananWajib = simpananWajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredSimpananKhusus = simpananKhusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredSimpananSukarela = simpananSukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
    } else if (periode === 'tahunan') {
      filteredSimpananPokok = simpananPokok.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredSimpananWajib = simpananWajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredSimpananKhusus = simpananKhusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredSimpananSukarela = simpananSukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
    }
    
    // AKTIVITAS OPERASIONAL
    const penerimaanPenjualan = filteredPenjualan.reduce((sum, p) => sum + parseFloat(p.jumlah_penjualan || 0), 0);
    const penerimaanPendapatanLain = filteredPendapatanLain.reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
    const pembayaranBiayaOperasional = filteredPengeluaran
      .filter(p => p.kategori !== 'Pembelian Barang' && p.kategori !== 'Pembelian Aset & Inventaris' && p.kategori !== 'Pembelian Aset')
      .reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
    
    const pembayaranHPP = filteredPenjualan.reduce((sum, p) => sum + parseFloat(p.hpp || 0), 0);
    const kasOperasional = penerimaanPenjualan + penerimaanPendapatanLain - pembayaranBiayaOperasional - pembayaranHPP;
    
    // AKTIVITAS INVESTASI
    const pembelianBarang = filteredPengeluaran
      .filter(p => p.kategori === 'Pembelian Barang')
      .reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
    
    const hppBarang = filteredPenjualan
      .filter(p => p.kategori === 'Barang' || !p.kategori)
      .reduce((sum, p) => sum + parseFloat(p.hpp || 0), 0);
    
    const persediaanBarang = pembelianBarang - hppBarang;
    
    const pembelianAset = filteredPengeluaran
      .filter(p => p.kategori === 'Pembelian Aset & Inventaris' || p.kategori === 'Pembelian Aset')
      .reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
    
    const kasInvestasi = -(persediaanBarang + pembelianAset);
    
    // AKTIVITAS PENDANAAN
    const penerimaanSimpananPokok = filteredSimpananPokok.reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
    const penerimaanSimpananWajib = filteredSimpananWajib.reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
    const penerimaanSimpananKhusus = filteredSimpananKhusus.reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
    
    const setoran = filteredSimpananSukarela.filter(s => s.jenis === 'Setoran').reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
    const penarikan = filteredSimpananSukarela.filter(s => s.jenis === 'Penarikan').reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
    const penerimaanSimpananSukarela = setoran - penarikan;
    
    const kasPendanaan = penerimaanSimpananPokok + penerimaanSimpananWajib + penerimaanSimpananKhusus + penerimaanSimpananSukarela;
    
    // TOTAL KAS
    const kenaikanKas = kasOperasional + kasInvestasi + kasPendanaan;
    const kasAwal = 0;
    const kasAkhir = kasAwal + kenaikanKas;
    
    // Format periode untuk tampilan
    let periodeText = '';
    if (periode === 'harian' && tanggal) {
      const date = new Date(tanggal);
      const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      periodeText = `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
    } else if (periode === 'bulanan' && bulan) {
      const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      periodeText = `${namaBulan[parseInt(bulan) - 1]} ${tahun}`;
    } else if (periode === 'tahunan') {
      periodeText = `Tahun ${tahun}`;
    } else {
      periodeText = `Semua Periode`;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Arus Kas - ${info.nama_koperasi || 'Koperasi'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h2 { margin: 5px 0; }
          .header p { margin: 3px 0; font-size: 14px; }
          .periode { text-align: center; margin-bottom: 20px; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2E7D32; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .section-operasional { background-color: #e3f2fd !important; font-weight: bold; }
          .section-investasi { background-color: #e8f5e9 !important; font-weight: bold; }
          .section-pendanaan { background-color: #fce4ec !important; font-weight: bold; }
          .section-total { background-color: #fff3e0 !important; font-weight: bold; }
          .section-result { background-color: #f5f5f5 !important; font-weight: bold; font-size: 14px; }
          .section-final { background-color: #e8f5e9 !important; font-weight: bold; font-size: 14px; }
          .indent { padding-left: 20px !important; }
          .indent-sub { padding-left: 40px !important; font-style: italic; }
          .text-right { text-align: right; }
          .text-red { color: #d32f2f; }
          .text-green { color: #2e7d32; }
          .footer { margin-top: 30px; font-size: 12px; text-align: right; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${info.nama_koperasi || 'Koperasi'}</h2>
          <p>${info.alamat || ''}</p>
          <p>Telp: ${info.nomor_telpon || '-'} | Email: ${info.email || '-'}</p>
          <h3 style="margin-top: 15px;">LAPORAN ARUS KAS</h3>
        </div>
        
        <div class="periode">
          <strong>Periode ${periodeText}</strong>
        </div>
        
        <table>
          <tbody>
            <!-- AKTIVITAS OPERASIONAL -->
            <tr class="section-operasional">
              <td colspan="2"><strong>AKTIVITAS OPERASIONAL</strong></td>
            </tr>
            <tr>
              <td class="indent">Penerimaan dari Penjualan</td>
              <td class="text-right">${formatCurrency(penerimaanPenjualan)}</td>
            </tr>
            <tr>
              <td class="indent">Penerimaan Pendapatan Lain</td>
              <td class="text-right">${formatCurrency(penerimaanPendapatanLain)}</td>
            </tr>
            <tr>
              <td class="indent">Pembayaran untuk HPP</td>
              <td class="text-right text-red">(${formatCurrency(pembayaranHPP)})</td>
            </tr>
            <tr>
              <td class="indent">Pembayaran Biaya Operasional</td>
              <td class="text-right text-red">(${formatCurrency(pembayaranBiayaOperasional)})</td>
            </tr>
            <tr class="section-total">
              <td class="indent-sub"><strong>Kas Bersih dari Aktivitas Operasional</strong></td>
              <td class="text-right ${kasOperasional >= 0 ? 'text-green' : 'text-red'}"><strong>${formatCurrency(kasOperasional)}</strong></td>
            </tr>
            
            <!-- AKTIVITAS INVESTASI -->
            <tr class="section-investasi">
              <td colspan="2"><strong>AKTIVITAS INVESTASI</strong></td>
            </tr>
            <tr>
              <td class="indent">Pembelian Barang</td>
              <td class="text-right text-red">(${formatCurrency(pembelianBarang)})</td>
            </tr>
            <tr>
              <td class="indent-sub">Dikurangi: HPP Barang Terjual</td>
              <td class="text-right text-green">${formatCurrency(hppBarang)}</td>
            </tr>
            <tr>
              <td class="indent-sub">Persediaan Barang</td>
              <td class="text-right text-red">(${formatCurrency(persediaanBarang)})</td>
            </tr>
            <tr>
              <td class="indent">Pembelian Aset Tetap</td>
              <td class="text-right text-red">(${formatCurrency(pembelianAset)})</td>
            </tr>
            <tr class="section-total">
              <td class="indent-sub"><strong>Kas Bersih dari Aktivitas Investasi</strong></td>
              <td class="text-right ${kasInvestasi >= 0 ? 'text-green' : 'text-red'}"><strong>${formatCurrency(kasInvestasi)}</strong></td>
            </tr>
            
            <!-- AKTIVITAS PENDANAAN -->
            <tr class="section-pendanaan">
              <td colspan="2"><strong>AKTIVITAS PENDANAAN</strong></td>
            </tr>
            <tr>
              <td class="indent">Penerimaan Simpanan Pokok</td>
              <td class="text-right">${formatCurrency(penerimaanSimpananPokok)}</td>
            </tr>
            <tr>
              <td class="indent">Penerimaan Simpanan Wajib</td>
              <td class="text-right">${formatCurrency(penerimaanSimpananWajib)}</td>
            </tr>
            <tr>
              <td class="indent">Penerimaan Simpanan Khusus</td>
              <td class="text-right">${formatCurrency(penerimaanSimpananKhusus)}</td>
            </tr>
            <tr>
              <td class="indent">Penerimaan Simpanan Sukarela (Bersih)</td>
              <td class="text-right ${penerimaanSimpananSukarela < 0 ? 'text-red' : ''}">${penerimaanSimpananSukarela >= 0 ? formatCurrency(penerimaanSimpananSukarela) : '(' + formatCurrency(Math.abs(penerimaanSimpananSukarela)) + ')'}</td>
            </tr>
            <tr class="section-total">
              <td class="indent-sub"><strong>Kas Bersih dari Aktivitas Pendanaan</strong></td>
              <td class="text-right ${kasPendanaan >= 0 ? 'text-green' : 'text-red'}"><strong>${formatCurrency(kasPendanaan)}</strong></td>
            </tr>
            
            <!-- TOTAL -->
            <tr class="section-result">
              <td><strong>KENAIKAN (PENURUNAN) KAS</strong></td>
              <td class="text-right ${kenaikanKas >= 0 ? 'text-green' : 'text-red'}"><strong>${formatCurrency(kenaikanKas)}</strong></td>
            </tr>
            <tr>
              <td><strong>KAS AWAL PERIODE</strong></td>
              <td class="text-right"><strong>${formatCurrency(kasAwal)}</strong></td>
            </tr>
            <tr class="section-final">
              <td><strong>KAS AKHIR PERIODE</strong></td>
              <td class="text-right text-green"><strong>${formatCurrency(kasAkhir)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2E7D32; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Dokumen
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

