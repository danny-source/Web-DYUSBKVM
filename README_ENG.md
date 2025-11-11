# Web-DYUSBKVM

> Web USBKVM System based on CH9329 Module

-----

## Project Overview

Web-DYUSBKVM is a Web USBKVM system based on the CH9329 module, using pure frontend technology to implement HDMI capture device display and keyboard/mouse control functions. This project references the design of [JTUSBKVM](https://github.com/jasoncheng7115/JTUSBKVM), but uses the CH9329 module for direct Serial to HID conversion, simplifying the hardware architecture.

![](screenshot.jpg)

-----

## Key Features

### Hardware Architecture
- **CH9329 Module**: Directly converts serial commands to HID keyboard/mouse signals
- **HDMI Capture Device**: Used to display the controlled computer's screen (hardware resolution fixed at 1920x1080)
- **Simplified Design**: Compared to JTUSBKVM's dual Arduino architecture, only one CH9329 module is required

### Software Features

#### Video Display Features
- **Video Streaming**: Displays the controlled computer's screen, supports USB HDMI Capture devices
- **Simulated Resolution Settings**: Multiple simulated resolutions available (1024x600, 1280x720, 1280x800, 1366x768, 1440x900, 1600x900, 1920x1080, 1920x1200, 2560x1440, 2560x1600, 2880x1800, 3200x1800, 3840x2160)
- **Automatic Aspect Ratio Adjustment**: Video display automatically adjusts based on the selected simulated resolution, maintaining correct screen aspect ratio
- **Coordinate Mapping**: Uses simulated resolution for mouse coordinate mapping calculations, ensuring precise coordinate correspondence
- **Video Zoom**: Supports 100% to 300% screen zoom functionality
- **Screenshot Function**: Can capture current video frame and download as image
- **Recording Function**: Can record video and download as video file (supports MP4/WebM formats)
- **Debug Information Display**: Real-time display of browser coordinates, simulated resolution coordinates, CH9329 coordinates, and other debug information

#### Keyboard Control Features
- **Full Keyboard Support**: Supports all standard keyboard key inputs
- **Function Keys**: Supports F1-F12 function keys
- **Modifier Keys**: Supports toggle operations for Win, Ctrl, Shift, Alt modifier keys
- **Special Keys**: Dedicated buttons for Space and Tab keys
- **Key Combinations**: Supports Ctrl+Alt+Del combination
- **Text Input Tool**: Supports batch text input function, simulates keyboard input character by character (English, numbers, symbols only)

#### Mouse Control Features
- **Dual Mode Support**:
  - **Relative Position Mode**: Smooth mouse movement (suitable for general operations)
  - **Absolute Position Mode**: Precise coordinate positioning (suitable for scenarios requiring precise clicking)
- **Button Support**: Supports mouse left, right, and middle buttons
- **Wheel Support**: Supports mouse wheel scrolling up and down
- **Coordinate Mapping**: Automatically maps screen coordinates to CH9329's 0-4096 coordinate range
- **Real-time Coordinate Display**: Debug mode allows real-time viewing of coordinate conversion information

#### Other Features
- **Cross-platform Support**: Supports Windows, Linux, macOS, with Chrome, Chromium, or Edge browsers
- **Pure Frontend Implementation**: No backend server required (only HTTP server needed for static files when running locally)
- **Settings Persistence**: Automatically saves video source, simulated resolution, mouse movement mode, and other settings
- **Visual Interface**: Video display area has white border for easy identification of display range

-----

## Hardware Requirements

### Required Hardware
- **CH9329 Module** x 1
  - Recommended baud rate: 115200 (default is 9600, requires manufacturer tool for configuration)
  - Serial packet interval: 1ms
- **HDMI Capture Device** x 1
  - HDMI capture device supporting USB video input
  - Hardware resolution fixed at 1920x1080
- **USB Cables**
  - USB cable connecting CH9329 module to control computer
  - USB cable connecting HDMI capture device to control computer

### Connection Method
1. **CH9329 Module**:
   - USB port → Control computer (via USB cable)
   - Module will be automatically recognized as HID keyboard/mouse device

2. **HDMI Capture Device**:
   - HDMI input → Controlled computer's HDMI output
   - USB output → Control computer's USB port

3. **Controlled Computer**:
   - Connect CH9329 module's USB output (HID mode) to the controlled computer
   - Note: CH9329 module needs to be configured in HID mode, not serial mode

-----

## System Requirements

### Control Computer
- **Operating System**: Windows 10/11, macOS, or Linux
- **Browser**: Chrome 89+, Chromium 89+, or Edge 89+ (requires Web Serial API and MediaStream API support)
- **Python**: 3.6+ (only for starting HTTP server when running locally)
- **OpenSSL**: For generating SSL certificates (only for local execution)

### Controlled Computer
- Any operating system supporting USB HID keyboard/mouse
- No software installation required

-----

## Installation and Usage

### Method 1: Local Execution (Recommended)

#### Windows
1. Download project files to local directory (e.g., `C:\Web-DYUSBKVM`)
2. Ensure Python 3.6+ and OpenSSL are installed
3. Navigate to `local_run` directory
4. Run `start_kvm.bat` as **Administrator**
5. Browser will automatically open Web-DYUSBKVM interface

#### Linux/macOS
1. Download project files to local directory (e.g., `/opt/web-dyusbkvm`)
2. Ensure Python 3.6+ and OpenSSL are installed
3. Navigate to `local_run` directory
4. Run `chmod +x start_kvm.sh` to grant execution permission
5. Run `./start_kvm.sh`
6. Browser will automatically open Web-DYUSBKVM interface

### Method 2: Online Execution (Requires Deployment)

Deploy files in the `web` directory to a Web server supporting HTTPS, then access directly through a browser.

-----

## Usage Instructions

### Connection Steps

1. **Connect Video Capture Device**
   - Click the "▶️ Connect" button in the "Video" area
   - Select your HDMI capture device
   - Video should display on the page (hardware resolution is 1920x1080)

2. **Set Simulated Resolution**
   - Select "Simulated Resolution" dropdown in the "Video" area
   - Choose resolution matching the controlled computer's screen (default is 1920x1080)
   - Video display will automatically adjust proportion based on simulated resolution
   - This setting is used for correct mouse coordinate mapping calculation

3. **Connect CH9329 Module**
   - Click the "🟢 Connect" button in the "Control" area
   - In the browser's device selection window, select your CH9329 module
   - After successful connection, control buttons will become enabled

4. **Select Mouse Movement Mode**
   - Select "Mouse Move Mode" dropdown in the "Video" area, or click "Mouse: Relative/Absolute" button in the "Control" area
   - **Relative**: Smooth mouse movement (suitable for general operations)
   - **Absolute**: Precise coordinate positioning (suitable for scenarios requiring precise clicking)

5. **Start Controlling**
   - Move mouse on the video screen, mouse cursor will synchronize to the controlled computer
   - Click mouse buttons to control the controlled computer
   - Use keyboard to input text
   - Use wheel to scroll pages

### Feature Description

#### Control Features
- **🟢 Connect / 🔴 Disconnect**: Connect/disconnect CH9329 module
- **Ctrl+Alt+Del**: Send Ctrl+Alt+Delete combination
- **F1-F12**: Click button to open function key menu, select function key to send
- **Win / Ctrl / Shift / Alt**: Toggle modifier key state (button shows active state)
- **Space / Tab**: Send Space or Tab key
- **Mouse: Relative/Absolute**: Toggle mouse movement mode between Relative and Absolute
- **🔄 Release**: Release all pressed modifier keys
- **📋 Paste**: Open text sending tool, can batch input text (English, numbers, symbols only)

#### Video Features
- **▶️ Connect / ⏹️ Disconnect**: Connect/disconnect video capture device
- **Simulated Resolution**: Select simulated resolution for coordinate mapping (video display automatically adjusts proportion)
- **Mouse Move Mode**: Select relative or absolute position mode
- **🔍＋ / 🔍－**: Zoom in/out video display (100% to 300%)
- **🖼️ Screenshot**: Capture current frame and download as image
- **🔴 Record / ⬛ Stop**: Record video and download as video file

#### Debug Features
- **Debug Information Display**: Display real-time coordinate information on video screen
  - Browser Coordinates: Mouse coordinates in browser
  - Simulated Resolution Coordinates: Coordinates mapped to simulated resolution
  - CH9329 Coordinates: Final coordinates sent to CH9329 (0-4096 range)
  - Simulated Resolution: Currently selected simulated resolution

-----

## CH9329 Module Configuration

### Important Settings

Before use, ensure the CH9329 module is correctly configured:

1. **Baud Rate**: Recommended setting is 115200 (default is 9600)
2. **Serial Packet Interval**: Set to 1ms
3. **Operating Mode**: Set to HID keyboard/mouse mode

### Configuration Method

Use the CH9329 manufacturer's configuration tool, or refer to CH9329 communication protocol documentation to send configuration commands via serial port.

-----

## Technical Architecture

### Frontend Technology
- **HTML + CSS + JavaScript**: Pure frontend implementation
- **Web Serial API**: Communication with CH9329 module
- **MediaStream API**: Receive HDMI capture device video

### Communication Protocol
- **CH9329 Binary Packet Format**: Uses standard CH9329 communication protocol
- **HID Key Code Mapping**: Converts browser keyboard events to HID keyboard scan codes
- **Mouse Coordinate Mapping**:
  - Hardware Resolution: Fixed at 1920x1080
  - Simulated Resolution: User-selected resolution for coordinate calculation
  - CH9329 Coordinates: Absolute coordinates mapped to 0-4096 range

### Coordinate Mapping Mechanism

1. **Hardware Level**: HDMI capture device fixed output 1920x1080 resolution
2. **Display Level**: Automatically calculates display scale based on selected simulated resolution, maintaining correct screen aspect ratio
3. **Coordinate Calculation**:
   - Mouse coordinates in browser → Map to simulated resolution coordinates
   - Simulated resolution coordinates → Map to CH9329's 0-4096 coordinate range
4. **Automatic Adjustment**: Video display size automatically adjusts based on simulated resolution, ensuring accurate coordinate mapping

### Main Differences from JTUSBKVM
1. **Hardware Architecture**: Uses CH9329 module instead of two Arduinos
2. **Communication Protocol**: Changed from text commands to CH9329 binary packets
3. **Feature Scope**: Removed terminal Console functionality, focused on HDMI capture + keyboard/mouse control
4. **Coordinate Mapping**: Uses simulated resolution for coordinate mapping, supports multiple resolution settings

-----

## File Structure

```
Web-DYUSBKVM/
├── web/
│   ├── index.html          # Main page (contains all UI and logic)
│   ├── js/
│   │   └── ch9329.js       # CH9329 communication module (packet generation, HID mapping)
│   └── logo.png            # Logo image
├── local_run/
│   ├── server.py           # HTTP server (simplified, provides static files and SSL)
│   ├── start_kvm.bat      # Windows startup script
│   └── start_kvm.sh       # Linux/macOS startup script
├── ch9329.md               # CH9329 protocol documentation (complete reference)
├── LICENSE                 # License file
└── README.md               # This documentation file
```

-----

## Important Notes

1. **CH9329 Configuration**:
   - Before first use, ensure CH9329 module is correctly configured in HID mode
   - Recommended baud rate: 115200 (default is 9600)
   - Serial packet interval: 1ms

2. **Browser Permissions**: On first connection, browser will request serial port and video permissions, please click "Allow"

3. **SSL Certificate**: Local execution uses self-signed certificate, browser will show security warning, please click "Advanced" → "Continue to proceed"

4. **Simulated Resolution Settings**:
   - **Simulated Resolution**: Select resolution matching the controlled computer's screen, used for coordinate mapping calculation
   - **Hardware Resolution**: Fixed at 1920x1080 (determined by HDMI capture device)
   - **Display Scale**: System automatically adjusts video display scale based on simulated resolution, maintaining correct screen aspect ratio
   - Selecting correct simulated resolution ensures precise mouse coordinate correspondence

5. **Mouse Movement Mode**:
   - **Relative Position (Relative)**: Suitable for general operations, smoother movement
   - **Absolute Position (Absolute)**: Suitable for scenarios requiring precise clicking, more precise coordinates
   - Switching modes automatically resets tracking position to avoid coordinate inconsistency
   - Can be toggled via button in Control area or dropdown in Video area

6. **Key Release**: When browser loses focus or switches tabs, all pressed keys are automatically released

7. **Coordinate Mapping**:
   - CH9329 internally uses 4096×4096 resolution
   - System automatically maps simulated resolution coordinates to this range
   - Debug mode allows real-time viewing of coordinate conversion process

8. **Text Input Limitations**:
   - Text sending tool only supports English, numbers, symbols
   - Does not support Chinese, Japanese, Korean, and other non-English characters
   - Warning prompt when inputting non-English characters

9. **Video Display**:
   - Video display area has white border for easy identification of display range
   - Video automatically adjusts display size based on simulated resolution, maintaining correct proportion
   - Supports 100% to 300% zoom functionality

10. **User Interface**:
    - Modern dark theme with Tailwind CSS-inspired color scheme
    - All styles are inline, no external dependencies
    - Responsive design with smooth transitions and animations

-----

## License

This project is licensed under the GNU Affero General Public License v3.0.

This project references the design of [JTUSBKVM](https://github.com/jasoncheng7115/JTUSBKVM), thanks to Jason Cheng for the open source contribution.

-----

## Disclaimer

This project is for learning, research, and personal use only. The developers provide no express or implied warranties regarding the completeness, stability, or suitability of this tool. Users assume all risks when using this tool.

-----

## Related Resources

- [JTUSBKVM Original Project](https://github.com/jasoncheng7115/JTUSBKVM)
- [CH9329 Communication Protocol Documentation](ch9329.md) (This project has compiled complete protocol documentation)
- [CH9329 Official Documentation](https://www.wch.cn/downloads/CH9329DS_PDF.html)
- [Web Serial API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [MediaStream API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)

## Technical Details

### CH9329 Protocol Implementation

This project fully implements the CH9329 protocol, including:

- **Keyboard Command (CMD 0x02)**: Supports 8+6 non-conflicting keys, complete modifier key support
- **Absolute Mouse Command (CMD 0x04)**: 7-byte data format, coordinates mapped to 0-4096 range
- **Relative Mouse Command (CMD 0x05)**: 5-byte data format, supports signed movement distance
- **HID Key Code Mapping**: Complete HID Page 0x07 key code table

For detailed protocol description, please refer to the [ch9329.md](ch9329.md) documentation.

### Detailed Coordinate Mapping Explanation

1. **Hardware Level**:
   - HDMI capture device fixed output 1920×1080 resolution
   - This is the actual resolution at the hardware level

2. **Simulated Resolution**:
   - Users can select multiple simulated resolutions (1024×600 to 3840×2160)
   - This resolution is used for coordinate mapping calculation, does not affect hardware output

3. **Display Level**:
   - System calculates display scale based on simulated resolution
   - Video display size automatically adjusts, maintaining correct screen aspect ratio
   - Example: When selecting 1280×800, video will scale down proportionally

4. **Coordinate Conversion Flow**:
   ```
   Browser Coordinates → Simulated Resolution Coordinates → CH9329 Coordinates (0-4096)
   ```
   - Mouse position in browser → Map to simulated resolution coordinates → Map to CH9329 internal coordinates

5. **Debug Information**:
   - Debug mode allows real-time viewing of coordinate conversion at each level
   - Helps verify if coordinate mapping is correct

## Donate

[![Donate with PayPal](https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png)](https://www.paypal.me/dannytwdanny)

