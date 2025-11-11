#!/bin/bash
# Web-DYUSBKVM Linux/macOS 啟動腳本
# 此腳本會啟動本地 HTTPS 伺服器並自動開啟瀏覽器

echo "========================================"
echo "Web-DYUSBKVM 啟動腳本"
echo "========================================"
echo ""

# 檢查 Python 是否安裝
if ! command -v python3 &> /dev/null; then
    echo "[錯誤] 未找到 Python 3"
    echo "請先安裝 Python 3.6 或更高版本"
    echo ""
    echo "Ubuntu/Debian: sudo apt-get install python3"
    echo "CentOS/RHEL:   sudo yum install python3"
    echo "macOS:         brew install python3"
    exit 1
fi

echo "[資訊] 檢查 Python 版本..."
python3 --version

# 檢查 OpenSSL 是否可用
if ! command -v openssl &> /dev/null; then
    echo "[警告] 未找到 OpenSSL 命令"
    echo "如果首次執行，將無法生成 SSL 憑證"
    echo "請安裝 OpenSSL:"
    echo ""
    echo "Ubuntu/Debian: sudo apt-get install openssl"
    echo "CentOS/RHEL:   sudo yum install openssl"
    echo "macOS:         brew install openssl"
    echo ""
    read -p "按 Enter 繼續（如果已有憑證）..."
fi

# 切換到腳本所在目錄
cd "$(dirname "$0")"

# 檢查 server.py 是否存在
if [ ! -f "server.py" ]; then
    echo "[錯誤] 找不到 server.py"
    exit 1
fi

# 賦予 server.py 執行權限（如果需要）
chmod +x server.py 2>/dev/null

# 啟動伺服器
echo ""
echo "[資訊] 正在啟動伺服器..."
echo ""
python3 server.py

# 如果伺服器異常退出，顯示錯誤訊息
if [ $? -ne 0 ]; then
    echo ""
    echo "[錯誤] 伺服器啟動失敗"
    exit 1
fi

