@echo off
echo ========================================
echo   KOPERASI NU VIBES
echo   Sistem Manajemen Koperasi
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js dari https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js terdeteksi
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    echo Mohon tunggu, proses ini mungkin memakan waktu beberapa menit...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Gagal menginstall dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies berhasil diinstall!
    echo.
)

REM Create uploads folder if not exists
if not exist "uploads\" (
    echo [INFO] Membuat folder uploads...
    mkdir uploads
)

echo ========================================
echo   Starting Server...
echo ========================================
echo.
echo Server akan berjalan di: http://localhost:3000
echo Login default:
echo   Username: admin
echo   Password: admin123
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo ========================================
echo.

REM Start the server
node server.js

pause
