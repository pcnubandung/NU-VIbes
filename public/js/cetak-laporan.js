// Cetak Laporan Neraca
window.cetakLaporanNeraca = async function(periode, tahun, bulan, tanggal) {
  try {
    const info = await API.get('/api/koperasi-info');
    const simpanan = await API.get('/api/simpanan/pokok');
    const wajib = await API.get('/api/simpanan/wajib');
    const khusus = await API.get('/api/simpanan/khusus');
    const sukarela = await API.get('/api/simpanan/sukarela');
    const penjualan = await API.get('/api/transaksi/penjualan');
    const pengeluaran = await API.get('/api/transaksi/pengeluaran');
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    
    // Filter simpanan by periode
    let filteredSimpanan = simpanan;
    let filteredWajib = wajib;
    let filteredKhusus = khusus;
    let filteredSukarela = sukarela;
    
    if (periode === 'harian' && tanggal) {
      filteredSimpanan = simpanan.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
      filteredWajib = wajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
      filteredKhusus = khusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
      filteredSukarela = sukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
    } else if (periode === 'bulanan' && bulan) {
      filteredSimpanan = simpanan.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredWajib = wajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredKhusus = khusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredSukarela = sukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
    } else if (periode === 'tahunan') {
      filteredSimpanan = simpanan.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredWajib = wajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredKhusus = khusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      filteredSukarela = sukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
    }
    
    // Calculate simpanan sukarela with setoran (+) and penarikan (-)
    const totalSukarelaSetoran = filteredSukarela
      .filter(s => s.jenis === 'Setoran')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    const totalSukarelaPenarikan = filteredSukarela
      .filter(s => s.jenis === 'Penarikan')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    const totalSukarela = totalSukarelaSetoran - totalSukarelaPenarikan;
    
    const totalSimpananPokok = filteredSimpanan.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    const totalSimpananWajib = filteredWajib.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    const totalSimpananKhusus = filteredKhusus.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    const totalSimpanan = totalSimpananPokok + totalSimpananWajib + totalSimpananKhusus + totalSukarela;
    
    // Filter transaksi by periode
    let filteredPenjualan = penjualan;
    let filteredPengeluaran = pengeluaran;
    let filteredPendapatanLain = pendapatanLain;
    
    if (periode === 'harian' && tanggal) {
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
    } else if (periode === 'bulanan' && bulan) {
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
    } else if (periode === 'tahunan') {
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
    }
    
    const totalPenjualan = filteredPenjualan.reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
    const totalHPP = filteredPenjualan.reduce((sum, item) => sum + parseFloat(item.hpp || 0), 0);
    const totalPendapatanLain = filteredPendapatanLain.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    // Hitung Biaya Operasional (exclude Pembelian Barang dan Aset)
    const biayaOperasional = filteredPengeluaran
      .filter(p => p.kategori !== 'Pembelian Barang' && p.kategori !== 'Pembelian Aset & Inventaris' && p.kategori !== 'Pembelian Aset')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    const totalPendapatan = totalPenjualan + totalPendapatanLain;
    const labaKotor = totalPendapatan - totalHPP;
    const labaBersih = labaKotor - biayaOperasional;
    
    // Hitung Pembelian Barang dan Pembelian Aset dari Pengeluaran
    const pembelianBarang = filteredPengeluaran
      .filter(p => p.kategori === 'Pembelian Barang')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    const pembelianAset = filteredPengeluaran
      .filter(p => p.kategori === 'Pembelian Aset & Inventaris' || p.kategori === 'Pembelian Aset')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    const penjualanBarang = filteredPenjualan
      .filter(p => p.kategori === 'Barang' || !p.kategori)
      .reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
    
    const hppBarang = filteredPenjualan
      .filter(p => p.kategori === 'Barang' || !p.kategori)
      .reduce((sum, item) => sum + parseFloat(item.hpp || 0), 0);
    
    const penjualanAset = filteredPenjualan
      .filter(p => p.kategori === 'Aset')
      .reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
    
    // AKTIVA
    const persediaan = pembelianBarang - hppBarang;
    const aktivaTetap = pembelianAset - penjualanAset;
    
    const kasBank = totalSimpanan + labaBersih - persediaan - aktivaTetap;
    const totalAktiva = kasBank + persediaan + aktivaTetap;
    
    // PASIVA
    let cadangan = 0;
    const shuTahunBerjalan = labaBersih;
    const totalPasiva = totalSimpananPokok + totalSimpananWajib + totalSimpananKhusus + totalSukarela + cadangan + shuTahunBerjalan;
    
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
        <title>Neraca - ${info.nama_koperasi || 'Koperasi'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h2 { margin: 5px 0; }
          .header p { margin: 3px 0; font-size: 14px; }
          .periode { text-align: center; margin-bottom: 20px; font-size: 14px; color: #666; }
          .neraca-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2E7D32; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .total-row { background-color: #f8f9fa !important; font-weight: bold; }
          .text-right { text-align: right; }
          .section-title { background-color: #2E7D32; color: white; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 10px; border-radius: 5px; }
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
          <h3 style="margin-top: 15px;">NERACA</h3>
        </div>
        
        <div class="periode">
          <strong>Per ${periodeText}</strong>
        </div>
        
        <div class="neraca-container">
          <div>
            <div class="section-title">AKTIVA</div>
            <table>
              <tbody>
                <tr>
                  <td>Kas & Bank</td>
                  <td class="text-right">${formatCurrency(kasBank)}</td>
                </tr>
                <tr>
                  <td>Persediaan</td>
                  <td class="text-right">${formatCurrency(persediaan)}</td>
                </tr>
                <tr>
                  <td>Aktiva Tetap</td>
                  <td class="text-right">${formatCurrency(aktivaTetap)}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>TOTAL AKTIVA</strong></td>
                  <td class="text-right"><strong>${formatCurrency(totalAktiva)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <div class="section-title">PASIVA</div>
            <table>
              <tbody>
                <tr>
                  <td>Simpanan Pokok</td>
                  <td class="text-right">${formatCurrency(totalSimpananPokok)}</td>
                </tr>
                <tr>
                  <td>Simpanan Wajib</td>
                  <td class="text-right">${formatCurrency(totalSimpananWajib)}</td>
                </tr>
                <tr>
                  <td>Simpanan Khusus</td>
                  <td class="text-right">${formatCurrency(totalSimpananKhusus)}</td>
                </tr>
                <tr>
                  <td>Simpanan Sukarela</td>
                  <td class="text-right">${formatCurrency(totalSukarela)}</td>
                </tr>
                <tr>
                  <td>Cadangan</td>
                  <td class="text-right">${formatCurrency(cadangan)}</td>
                </tr>
                <tr>
                  <td>SHU Tahun Berjalan</td>
                  <td class="text-right">${formatCurrency(shuTahunBerjalan)}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>TOTAL PASIVA</strong></td>
                  <td class="text-right"><strong>${formatCurrency(totalPasiva)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
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

