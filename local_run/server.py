#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Web-DYUSBKVM 本地 HTTP 伺服器
提供 HTTPS 支援的靜態檔案伺服器，用於本地執行 Web-DYUSBKVM
"""

import http.server
import socketserver
import ssl
import os
import sys
import subprocess
import webbrowser
from pathlib import Path

# 設定
PORT = 8443
WEB_DIR = Path(__file__).parent.parent / 'web'
CERT_DIR = Path(__file__).parent
CERT_FILE = CERT_DIR / 'cert.pem'
KEY_FILE = CERT_DIR / 'key.pem'

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自訂 HTTP 請求處理器"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)
    
    def end_headers(self):
        # 添加 CORS 標頭
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # 添加安全標頭
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        super().end_headers()
    
    def log_message(self, format, *args):
        """自訂日誌格式"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def generate_self_signed_cert():
    """生成自簽 SSL 憑證"""
    if CERT_FILE.exists() and KEY_FILE.exists():
        print(f"✓ SSL 憑證已存在: {CERT_FILE}")
        return True
    
    print("正在生成自簽 SSL 憑證...")
    
    # 檢查是否有 openssl
    try:
        subprocess.run(['openssl', 'version'], 
                      stdout=subprocess.DEVNULL, 
                      stderr=subprocess.DEVNULL, 
                      check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[警告] 未找到 OpenSSL，將使用 HTTP 模式")
        print("如需 HTTPS，請先安裝 OpenSSL:")
        print("Windows: 從 https://slproweb.com/products/Win32OpenSSL.html 下載")
        print("Linux: sudo apt-get install openssl 或 sudo yum install openssl")
        print("macOS: brew install openssl")
        return False
    
    # 生成憑證
    try:
        subprocess.run([
            'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
            '-keyout', str(KEY_FILE),
            '-out', str(CERT_FILE),
            '-days', '365',
            '-nodes',
            '-subj', '/C=TW/ST=Taiwan/L=Taipei/O=Web-DYUSBKVM/CN=localhost'
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        print(f"✓ SSL 憑證已生成: {CERT_FILE}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[警告] 生成 SSL 憑證失敗: {e}")
        print("將使用 HTTP 模式")
        return False

def main():
    """主函數"""
    # 檢查 web 目錄是否存在
    if not WEB_DIR.exists():
        print(f"錯誤: Web 目錄不存在: {WEB_DIR}")
        sys.exit(1)
    
    # 嘗試生成 SSL 憑證
    ssl_available = generate_self_signed_cert()
    use_https = False
    
    # 創建伺服器
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            # 嘗試使用 HTTPS
            if ssl_available:
                try:
                    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                    context.load_cert_chain(CERT_FILE, KEY_FILE)
                    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
                    use_https = True
                    print("=" * 60)
                    print("Web-DYUSBKVM 本地伺服器已啟動 (HTTPS)")
                    print("=" * 60)
                    print(f"伺服器地址: https://localhost:{PORT}")
                    print(f"Web 目錄: {WEB_DIR}")
                    print("=" * 60)
                    print("注意: 瀏覽器會顯示安全警告（自簽憑證）")
                    print("      請點擊「進階」→「繼續前往」以繼續")
                    print("=" * 60)
                except Exception as ssl_error:
                    print(f"[警告] HTTPS 啟動失敗: {ssl_error}")
                    print("正在切換為 HTTP 模式...")
                    use_https = False
            else:
                print("[警告] SSL 憑證生成失敗，使用 HTTP 模式")
                use_https = False
            
            # 如果 HTTPS 失敗，使用 HTTP
            if not use_https:
                print("=" * 60)
                print("Web-DYUSBKVM 本地伺服器已啟動 (HTTP)")
                print("=" * 60)
                print(f"伺服器地址: http://localhost:{PORT}")
                print(f"Web 目錄: {WEB_DIR}")
                print("=" * 60)
                print("注意: 使用 HTTP 模式，某些瀏覽器功能可能受限")
                print("      Web Serial API 和 MediaStream API 需要 HTTPS")
                print("      建議使用 HTTPS 模式以獲得完整功能")
                print("=" * 60)
            
            print("按 Ctrl+C 停止伺服器")
            print()
            
            # 自動開啟瀏覽器
            try:
                protocol = "https" if use_https else "http"
                url = f"{protocol}://localhost:{PORT}"
                print(f"正在開啟瀏覽器: {url}")
                webbrowser.open(url)
            except Exception as e:
                print(f"無法自動開啟瀏覽器: {e}")
                protocol = "https" if use_https else "http"
                url = f"{protocol}://localhost:{PORT}"
                print(f"請手動開啟瀏覽器並訪問: {url}")
            
            # 啟動伺服器
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n伺服器已停止")
    except OSError as e:
        if e.errno == 98 or "Address already in use" in str(e):
            print(f"錯誤: 連接埠 {PORT} 已被使用")
            print(f"請關閉其他使用此連接埠的程式，或修改 server.py 中的 PORT 設定")
        else:
            print(f"錯誤: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"錯誤: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

