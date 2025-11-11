@echo off
chcp 950 >nul
REM Web-DYUSBKVM Windows 啟動腳本
REM 此腳本會啟動本地 HTTPS 伺服器並自動開啟瀏覽器

echo ========================================
echo Web-DYUSBKVM 啟動腳本
echo ========================================
echo.

REM 檢查 Python 是否安裝
python --version >nul 2>&1
if errorlevel 1 (
    echo [錯誤] 未找到 Python
    echo 請先安裝 Python 3.6 或更高版本
    echo 下載地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [資訊] 檢查 Python 版本...
python --version

REM 檢查 OpenSSL 是否可用
where openssl >nul 2>&1
if errorlevel 1 (
    echo [警告] 未找到 OpenSSL 命令
    echo 如果首次執行，將無法生成 SSL 憑證
    echo 請從以下地址下載並安裝 OpenSSL:
    echo https://slproweb.com/products/Win32OpenSSL.html
    echo.
    echo 按任意鍵繼續（如果已有憑證）...
    pause >nul
)

REM 切換到腳本所在目錄
cd /d "%~dp0"

REM 啟動伺服器
echo.
echo [資訊] 正在啟動伺服器...
echo.
python server.py

REM 如果伺服器異常退出，暫停以查看錯誤訊息
if errorlevel 1 (
    echo.
    echo [錯誤] 伺服器啟動失敗
    pause
)

