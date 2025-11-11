# Local Run 目錄說明

此目錄包含用於本地執行 Web-DYUSBKVM 的腳本和伺服器程式。

## 檔案說明

- **server.py**: Python HTTP/HTTPS 伺服器，提供靜態檔案服務
- **start_kvm.bat**: Windows 啟動腳本
- **start_kvm.sh**: Linux/macOS 啟動腳本
- **.gitignore**: Git 忽略檔案（排除 SSL 憑證）

## 使用方式

### Windows

1. 以**系統管理員身份**執行 `start_kvm.bat`
2. 瀏覽器會自動開啟 Web-DYUSBKVM 介面
3. 如果瀏覽器顯示安全警告，請點擊「進階」→「繼續前往」

### Linux/macOS

1. 賦予執行權限：
   ```bash
   chmod +x start_kvm.sh
   ```

2. 執行啟動腳本：
   ```bash
   ./start_kvm.sh
   ```

3. 瀏覽器會自動開啟 Web-DYUSBKVM 介面
4. 如果瀏覽器顯示安全警告，請點擊「進階」→「繼續前往」

## 系統需求

- **Python 3.6+**: 用於執行伺服器
- **OpenSSL**: 用於生成 SSL 憑證（首次執行時需要）

## SSL 憑證

首次執行時，伺服器會自動生成自簽 SSL 憑證（`cert.pem` 和 `key.pem`）。

**注意**: 
- 自簽憑證會導致瀏覽器顯示安全警告，這是正常現象
- 憑證檔案已加入 `.gitignore`，不會提交到版本控制
- 如需使用正式憑證，請替換 `cert.pem` 和 `key.pem`

## 連接埠

預設使用連接埠 **8443**。如需修改，請編輯 `server.py` 中的 `PORT` 變數。

## 疑難排解

### 連接埠已被使用

如果出現「Address already in use」錯誤：

1. 修改 `server.py` 中的 `PORT` 變數為其他連接埠
2. 或關閉其他使用該連接埠的程式

### 無法生成 SSL 憑證

1. 確認已安裝 OpenSSL
2. 確認 OpenSSL 在系統 PATH 中
3. 手動生成憑證：
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=TW/ST=Taiwan/L=Taipei/O=Web-DYUSBKVM/CN=localhost"
   ```

### 瀏覽器無法開啟

1. 手動開啟瀏覽器
2. 訪問 `https://localhost:8443`
3. 點擊「進階」→「繼續前往」以接受自簽憑證

