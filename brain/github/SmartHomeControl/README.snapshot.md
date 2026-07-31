<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/SmartHomeControl/blob/master/README.md; checkedOn: 2026-07-31; redactions: 4 -->

# Smart Home Web App with FPGA Integration

A sophisticated Flask-based smart home web application that enables comprehensive device monitoring, control, and intelligent user interactions through an intuitive web interface. This project bridges the gap between software and hardware by integrating with FPGA devices (specifically NIOS II with DS3231 RTC) using serial communication protocols.

## Project Overview

This project creates a web-based control system for smart home devices connected to FPGA hardware. It features:

1. Real-time monitoring of temperature data from DS3231 RTC sensors
2. Control interface for FPGA-connected devices (lights and fans)
3. Voice command capabilities using OpenAI's Audio API
4. Integration with OpenWeatherMap for real-time weather data
5. Time and date display from the DS3231 real-time clock module

## Features

- **DS3231 RTC Integration**: Display time and date from DS3231 real-time clock connected to NIOS II FPGA
- **Temperature Monitoring**: Real-time temperature readings from FPGA-connected sensors
- **Voice Control**: Natural language processing for spoken commands using OpenAI's Audio API
- **Weather Integration**: Real-time weather data for Bergen, Norway from OpenWeatherMap
- **Device Control**: Control lights and fans connected to FPGA hardware
- **Spoken Feedback**: All responses can be spoken using Nova's friendly voice through OpenAI TTS
- **Intuitive UI**: Modern, responsive Bootstrap-based dark mode interface

## Technical Stack

- **Backend**: Flask web framework with Gunicorn WSGI server
- **Hardware Communication**: Serial communication with FPGA devices (NIOS II system)
- **Frontend**: Modern JavaScript (ES6+), Bootstrap 5 with dark theme
- **APIs**: 
  - OpenAI Audio API (speech recognition and text-to-speech)
  - OpenWeatherMap One Call API 3.0
- **Development**: Python 3.11+, Virtual environment management

## Project Architecture

### Backend Components

1. **Flask Application (`app.py`, `main.py`)**
   - Core web server implementation
   - API endpoint definitions for device control and data retrieval
   - Natural language command processing

2. **Serial Handler (`serial_handler.py`)**
   - Manages communication with FPGA device
   - Auto-detects available serial ports
   - Sends commands and receives data from the DS3231 RTC
   - Background monitoring for temperature updates

3. **OpenAI Audio Handler (`openai_audio.py`)**
   - Manages interactions with OpenAI's Audio API
   - Speech-to-text processing (transcription)
   - Text-to-speech conversion with voice customization
   - Uses the "nova" voice with friendly, cheerful tone

4. **Weather Service (`weather_service.py`)**
   - Interfaces with OpenWeatherMap API
   - Retrieves current weather data for Bergen, Norway
   - Provides temperature, conditions, and weather summaries

### Frontend Components

1. **Web Interface (`templates/index.html`)**
   - Responsive Bootstrap 5 dark-themed UI
   - Real-time updates for temperature, time, date, and weather
   - Device control buttons and status indicators

2. **JavaScript Modules**
   - `app.js`: Core application functionality
   - `voice_control.js`: Voice recognition and audio processing
   
3. **UI Features**
   - Connection management panel
   - DS3231 RTC time and date display
   - Temperature monitoring display
   - Weather conditions panel
   - Device control buttons
   - Voice command interface
   - Activity logging

### Communication Flow

1. User interacts with the web interface
2. Browser JavaScript sends requests to Flask API endpoints
3. Flask processes requests and interacts with appropriate services:
   - Serial Handler for FPGA communication
   - OpenAI Audio Handler for voice processing
   - Weather Service for weather data
4. Results are returned to the frontend and displayed to the user

## Requirements

- Python 3.11 or higher
- NIOS II FPGA system with DS3231 RTC (or compatible FPGA with serial interface)
- OpenAI API key (for voice recognition and text-to-speech)
- OpenWeatherMap API key (for weather data)

## API Integration

### OpenAI API

This project uses OpenAI's API for two key functionalities:

1. **Speech-to-Text (Whisper API)**
   - Converts spoken voice commands to text
   - Used with browser's audio capture for voice input
   - Model: whisper-1

2. **Text-to-Speech (TTS API)**
   - Converts text responses to spoken audio
   - Uses the "Nova" voice with a friendly, cheerful tone
   - Model: gpt-4o-mini-tts (optimized for cost efficiency)

#### OpenAI API Setup:

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create a new secret key
4. Ensure your account has access to Whisper API and TTS models
5. Check that you have available credits (usage is billed based on API calls)

### OpenWeatherMap API

The weather data integration uses OpenWeatherMap's One Call API 3.0:

1. **Weather Data Retrieval**
   - Current temperature, conditions, and forecast for Bergen, Norway
   - Default coordinates: 60.3913?N, 5.3221?E
   - Metric units (temperature in Celsius)
   - Updates cached every 10 minutes to reduce API calls

#### OpenWeatherMap API Setup:

1. Create an account at [OpenWeatherMap](https://openweathermap.org/)
2. Subscribe to the "One Call API 3.0" plan (free tier available)
3. Generate an API key in your account dashboard
4. Note that new API keys may take a few hours to activate

## Environment Variables

This application uses environment variables to securely store API keys:

- `OPENAI_API_KEY`: Your OpenAI API key for voice recognition and text-to-speech
- `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key for weather data
- `SESSION_SECRET`: (Optional) Secret key for Flask sessions, defaults to "smart_home_secret_key"

## Installation

### Prerequisites

Make sure you have the following prerequisites installed before proceeding:

- Python 3.11 or higher
- Git
- Internet access for API calls (OpenAI and OpenWeatherMap)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/smart-home-fpga.git
cd smart-home-fpga
```

### Step 2: Set Up a Virtual Environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### Step 3: Install Required Dependencies

Create a requirements.txt file with the following content:

```
flask>=3.1.0
flask-cors>=5.0.1
flask-sqlalchemy>=3.1.1
gunicorn>=23.0.0
pyserial>=3.5
serial>=0.0.97
openai>=1.68.2
requests>=2.32.3
```

Then install the dependencies:

```bash
pip install -r requirements.txt
```

### Step 4: Configure API Keys

The application requires API keys for OpenAI and OpenWeatherMap services. Set these as environment variables:

```bash
# Linux/macOS
export OPENAI_API_KEY=[REDACTED credential-like value]
export OPENWEATHER_API_KEY=[REDACTED credential-like value]

# Windows
set OPENAI_API_KEY=[REDACTED credential-like value]
set OPENWEATHER_API_KEY=[REDACTED credential-like value]
```

For persistent configuration, consider adding these to your shell profile or using a `.env` file with a package like python-dotenv.

### Step 5: Start the Application

For development:
```bash
python main.py
```

For production:
```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

### Step 6: Access the Web Interface

Open your browser and navigate to:
```
http://localhost:5000
```

### Testing Without FPGA Hardware

If you don't have physical FPGA hardware connected, the application will still function with limitations:
- The "Not connected to FPGA" warning will display
- Weather data and voice features will work if API keys are properly configured
- Temperature readings and device control will be unavailable
- System time and date will be used as fallbacks when requesting RTC information

## Hardware Setup

### FPGA Requirements

This project is designed specifically to work with NIOS II FPGA systems integrated with a DS3231 RTC module. The hardware requirements include:

1. **FPGA Development Board**:
   - Altera/Intel FPGA with NIOS II soft processor
   - Examples: DE-series boards (DE0, DE1, DE2, DE10)
   - Quartus Prime and NIOS II SBT for programming

2. **DS3231 RTC Module**:
   - I2C real-time clock module
   - Provides accurate time, date, and temperature readings
   - Connections: SCL, SDA, VCC (3.3V), GND

3. **Output Control Components**:
   - LEDs: Connected to GPIO pins for light control simulation
   - DC Fan: Connected through a transistor or relay for fan control
   - Recommended: ULN2003 or similar driver for higher current devices

4. **USB Communication**:
   - USB-UART Bridge (FTDI, CP2102, or built-in)
   - Serial configuration: 115200 baud, 8 data bits, no parity, 1 stop bit

### FPGA Firmware Requirements

The FPGA should be programmed with firmware that:

1. Implements I2C communication with the DS3231 RTC
2. Provides a simple serial command interface with these commands:
   - `LED_ON` / `LED_OFF`: Control the light
   - `FAN_ON` / `FAN_OFF`: Control the fan
   - Command `1`: Read temperature from DS3231
   - Command `2`: Read time from DS3231
   - Command `3`: Read date from DS3231

### Connection Guide

1. **Hardware Connections**:
   - Connect the DS3231 RTC module to the FPGA's I2C pins
   - Connect LEDs and fan control circuit to designated GPIO pins
   - Connect the FPGA to your computer via USB

2. **Identifying Serial Ports**:
   - Linux: Usually `/dev/ttyUSB0` or `/dev/ttyACM0`
   - Windows: Check Device Manager for COM ports (e.g., `COM3`)
   - macOS: Usually `/dev/tty.usbserial-*` or `/dev/tty.usbmodem*`

3. **Connection Process**:
   - Power on the FPGA and ensure the firmware is loaded
   - Launch the web application
   - The application will attempt to auto-detect FPGA devices using common identifiers
   - If auto-detection fails, enter the port name manually in the web interface
   - Expected format: Example responses: "Temperature: 24.50 ?C", "Current Time: 13:45:22", "Current Date: 23/03/2025 (Sunday)"

## Usage

### Web Interface

The web interface provides:

1. **Connection Panel**: Connect to your FPGA device by entering the serial port
2. **DS3231 RTC Panel**: View current time and date from the FPGA's RTC
3. **Temperature Panel**: Monitor current temperature readings
4. **Weather Panel**: Check current weather conditions in Bergen
5. **Device Controls**: Toggle lights and fans
6. **Voice Commands**: Use the microphone button or type commands
7. **Activity Log**: View history of actions and status updates

### Voice Commands

The system supports natural language commands such as:

- "Turn on the light"
- "Turn off the fan"
- "What's the temperature?"
- "What time is it?"
- "What's today's date?"
- "What's the weather in Bergen?"
- "Give me a smart home status update"

## Troubleshooting

### Common Issues and Solutions

#### 1. FPGA Connection Issues

**Symptoms**:
- "No serial ports found" message
- "Not connected to FPGA" warning remains visible
- Temperature readings show as "N/A"

**Solutions**:
- Verify the FPGA device is powered on and connected via USB
- Check that the correct drivers are installed for your FPGA development board:
  - Windows: Check Device Manager for COM ports or unknown devices
  - Linux: Run `lsusb` and `dmesg | grep tty` to verify USB detection
- Try manually entering the port name in the connection panel
- Verify the FPGA is programmed with the correct firmware
- Test the serial connection with another tool (e.g., PuTTY, screen, minicom)
- Ensure baud rate matches (default: 115200)

**Command Format Issues**:
- If commands are being sent but no response is received, verify that:
  - The FPGA firmware expects commands ending with a newline `\n`
  - The command format matches exactly: `LED_ON`, `LED_OFF`, `FAN_ON`, `FAN_OFF`
  - For RTC data, the command numbers `1`, `2`, and `3` work as expected

#### 2. API Authentication Issues

**OpenAI API Issues**:
- Voice commands don't work or return errors
- No speech feedback is provided

**Solutions**:
- Verify your OpenAI API key is set correctly as an environment variable
- Check if your OpenAI API key has sufficient credits
- Ensure your OpenAI account has access to the required models
- Look for error messages in the browser console (F12 Developer Tools)

**OpenWeatherMap API Issues**:
- Weather data shows "Unable to fetch weather information"
- Weather panel remains empty

**Solutions**:
- Confirm your OpenWeatherMap API key is valid and active
- Verify the API key has access to the One Call API 3.0 endpoint
- Check if you've exceeded your daily API call limit

#### 3. Browser-Specific Issues

**Voice Recognition Issues**:
- Microphone button doesn't work
- No audio is captured

**Solutions**:
- Ensure your browser has granted microphone permissions
- Try using Chrome or Edge, which have better WebRTC support
- Check that your microphone is working in other applications
- Disable browser extensions that might interfere with audio capture

**Interface Display Issues**:
- UI elements missing or misaligned
- Dark theme not displaying correctly

**Solutions**:
- Clear browser cache and reload
- Try a different browser
- Ensure all Bootstrap CSS and JS files are loading properly

#### 4. Network Connectivity Issues

- If accessing the application remotely and experiencing connectivity issues:
  - Ensure the server's firewall allows connections on port 5000
  - For Replit deployments, make sure your ISP doesn't block Replit URLs
  - If behind a corporate network, check if WebSocket connections are allowed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their Audio API
- OpenWeatherMap for their weather data API
- Bootstrap team for the UI framework

## Contact

For any questions or suggestions, please open an issue on GitHub or contact the project maintainer.
