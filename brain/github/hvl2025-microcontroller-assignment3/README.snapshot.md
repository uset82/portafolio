<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/hvl2025-microcontroller-assignment3/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# ELE201 H25 ? Assignment 3 (Microcontrollers)

A practical mini?project on STM32 Nucleo that turns temperature into fan control. You will read a TMP36 analog temperature sensor, use a potentiometer as a user control, drive a DC motor (fan) via PWM, and steer a small servo for visual feedback. The repo also includes a simple web plotter to visualize live data from the board.

---

## What You?ll Build

- Read temperature from a `TMP36` sensor with ADC and convert it to ?C.
- Drive a DC motor (fan) using PWM; speed increases with temperature.
- Use a potentiometer to:
  - Adjust sensitivity (gain) of the fan response.
  - Lower the start threshold (so the fan can respond at cooler room temps).
- Move a small servo to reflect the control level.
- Stream data over serial and visualize it in the included web plotter.

This project is organized into two exercises:
- `EXERCISE1`: Foundational sensor reading and basic output.
- `exercise2`: Full fan control loop with dynamic threshold and sensitivity.

---

## Repository Structure

- `EXERCISE1/` ? Intro exercise files.
- `exercise2/` ? Main firmware (`src/main.cpp`) for the fan control system.
- `fan_plotter/` ? Web app to visualize serial data from the board.
- `Assignment3_Report_backup_pre_restore.doc` ? Report document to accompany the assignment.
- `ELE201 H25 Assignment 3 - (Microcontrollers).pdf` ? Assignment handout.
- `Assignment3_Report_backup_pre_restore_files/` ? Assets referenced by the report.

---

## Hardware You Need

- `Nucleo-F767ZI` (STM32) development board.
- `TMP36` temperature sensor.
- `10k?` potentiometer.
- Small DC motor + driver (e.g., `L293D` or similar H?bridge).
- Small `SG90`-class servo (or similar).
- Breadboard, jumper wires, USB cable.

Pin mappings follow the platform configuration in `exercise2/src/main.cpp`. If you adapt pins, update the code accordingly.

---

## Quick Start

### Prerequisites
- PlatformIO (VS Code extension) or `pio` CLI.
- Node.js (for the web plotter).
- A Chromium?based browser (Chrome/Edge) for Web Serial.

### Build and Upload Firmware (exercise2)
1. Open the repo in VS Code with PlatformIO, or a terminal.
2. Build: `pio run -e nucleo_f767zi`
3. Upload: `pio run -e nucleo_f767zi -t upload`
4. Serial monitor at `115200` baud (PlatformIO: "Monitor").

### Run the Web Plotter
1. `cd fan_plotter`
2. `npm install`
3. `npm run dev`
4. Open the printed URL (e.g., `http://localhost:5173/`).
5. Click "Connect", choose the Nucleo serial port, and watch live charts.

---

## How It Works

### Temperature Conversion (TMP36)
- ADC reads the TMP36 voltage.
- The code converts ADC value to ?C using the TMP36 formula.
- An optional calibration offset can be applied (e.g., `TEMP_SENSOR_OFFSET`).

### Potentiometer Controls
- Sensitivity (gain): From near `1.0?` up to about `2.0?`. Higher gain makes the fan ramp faster with small temperature changes.
- Dynamic start threshold: The potentiometer can lower `TEMP_MIN` by up to about `8?C`, allowing activation at cooler ambient temps (e.g., 15?19?C rooms).

### Control Loop (exercise2)
- Compute a dynamic `tempMinDyn = TEMP_MIN - shift`, where `shift` depends on the potentiometer.
- Normalize temperature level against `[tempMinDyn, TEMP_MAX]`.
- Apply sensitivity gain from the potentiometer.
- Map the resulting level to PWM duty for the fan and a servo angle for feedback.
- Print a structured serial line containing temperature, level, PWM, servo, sensitivity, and threshold shift.

Example serial fields (simplified):
```
T: 18.6 C | Level: 0.32 | PWM: 82 | Servo: 45 | Sens: 1.60 x | Thr-Shift: -6.0 C
```

### Hysteresis and Stability
- The fan turns on when temperature rises above the dynamic threshold.
- It turns off when temperature falls below the threshold (with minor filtering to avoid chatter).

---

## Testing and Verification

- Pot at minimum:
  - Sensitivity near `1.0?` and `Thr-Shift` close to `0.0?C`.
  - The fan responds only when the sensor approaches the original `TEMP_MIN`.
- Pot at maximum:
  - Sensitivity near `2.0?` and `Thr-Shift` around `-8.0?C`.
  - The fan starts earlier (cooler temps), and ramps faster.
- Warm the sensor gently (touch or breath) and watch the serial/plotter:
  - `T` increases, `Level` and `PWM` rise, `Servo` follows.
  - `Sens` and `Thr-Shift` reflect your potentiometer position.

---

## Configuration Knobs (in `exercise2/src/main.cpp`)
- `TEMP_MIN` / `TEMP_MAX` ? Base activation range.
- `TEMP_SENSOR_OFFSET` ? Calibrate sensor readout.
- `mapPotToThresholdShift()` ? Change the max downward shift of the start threshold.
- `mapPotToSensitivity()` ? Change min/max gain of sensitivity.

Adjust these to match your room temperature and hardware characteristics.

---

## Troubleshooting

- Serial port not found:
  - Check USB cable, board power, and ST?LINK drivers.
- Fan doesn?t spin:
  - Verify H?bridge wiring and motor supply; confirm PWM pin.
- Temperature stuck ~15?19?C:
  - Use the potentiometer to lower the threshold (`Thr-Shift` becomes more negative).
- Plotter can?t connect:
  - Use Chrome/Edge, grant serial permission, and select the correct port.

---

## References

- Assignment PDF: `ELE201 H25 Assignment 3 - (Microcontrollers).pdf`
- Report document: `Assignment3_Report_backup_pre_restore.doc`
- Main firmware: `exercise2/src/main.cpp`
- Plotter app: `fan_plotter/`
