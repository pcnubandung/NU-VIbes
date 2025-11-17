@echo off
echo ========================================
echo   RESET DATABASE - KOPERASI NU VIBES
echo ========================================
echo.
echo PERINGATAN: Semua data akan hilang!
echo.
set /p confirm="Apakah Anda yakin ingin reset database? (Y/N): "

if /i "%confirm%" NEQ "Y" (
    echo.
    echo Reset dibatalkan.
    pause
    exit /b 0
)

echo.
echo [INFO] Mereset database...
echo.

REM Hapus database lama
if exist "koperasi.db" (
    del /f /q "koperasi.db"
    echo [SUCCESS] Database lama berhasil dihapus
) else (
    echo [INFO] Database tidak ditemukan
)

echo.
echo ========================================
echo   RESET SELESAI!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Jalankan: npm start
echo 2. Buka browser: http://localhost:3000/login.html
echo 3. Login dengan: admin / admin123
echo.
pause
