<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/Automatic-Watering-Elephant/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# ?? Automatic Watering Elephant

[![Made with Arduino](https://img.shields.io/badge/Made%20with-Arduino-00979D?logo=arduino)](https://www.arduino.cc/)
[![PlatformIO](https://img.shields.io/badge/Built%20with-PlatformIO-orange)](https://platformio.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A dual-microcontroller autonomous plant watering system with a rotating table mechanism

**Course:** ADA525 - HW/SW System Design (Western Norway University of Applied Sciences)  
**Author:** Carlos Carpio  
**Date:** December 2025

---

## ?? Overview

The **Automatic Watering Elephant** is an IoT plant care system that autonomously waters two avocado plants using a rotating table mechanism. It features a decorative elephant figurine with a detachable "hat" that houses the sensor electronics.

### ? Features

- ?? **Rotating table** with 3D-printed gear mechanism
- ??? **Environmental monitoring** (temperature, humidity, soil moisture)
- ?? **OLED display** for real-time status
- ?? **Position learning** - set plant positions with buttons
- ?? **Automatic watering** with pump control
- ?? **Web-based serial plotter** for signal visualization

---

## ??? Architecture

```
???????????????????????     GPIO Signals      ???????????????????????
?   RP2350-Zero       ????????????????????????    Arduino Uno      ?
?   "The Brain"       ?   TABLE_READY        ?    "The Muscle"     ?
?                     ?   WATER_DONE         ?                     ?
?  ? DHT11 Sensor     ?                      ?  ? Stepper Motor    ?
?  ? Soil Moisture    ?                      ?  ? Pump Relay       ?
?  ? OLED Display     ?                      ?  ? Button Controls  ?
???????????????????????                      ???????????????????????
```

---

## ??? Hardware Requirements

| Component | Quantity | Purpose |
|-----------|----------|---------|
| Arduino Uno | 1 | Motor & pump control |
| RP2350-Zero | 1 | Sensors & display |
| 28BYJ-48 Stepper | 1 | Table rotation |
| ULN2003 Driver | 1 | Stepper driver |
| SSD1306 OLED | 1 | Status display |
| DHT11 | 1 | Temperature/humidity |
| Soil Moisture Sensor | 1 | Soil monitoring |
| 5V Relay Module | 1 | Pump control |
| Mini Water Pump | 1 | Water delivery |
| Push Buttons | 3 | User controls |

---

## ?? Project Structure

```
mesarota/
??? rotatingTable/          # Arduino Uno firmware
?   ??? src/main.cpp        # Motor, buttons, pump control
?   ??? platformio.ini      # PlatformIO config
?
??? elefante/               # RP2350-Zero firmware  
?   ??? src/main.cpp        # Sensors, OLED, communication
?   ??? platformio.ini      # PlatformIO config
?
??? PLOTTER ELEFANTE/       # Web-based serial plotter
?   ??? src/main.js         # Dual-port serial connection
?   ??? index.html          # UI layout
?   ??? package.json        # Node dependencies
?
??? WIRING_GUIDE.md         # Detailed wiring instructions
??? README.md               # This file
```

---

## ?? Getting Started

### Prerequisites

- [PlatformIO](https://platformio.org/install) (VS Code extension recommended)
- [Node.js](https://nodejs.org/) (for the plotter)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/automatic-watering-elephant.git
   cd automatic-watering-elephant
   ```

2. **Upload Arduino firmware:**
   ```bash
   cd rotatingTable
   pio run --target upload
   ```

3. **Upload RP2350 firmware:**
   ```bash
   cd ../elefante
   pio run --target upload
   ```

4. **Run the serial plotter (optional):**
   ```bash
   cd "../PLOTTER ELEFANTE"
   npm install
   npm run dev
   ```

---

## ?? Usage

### Position Learning Mode

1. **Power on** both controllers
2. **Hold Button A** ? Rotate table clockwise
3. **Click Button A** ? Save Position A (LED blinks 2x)
4. **Hold Button B** ? Rotate table counter-clockwise
5. **Click Button B** ? Save Position B (LED blinks 3x)

### Automatic Watering Cycle

After both positions are saved:
1. Table moves to **Position A** ? Waters for 3 seconds
2. Table moves to **Position B** ? Waters for 3 seconds
3. System enters **Sleep Mode**

### Reset

Press the **Reset Button** anytime to restart position learning.

---

## ?? Serial Plotter

The web-based plotter displays real-time sensor data:

- **Temperature** (?C)
- **Humidity** (%)
- **Soil Moisture** (ADC)
- **Motor Position** (degrees)
- **Pump Status** (ON/OFF)

Access at `http://localhost:5173` after running `npm run dev`.

---

## ?? Gallery

*Add images of your project here!*

---

## ?? License

This project is open source and available under the [MIT License](LICENSE).

---

## ?? Acknowledgments

- **Professor Frikk Fossdal** - Course instructor & [Read Serial Plot tool](https://experiment.frikkfossdal.com/)
- **Western Norway University of Applied Sciences** - ADA525 Course
- **MakerWorld** - Image-to-3D tool for elephant figurine

---

*Made with ?? for ADA525 HW/SW System Design*
