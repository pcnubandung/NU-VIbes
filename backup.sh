#!/bin/bash

# Script Backup Database Koperasi
# Jalankan dengan: bash backup.sh
# Atau jadwalkan dengan cron: 0 2 * * * /path/to/backup.sh

# Konfigurasi
APP_DIR="/var/www/koperasi-app"
BACKUP_DIR="/root/backups/koperasi"
DB_FILE="$APP_DIR/data/koperasi.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/koperasi_$DATE.db"
KEEP_DAYS=30

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "Backup Database Koperasi"
echo "========================================="
echo "Waktu: $(date)"
echo ""

# Buat folder backup jika belum ada
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Membuat folder backup..."
    mkdir -p "$BACKUP_DIR"
fi

# Cek apakah database ada
if [ ! -f "$DB_FILE" ]; then
    echo -e "${RED}Error: Database tidak ditemukan di $DB_FILE${NC}"
    exit 1
fi

# Backup database
echo "Membackup database..."
cp "$DB_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup berhasil: $BACKUP_FILE${NC}"
    
    # Tampilkan ukuran file
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "  Ukuran: $SIZE"
else
    echo -e "${RED}✗ Backup gagal!${NC}"
    exit 1
fi

# Compress backup (opsional)
echo ""
echo "Mengkompress backup..."
gzip "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Kompresi berhasil: $BACKUP_FILE.gz${NC}"
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "  Ukuran terkompress: $COMPRESSED_SIZE"
fi

# Hapus backup lama (lebih dari X hari)
echo ""
echo "Membersihkan backup lama (> $KEEP_DAYS hari)..."
find "$BACKUP_DIR" -name "koperasi_*.db.gz" -mtime +$KEEP_DAYS -delete
DELETED=$(find "$BACKUP_DIR" -name "koperasi_*.db.gz" -mtime +$KEEP_DAYS | wc -l)

if [ $DELETED -gt 0 ]; then
    echo -e "${GREEN}✓ Dihapus: $DELETED file backup lama${NC}"
else
    echo "  Tidak ada backup lama yang perlu dihapus"
fi

# Tampilkan daftar backup
echo ""
echo "Daftar backup tersedia:"
ls -lh "$BACKUP_DIR" | grep "koperasi_" | tail -5

echo ""
echo "========================================="
echo -e "${GREEN}Backup selesai!${NC}"
echo "========================================="
