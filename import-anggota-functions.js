// Import Anggota dari Excel
window.importAnggota = async function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h3 class="modal-title">Import Data Anggota dari Excel</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="alert alert-info" style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #1976d2;">
            <i data-feather="info"></i> Panduan Import Excel
          </h4>
          <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Download template Excel terlebih dahulu</li>
            <li>Isi data anggota sesuai kolom yang tersedia</li>
            <li>Kolom wajib: <strong>Nomor Anggota</strong> dan <strong>Nama Lengkap</strong></li>
            <li>Format tanggal: <strong>YYYY-MM-DD</strong> (contoh: 2024-01-15)</li>
            <li>Status: <strong>aktif</strong> atau <strong>nonaktif</strong></li>
            <li>Password default: <strong>nomor anggota</strong></li>
            <li>Upload file Excel yang sudah diisi</li>
          </ol>
        </div>
        
        <div style="margin-bottom: 20px;">
          <button class="btn btn-success" onclick="downloadTemplateAnggota()" style="width: 100%;">
            <i data-feather="download"></i> Download Template Excel
          </button>
        </div>
        
        <form id="formImportAnggota" enctype="multipart/form-data">
          <div class="form-group">
            <label>Upload File Excel *</label>
            <input type="file" name="file" accept=".xlsx,.xls" required>
            <small style="color: #666;">Format: .xlsx atau .xls</small>
          </div>
          
          <div class="btn-group">
            <button type="submit" class="btn btn-primary">
              <i data-feather="upload"></i> Import Data
            </button>
            <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">
              <i data-feather="x"></i> Batal
            </button>
          </div>
        </form>
        
        <div id="importProgress" style="display: none; margin-top: 20px;">
          <div style="text-align: center; padding: 20px;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #2E7D32; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
            <p>Sedang mengimport data...</p>
          </div>
        </div>
        
        <div id="importResult" style="display: none; margin-top: 20px;"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
  
  document.getElementById('formImportAnggota').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const progressDiv = document.getElementById('importProgress');
    const resultDiv = document.getElementById('importResult');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
      progressDiv.style.display = 'block';
      resultDiv.style.display = 'none';
      submitBtn.disabled = true;
      
      const response = await fetch('/api/anggota/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      progressDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      
      if (response.ok) {
        let errorHtml = '';
        if (result.results.errors.length > 0) {
          const errorList = result.results.errors.map(err => `<li>${err}</li>`).join('');
          errorHtml = `
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: #d32f2f;">Detail Error (${result.results.errors.length})</summary>
              <ul style="margin: 10px 0 0 20px; max-height: 200px; overflow-y: auto;">
                ${errorList}
              </ul>
            </details>
          `;
        }
        
        resultDiv.innerHTML = `
          <div class="alert alert-success" style="padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #2e7d32;">
              <i data-feather="check-circle"></i> Import Berhasil!
            </h4>
            <p style="margin: 0 0 10px 0;"><strong>Berhasil:</strong> ${result.results.success} anggota</p>
            <p style="margin: 0;"><strong>Gagal:</strong> ${result.results.failed} anggota</p>
            ${errorHtml}
          </div>
        `;
        feather.replace();
        
        // Refresh data anggota
        setTimeout(() => {
          modal.remove();
          renderDataAnggota();
        }, 3000);
      } else {
        resultDiv.innerHTML = `
          <div class="alert alert-danger" style="padding: 15px; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #c62828;">
              <i data-feather="x-circle"></i> Import Gagal
            </h4>
            <p style="margin: 0;">${result.error}</p>
          </div>
        `;
        feather.replace();
      }
    } catch (error) {
      progressDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div class="alert alert-danger" style="padding: 15px; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #c62828;">
            <i data-feather="x-circle"></i> Terjadi Kesalahan
          </h4>
          <p style="margin: 0;">${error.message}</p>
        </div>
      `;
      feather.replace();
    } finally {
      submitBtn.disabled = false;
    }
  });
};

// Download Template Excel Anggota
window.downloadTemplateAnggota = async function() {
  try {
    const response = await fetch('/api/anggota/template', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Import_Anggota.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Gagal mendownload template');
    }
  } catch (error) {
    alert('Terjadi kesalahan: ' + error.message);
  }
};
