/**
 * CH9329 通訊模組
 * 使用 Web Serial API 與 CH9329 晶片通訊
 */

export class CH9329 {
    constructor() {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.connected = false;
    }

    /**
     * 連接 Serial Port
     */
    async connect(port, baudRate = 9600, dataBits = 8, stopBits = 1) {
        try {
            if (!port) {
                throw new Error('未提供 Serial Port');
            }

            this.port = port;

            // 開啟串口
            await this.port.open({
                baudRate: baudRate,
                dataBits: dataBits,
                stopBits: stopBits,
                parity: 'none'
            });

            // 取得 reader 和 writer
            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();

            this.connected = true;
            console.log('CH9329 已連線');

            // 背景讀取
            this.startReading();

            return true;
        } catch (error) {
            console.error('CH9329 連線失敗:', error);
            this.connected = false;
            return false;
        }
    }

    /**
     * 斷開連線
     */
    async disconnect() {
        try {
            if (this.reader) {
                await this.reader.cancel();
                this.reader.releaseLock();
                this.reader = null;
            }

            if (this.writer) {
                this.writer.releaseLock();
                this.writer = null;
            }

            if (this.port) {
                await this.port.close();
                this.port = null;
            }

            this.connected = false;
            console.log('CH9329 已斷線');
        } catch (error) {
            console.error('CH9329 斷線錯誤:', error);
        }
    }

    /**
     * 背景讀取資料
     */
    async startReading() {
        try {
            while (this.connected && this.reader) {
                const { value, done } = await this.reader.read();
                if (done) break;

                if (value && value.length > 0) {
                    console.log('Received:', Array.from(value).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
                }
            }
        } catch (error) {
            if (error.name !== 'NetworkError') {
                console.error('讀取錯誤:', error);
            }
        }
    }

    /**
     * 發送資料
     */
    async write(data) {
        if (!this.connected || !this.writer) {
            throw new Error('CH9329 未連線');
        }

        try {
            await this.writer.write(data);
            console.log('Sent:', Array.from(data).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        } catch (error) {
            console.error('寫入錯誤:', error);
            throw error;
        }
    }

    /**
     * 將有號整數 (-127..127) 轉為 8-bit 無號位元組
     */
    toByteSignedRange(v) {
        const vv = Math.max(-127, Math.min(127, Math.trunc(v)));
        return vv < 0 ? (0xFF + vv + 1) & 0xFF : vv & 0xFF;
    }

    /**
     * 生成 CH9329 命令封包
     */
    genPacket(cmd = 0x01, ...data) {
        // 驗證資料
        for (const v of data) {
            if (v < 0 || v > 255) {
                throw new Error(`Invalid byte value: ${v}`);
            }
        }

        // 封包結構: [0x57, 0xAB, 0x00, CMD, Length, ...Data, Checksum]
        let packet = [0x57, 0xAB, 0x00, cmd, data.length, ...data];

        // 計算 Checksum (所有位元組的總和 mod 256)
        let sum = 0;
        for (const v of packet) {
            sum = (sum + v) % 256;
        }
        packet.push(sum);

        return packet;
    }

    /**
     * 發送通用鍵盤報告（最多 6 個 HID key）
     * CMD 0x02, LEN 0x08, [control_bits, 0x00, key1, key2, key3, key4, key5, key6]
     * 
     * @param {number} controlBits 控制鍵位定義（根據 CH9329 協議）：
     *   BIT0 = Left Ctrl
     *   BIT1 = Left Shift
     *   BIT2 = Left Alt
     *   BIT3 = Left Win
     *   BIT4 = Right Ctrl
     *   BIT5 = Right Shift
     *   BIT6 = Right Alt
     *   BIT7 = Right Win
     * @param {number[]} keyCodes 最多 6 個 HID Key code（HID Page 0x07）
     */
    async sendKeyboardReport(controlBits = 0, keyCodes = []) {
        const k = [...keyCodes].slice(0, 6);
        while (k.length < 6) k.push(0);
        // 數據格式：[control_bits, 0x00, key1, key2, key3, key4, key5, key6]
        const packet = this.genPacket(0x02, controlBits & 0xFF, 0x00, ...k);
        await this.write(new Uint8Array(packet));
    }

    /**
     * 按鍵按下（不自動釋放）
     */
    async sendKeyDown(hidCode, controlBits = 0) {
        await this.sendKeyboardReport(controlBits, [hidCode]);
    }

    /**
     * 按鍵釋放（清空報告）
     */
    async sendKeyUp() {
        const packet = this.genPacket(0x02, 0x00, 0x00, 0, 0, 0, 0, 0, 0);
        await this.write(new Uint8Array(packet));
    }

    /**
     * 發送鍵盤命令
     */
    async sendKeyPress(hidCode, controlBits = 0) {
        // 按下
        const pressPacket = this.genPacket(2, controlBits, 0, hidCode, 0, 0, 0, 0, 0);
        // 釋放
        const releasePacket = this.genPacket(2, 0, 0, 0, 0, 0, 0, 0, 0);

        const data = new Uint8Array([...pressPacket, ...releasePacket]);
        await this.write(data);
    }

    /**
     * 發送相對滑鼠移動命令
     * CMD 0x05, LEN 0x05, [0x01, buttons, dx, dy, wheel]
     * 
     * @param {number} buttons 按鍵狀態（BIT0=左鍵, BIT1=右鍵, BIT2=中鍵）
     * @param {number} x X方向移動距離（-127 到 127，0x01-0x7F=向右，0x80-0xFF=向左）
     * @param {number} y Y方向移動距離（-127 到 127，0x01-0x7F=向下，0x80-0xFF=向上）
     * @param {number} wheel 滾輪（0=無滾動，0x01-0x7F=向上，0x81-0xFF=向下）
     */
    async sendMouseMove(buttons = 0, x = 0, y = 0, wheel = 0) {
        // CH9329 滑鼠相對報表：CMD 0x05, LEN 0x05, [0x01, buttons, dx, dy, wheel]
        const pX = this.toByteSignedRange(x);
        const pY = this.toByteSignedRange(y);
        
        // 滾輪處理：0x01-0x7F=向上，0x81-0xFF=向下
        let pWheel = 0;
        if (wheel > 0) {
            pWheel = Math.min(0x7F, Math.max(0x01, wheel & 0x7F));
        } else if (wheel < 0) {
            pWheel = Math.max(0x81, Math.min(0xFF, (0x100 - Math.abs(wheel)) & 0xFF));
        }
        
        const packet = this.genPacket(0x05, 0x01, buttons & 0x07, pX, pY, pWheel);
        const data = new Uint8Array(packet);
        await this.write(data);
    }

    /**
     * 僅更新滑鼠按鍵（不移動、不滾動）
     * CMD 0x05, LEN 0x05, [0x01, buttons, 0x00, 0x00, 0x00]
     * 
     * @param {number} buttons 按鍵狀態（BIT0=左鍵, BIT1=右鍵, BIT2=中鍵）
     */
    async sendMouseButtons(buttons = 0) {
        const packet = this.genPacket(0x05, 0x01, buttons & 0x07, 0x00, 0x00, 0x00);
        await this.write(new Uint8Array(packet));
    }

    /**
     * 發送絕對滑鼠座標命令
     * CMD 0x04, LEN 0x07, [0x02, buttons, X_lo, X_hi, Y_lo, Y_hi, wheel]
     * 
     * 數據格式說明（根據 CH9329 協議文檔）：
     * - 第1個字節：必須是 0x02
     * - 第2個字節：按鍵狀態（BIT0=左鍵, BIT1=右鍵, BIT2=中鍵）
     * - 第3-4個字節：X座標（little-endian，低字節在前，範圍 0-4096）
     * - 第5-6個字節：Y座標（little-endian，低字節在前，範圍 0-4096）
     * - 第7個字節：滾輪（0=無滾動，0x01-0x7F=向上，0x81-0xFF=向下）
     * 
     * 注意：CH9329 內部模擬的絕對滑鼠解析度為 4096*4096
     * 需要根據實際螢幕解析度計算對應的座標值
     * 
     * @param {number} x 目標 X 座標（螢幕像素）
     * @param {number} y 目標 Y 座標（螢幕像素）
     * @param {number} buttons 按鍵狀態（BIT0=左鍵, BIT1=右鍵, BIT2=中鍵）
     * @param {number} screenWidth 螢幕寬度（用於座標映射）
     * @param {number} screenHeight 螢幕高度（用於座標映射）
     * @param {number} wheel 滾輪（0=無滾動，正數=向上，負數=向下）
     */
    async sendMouseAbsolute(x, y, buttons = 0, screenWidth = 1920, screenHeight = 1080, wheel = 0) {
        const clamp = (v, min, max) => Math.max(min, Math.min(max, Math.trunc(v)));
        const sw = Math.max(1, screenWidth);
        const sh = Math.max(1, screenHeight);
        
        // 將螢幕座標映射到 0-4096 範圍
        const X4096 = clamp((4096 * x) / sw, 0, 4096);
        const Y4096 = clamp((4096 * y) / sh, 0, 4096);
        
        // little-endian 格式（低字節在前）
        const X_lo = X4096 & 0xFF;
        const X_hi = (X4096 >> 8) & 0xFF;
        const Y_lo = Y4096 & 0xFF;
        const Y_hi = (Y4096 >> 8) & 0xFF;
        
        // 滾輪處理：0x01-0x7F=向上，0x81-0xFF=向下
        let wheelByte = 0;
        if (wheel > 0) {
            wheelByte = Math.min(0x7F, Math.max(0x01, wheel & 0x7F));
        } else if (wheel < 0) {
            wheelByte = Math.max(0x81, Math.min(0xFF, (0x100 - Math.abs(wheel)) & 0xFF));
        }
        
        // 數據部分：[0x02, buttons, X_lo, X_hi, Y_lo, Y_hi, wheel] 共 7 個字節
        // 按鍵狀態只使用低 3 位（BIT0=左鍵, BIT1=右鍵, BIT2=中鍵）
        const data = [0x02, buttons & 0x07, X_lo, X_hi, Y_lo, Y_hi, wheelByte];
        
        // 手動構建封包以確保長度正確
        const HEAD = [0x57, 0xAB, 0x00];
        const CMD = 0x04;
        const LEN = 0x07; // 數據長度固定為 7
        const packet = [...HEAD, CMD, LEN, ...data];
        
        // 計算 Checksum (HEAD + ADDR + CMD + LEN + DATA 的總和 mod 256)
        let sum = 0;
        for (const v of packet) {
            sum = (sum + v) % 256;
        }
        packet.push(sum);
        
        await this.write(new Uint8Array(packet));
    }

    isConnected() {
        return this.connected;
    }
}

/**
 * HID 鍵盤掃描碼對應表（根據 CH9329 協議文檔 - HID Page 0x07）
 * 格式：[key, [HID_Code, Shift_Flag]]
 * Shift_Flag: 0=不需要 Shift, 2=需要 Shift (Left Shift)
 */
export const HID_KEYS = new Map([
    // 字母 (A-Z)
    ["a", [0x04, 0]], ["A", [0x04, 2]], ["b", [0x05, 0]], ["B", [0x05, 2]],
    ["c", [0x06, 0]], ["C", [0x06, 2]], ["d", [0x07, 0]], ["D", [0x07, 2]],
    ["e", [0x08, 0]], ["E", [0x08, 2]], ["f", [0x09, 0]], ["F", [0x09, 2]],
    ["g", [0x0A, 0]], ["G", [0x0A, 2]], ["h", [0x0B, 0]], ["H", [0x0B, 2]],
    ["i", [0x0C, 0]], ["I", [0x0C, 2]], ["j", [0x0D, 0]], ["J", [0x0D, 2]],
    ["k", [0x0E, 0]], ["K", [0x0E, 2]], ["l", [0x0F, 0]], ["L", [0x0F, 2]],
    ["m", [0x10, 0]], ["M", [0x10, 2]], ["n", [0x11, 0]], ["N", [0x11, 2]],
    ["o", [0x12, 0]], ["O", [0x12, 2]], ["p", [0x13, 0]], ["P", [0x13, 2]],
    ["q", [0x14, 0]], ["Q", [0x14, 2]], ["r", [0x15, 0]], ["R", [0x15, 2]],
    ["s", [0x16, 0]], ["S", [0x16, 2]], ["t", [0x17, 0]], ["T", [0x17, 2]],
    ["u", [0x18, 0]], ["U", [0x18, 2]], ["v", [0x19, 0]], ["V", [0x19, 2]],
    ["w", [0x1A, 0]], ["W", [0x1A, 2]], ["x", [0x1B, 0]], ["X", [0x1B, 2]],
    ["y", [0x1C, 0]], ["Y", [0x1C, 2]], ["z", [0x1D, 0]], ["Z", [0x1D, 2]],
    
    // 數字和符號
    ["1", [0x1E, 0]], ["!", [0x1E, 2]], ["2", [0x1F, 0]], ["@", [0x1F, 2]],
    ["3", [0x20, 0]], ["#", [0x20, 2]], ["4", [0x21, 0]], ["$", [0x21, 2]],
    ["5", [0x22, 0]], ["%", [0x22, 2]], ["6", [0x23, 0]], ["^", [0x23, 2]],
    ["7", [0x24, 0]], ["&", [0x24, 2]], ["8", [0x25, 0]], ["*", [0x25, 2]],
    ["9", [0x26, 0]], ["(", [0x26, 2]], ["0", [0x27, 0]], [")", [0x27, 2]],
    
    // 特殊功能鍵
    ["Enter", [0x28, 0]], ["\n", [0x28, 0]], ["Return", [0x28, 0]],
    ["Escape", [0x29, 0]], ["Esc", [0x29, 0]],
    ["Backspace", [0x2A, 0]], ["Tab", [0x2B, 0]], ["\t", [0x2B, 0]],
    [" ", [0x2C, 0]], ["Space", [0x2C, 0]],
    
    // 符號鍵
    ["-", [0x2D, 0]], ["_", [0x2D, 2]], ["=", [0x2E, 0]], ["+", [0x2E, 2]],
    ["[", [0x2F, 0]], ["{", [0x2F, 2]], ["]", [0x30, 0]], ["}", [0x30, 2]],
    ["\\", [0x31, 0]], ["|", [0x31, 2]],
    [";", [0x33, 0]], [":", [0x33, 2]],
    ["'", [0x34, 0]], ['"', [0x34, 2]],
    ["`", [0x35, 0]], ["~", [0x35, 2]],
    [",", [0x36, 0]], ["<", [0x36, 2]],
    [".", [0x37, 0]], [">", [0x37, 2]],
    ["/", [0x38, 0]], ["?", [0x38, 2]],
    
    // 功能鍵 (F1-F12)
    ["F1", [0x3A, 0]], ["F2", [0x3B, 0]], ["F3", [0x3C, 0]], ["F4", [0x3D, 0]],
    ["F5", [0x3E, 0]], ["F6", [0x3F, 0]], ["F7", [0x40, 0]], ["F8", [0x41, 0]],
    ["F9", [0x42, 0]], ["F10", [0x43, 0]], ["F11", [0x44, 0]], ["F12", [0x45, 0]],
    
    // 系統鍵
    ["PrintScreen", [0x46, 0]], ["Print", [0x46, 0]],
    ["ScrollLock", [0x47, 0]], ["Pause", [0x48, 0]],
    
    // 導航和編輯鍵
    ["Insert", [0x49, 0]], ["Home", [0x4A, 0]], ["PageUp", [0x4B, 0]],
    ["Delete", [0x4C, 0]], ["End", [0x4D, 0]], ["PageDown", [0x4E, 0]],
    ["ArrowRight", [0x4F, 0]], ["Right", [0x4F, 0]], ["→", [0x4F, 0]],
    ["ArrowLeft", [0x50, 0]], ["Left", [0x50, 0]], ["←", [0x50, 0]],
    ["ArrowDown", [0x51, 0]], ["Down", [0x51, 0]], ["↓", [0x51, 0]],
    ["ArrowUp", [0x52, 0]], ["Up", [0x52, 0]], ["↑", [0x52, 0]],
    
    // 數字鍵盤
    ["NumLock", [0x53, 0]],
    ["NumpadDivide", [0x54, 0]], ["NumpadMultiply", [0x55, 0]],
    ["NumpadSubtract", [0x56, 0]], ["NumpadAdd", [0x57, 0]],
    ["NumpadEnter", [0x58, 0]],
    ["Numpad1", [0x59, 0]], ["Numpad2", [0x5A, 0]], ["Numpad3", [0x5B, 0]],
    ["Numpad4", [0x5C, 0]], ["Numpad5", [0x5D, 0]], ["Numpad6", [0x5E, 0]],
    ["Numpad7", [0x5F, 0]], ["Numpad8", [0x60, 0]], ["Numpad9", [0x61, 0]],
    ["Numpad0", [0x62, 0]], ["NumpadDecimal", [0x63, 0]],
    
    // 修飾鍵（根據 CH9329 協議文檔）
    // 注意：這些鍵碼用於 HID 報告，但控制鍵位應該使用 controlBits 參數
    ["Control", [0xE0, 0]], ["Ctrl", [0xE0, 0]], ["LeftControl", [0xE0, 0]],
    ["Shift", [0xE1, 0]], ["LeftShift", [0xE1, 0]],
    ["Alt", [0xE2, 0]], ["LeftAlt", [0xE2, 0]],
    ["Meta", [0xE3, 0]], ["Win", [0xE3, 0]], ["LeftWin", [0xE3, 0]],
    ["RightControl", [0xE4, 0]], ["RightShift", [0xE5, 0]],
    ["RightAlt", [0xE6, 0]], ["RightWin", [0xE7, 0]],
    
    // 應用程式鍵
    ["ContextMenu", [0x65, 0]], ["App", [0x65, 0]]
]);

