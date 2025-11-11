@echo off
chcp 950 >nul
REM Web-DYUSBKVM Windows Startup Script
REM This script starts a local HTTPS server and automatically opens the browser

echo ========================================
echo Web-DYUSBKVM Startup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [Error] Python not found
    echo Please install Python 3.6 or higher
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [Info] Checking Python version
python --version

REM Check if OpenSSL is available
where openssl >nul 2>&1
if errorlevel 1 (
    echo [Warning] OpenSSL command not found
    echo If this is the first run, SSL certificate generation will fail
    echo Please download and install OpenSSL from:
    echo https://slproweb.com/products/Win32OpenSSL.html
    echo.
    echo Press any key to continue (if certificate already exists)
    pause >nul
)

REM Change to script directory
cd /d "%~dp0"

REM Start server
echo.
echo [Info] Starting server
echo.
python server.py

REM If server exits abnormally, pause to view error message
if errorlevel 1 (
    echo.
    echo [Error] Server startup failed
    pause
)
