# Panduan Hosting Aplikasi Koperasi

## Bisa di-Hosting? ✅ YA!

Aplikasi manajemen koperasi ini adalah aplikasi **Node.js** yang bisa di-hosting di berbagai platform hosting.

## Pilihan Platform Hosting

### 1. **VPS (Virtual Private Server)** ⭐ RECOMMENDED
Platform: DigitalOcean, Vultr, Linode, AWS EC2, Google Cloud, Azure

**Kelebihan:**
- Full control server
- Bisa install apapun
- Performa tinggi
- Cocok untuk produksi

**Harga:** Mulai dari $5-10/bulan

**Cocok untuk:** Koperasi dengan banyak anggota (50+ anggota)

---

### 2. **Shared Hosting dengan Node.js Support**
Platform: Hostinger, Niagahoster, Rumahweb (yang support Node.js)

**Kelebihan:**
- Murah
- Mudah dikelola
- cPanel tersedia

**Kekurangan:**
- Tidak semua shared hosting support Node.js
- Performa terbatas

**Harga:** Mulai dari Rp 20.000-50.000/bulan

**Cocok untuk:** Koperasi kecil (< 50 anggota)

---

### 3. **Platform as a Service (PaaS)**
Platform: Heroku, Railway, Render, Vercel (backend), Fly.io

**Kelebihan:**
- Mudah deploy
- Auto-scaling
- Free tier tersedia

**Kekurangan:**
- Database terpisah
- Biaya bisa mahal jika traffic tinggi

**Harga:** Free - $7/bulan (tier dasar)

**Cocok untuk:** Testing atau koperasi kecil

---

### 4. **Hosting Lokal (On-Premise)**
Platform: Server sendiri di kantor koperasi

**Kelebihan:**
- Data di kontrol sendiri
- Tidak ada biaya bulanan
- Akses cepat di jaringan lokal

**Kekurangan:**
- Perlu maintenance sendiri
- Perlu IP publik untuk akses dari luar
- Listrik & internet harus stabil

**Harga:** Biaya hardware + listrik + internet

**Cocok untuk:** Koperasi yang ingin data di server sendiri

---

## Panduan Deploy ke VPS (Recommended)

### Persiapan

**1. Beli VPS**
- RAM minimal: 1GB
- Storage: 20GB
- OS: Ubuntu 20.04 atau 22.04 LTS

**2. Domain (Opsional tapi Recommended)**
- Beli domain (contoh: koperasi-sejahtera.com)
- Arahkan DNS ke IP VPS

### Langkah-langkah Deploy

#### Step 1: Koneksi ke VPS
```bash
ssh root@IP_VPS_ANDA
```

#### Step 2: Update System
```bash
apt update && apt upgrade -y
```

#### Step 3: Install Node.js
```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verifikasi
node -v
npm -v
```

#### Step 4: Install PM2 (Process Manager)
```bash
npm install -g pm2
```

#### Step 5: Upload Aplikasi

**Opsi A: Menggunakan Git (Recommended)**
```bash
# Install git
apt install -y git

# Clone repository (jika sudah di GitHub)
cd /var/www
git clone https://github.com/username/koperasi-app.git
cd koperasi-app

# Install dependencies
npm install
```

**Opsi B: Upload Manual via FTP/SFTP**
- Gunakan FileZilla atau WinSCP
- Upload semua file ke `/var/www/koperasi-app`
- Jalankan `npm install` di VPS

#### Step 6: Setup Database
```bash
# Database sudah menggunakan SQLite, tidak perlu install tambahan
# File database akan otomatis dibuat di folder data/
```

#### Step 7: Konfigurasi Environment
```bash
# Buat file .env (jika diperlukan)
nano .env
```

Isi file `.env`:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=ganti-dengan-secret-key-yang-kuat-dan-random
```

#### Step 8: Jalankan dengan PM2
```bash
# Start aplikasi
pm2 start server.js --name koperasi-app

# Auto-start saat server reboot
pm2 startup
pm2 save

# Cek status
pm2 status
pm2 logs koperasi-app
```

#### Step 9: Install Nginx (Reverse Proxy)
```bash
apt install -y nginx

# Buat konfigurasi
nano /etc/nginx/sites-available/koperasi
```

Isi konfigurasi:
```nginx
server {
    listen 80;
    server_name koperasi-sejahtera.com www.koperasi-sejahtera.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Aktifkan konfigurasi:
```bash
ln -s /etc/nginx/sites-available/koperasi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 10: Install SSL Certificate (HTTPS)
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
certbot --nginx -d koperasi-sejahtera.com -d www.koperasi-sejahtera.com

# Auto-renewal
certbot renew --dry-run
```

#### Step 11: Setup Firewall
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## Panduan Deploy ke Heroku (Gratis/Murah)

### Persiapan
1. Daftar akun di [Heroku](https://heroku.com)
2. Install [Heroku CLI](https://devcli.heroku.com/install)

### Langkah-langkah

#### Step 1: Login Heroku
```bash
heroku login
```

#### Step 2: Buat Aplikasi
```bash
heroku create nama-koperasi-anda
```

#### Step 3: Tambahkan Procfile
Buat file `Procfile` di root project:
```
web: node server.js
```

#### Step 4: Update package.json
Tambahkan di `package.json`:
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

#### Step 5: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Step 6: Buka Aplikasi
```bash
heroku open
```

---

## Panduan Deploy ke Shared Hosting (cPanel)

### Syarat
- Hosting harus support Node.js
- Akses SSH atau Node.js App Manager di cPanel

### Langkah-langkah

#### Via cPanel Node.js Manager:
1. Login ke cPanel
2. Cari "Setup Node.js App"
3. Klik "Create Application"
4. Isi:
   - Node.js version: 18.x
   - Application mode: Production
   - Application root: public_html/koperasi
   - Application URL: koperasi.domain.com
   - Application startup file: server.js
5. Upload file via File Manager atau FTP
6. Klik "Run NPM Install"
7. Start aplikasi

---

## Konfigurasi Tambahan untuk Produksi

### 1. Update server.js
Tambahkan di bagian atas `server.js`:
```javascript
// Production settings
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

### 2. Ganti JWT Secret
Edit di `server.js`:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-dengan-secret-random-yang-kuat';
```

Generate secret random:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Backup Database
Buat script backup otomatis:
```bash
# Buat file backup.sh
nano /root/backup-koperasi.sh
```

Isi:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/koperasi-app/data/koperasi.db /root/backups/koperasi_$DATE.db
# Hapus backup lebih dari 30 hari
find /root/backups -name "koperasi_*.db" -mtime +30 -delete
```

Jadwalkan dengan cron:
```bash
chmod +x /root/backup-koperasi.sh
crontab -e
```

Tambahkan:
```
0 2 * * * /root/backup-koperasi.sh
```

---

## Monitoring & Maintenance

### Cek Status Aplikasi
```bash
pm2 status
pm2 logs koperasi-app
```

### Restart Aplikasi
```bash
pm2 restart koperasi-app
```

### Update Aplikasi
```bash
cd /var/www/koperasi-app
git pull
npm install
pm2 restart koperasi-app
```

### Monitoring Resource
```bash
pm2 monit
htop
```

---

## Estimasi Biaya

### VPS (Recommended)
- **DigitalOcean Droplet:** $6/bulan (1GB RAM)
- **Vultr:** $5/bulan (1GB RAM)
- **Domain:** $10-15/tahun
- **Total:** ~$7-8/bulan

### Heroku
- **Free Tier:** $0 (dengan batasan)
- **Hobby:** $7/bulan
- **Professional:** $25/bulan

### Shared Hosting
- **Hostinger:** Rp 30.000-50.000/bulan
- **Niagahoster:** Rp 40.000-80.000/bulan

---

## Keamanan Penting

### 1. Ganti Password Default
Ganti semua password default di aplikasi:
- Admin: admin/admin123
- Kasir: kasir/kasir123

### 2. Aktifkan HTTPS
Wajib menggunakan SSL certificate (gratis dari Let's Encrypt)

### 3. Backup Rutin
Backup database minimal 1x sehari

### 4. Update Rutin
Update Node.js dan dependencies secara berkala

### 5. Firewall
Aktifkan firewall dan hanya buka port yang diperlukan

---

## Troubleshooting

### Aplikasi tidak bisa diakses
```bash
# Cek status PM2
pm2 status

# Cek logs
pm2 logs koperasi-app

# Cek port
netstat -tulpn | grep 3000

# Restart
pm2 restart koperasi-app
```

### Database error
```bash
# Cek permission
ls -la data/
chmod 755 data/
chmod 644 data/koperasi.db
```

### Nginx error
```bash
# Cek konfigurasi
nginx -t

# Cek logs
tail -f /var/log/nginx/error.log

# Restart
systemctl restart nginx
```

---

## Rekomendasi

### Untuk Koperasi Kecil (< 50 anggota)
✅ **Shared Hosting** atau **Heroku Free/Hobby**
- Murah
- Mudah maintenance
- Cukup untuk kebutuhan dasar

### Untuk Koperasi Menengah (50-200 anggota)
✅ **VPS $5-10/bulan**
- Performa lebih baik
- Full control
- Bisa custom sesuai kebutuhan

### Untuk Koperasi Besar (200+ anggota)
✅ **VPS $20+/bulan** atau **Dedicated Server**
- High performance
- Dedicated resources
- Scalable

---

## Support & Bantuan

Jika butuh bantuan deploy, bisa:
1. Hubungi provider hosting Anda
2. Hire developer untuk setup awal
3. Gunakan managed hosting service

---

**Kesimpulan:** Aplikasi ini **BISA dan MUDAH** di-hosting. Pilih platform sesuai budget dan kebutuhan koperasi Anda!

**Tanggal:** 9 November 2025
