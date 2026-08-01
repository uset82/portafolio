<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/MicrocontrollerPiano/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# Microcontroller Piano

A compact digital piano built around the STM32 Nucleo-F767ZI board. Seven push buttons trigger PWM-generated notes while a dedicated record button captures up to five seconds of performance and plays it back through a buzzer or small speaker.

## Hardware Overview

- **Controller:** Nucleo-F767ZI (STM32F767ZIT6 MCU at 96 MHz)
- **Sound output:** PB8 (TIM4 CH3 PWM) routed to an active buzzer or amplified speaker
- **Record button:** PF12 (CN7 D8, active-low push button to ground)
- **Piano keys:** Seven normally-open buttons tied to ground when pressed, matching the mapping below with internal pull-ups enabled
- **Power:** USB ST-LINK connector or an external 5 V source routed through the Nucleo board

| Note | Frequency (Hz) | Nucleo Pin | Port | Pin |
| ---- | -------------- | ---------- | ---- | --- |
| C4   | 261.63         | D1         | PG   | 14  |
| D4   | 293.66         | D2         | PF   | 15  |
| E4   | 329.63         | D3         | PE   | 13  |
| F4   | 349.23         | D4         | PF   | 14  |
| G4   | 392.00         | D5         | PE   | 11  |
| A4   | 440.00         | D6         | PE   | 9   |
| B4   | 493.88         | D7         | PF   | 13  |


## Firmware Highlights

- Uses STM32Cube HAL within the PlatformIO build system (`stm32cube` framework)
- TIM4 is configured for PWM with a 1 MHz timer clock (PSC = 95); the ARR value is recomputed per note for accurate tuning
- Continuous polling loop scans the key matrix and updates the PWM duty cycle in real time
- Simple recorder stores a note index (or pause) every 10 ms into a 500 element buffer, yielding a 5 s clip that replays automatically once recording ends
- Playback reuses the same `set_note_from_index` helper, keeping the output path identical to live playing

## Build and Flash

1. Install [PlatformIO Core](https://docs.platformio.org/en/latest/core/installation.html) or use the VS Code PlatformIO extension.
2. Inside the project root (`MicrocontrollerPiano`), build the firmware:
   ```powershell
   pio run
   ```
3. Connect the Nucleo board over USB and flash:
   ```powershell
   pio run --target upload
   ```
4. (Optional) Open a serial monitor at 115200 baud for debug prints if you add them:
   ```powershell
   pio device monitor --baud 115200
   ```

The build configuration lives in `platformio.ini`. Key include paths (`./Inc`) and the external HSE frequency (8 MHz) are defined there.

## Using the Piano

- **Live play:** Press any of the seven note buttons; the firmware detects the first active key and outputs that note.
- **Record:** While idle, press the PF12 record button. A five-second capture starts immediately, storing both notes and rests.
- **Playback:** Recording transitions straight into playback. The captured clip is replayed once at the same tempo (10 ms resolution), then the system returns to idle.
- **Stop:** Playback stops automatically. To interrupt, reset the board or press the black user button on the Nucleo (if enabled in future updates).

## Customisation

- Adjust note frequencies or add sharps/flats by editing the `noteHz` table in `Src/main.c`.
- Extend recording duration by increasing `REC_MS` (be mindful of `rec_buf` size and RAM usage).
- Swap GPIO assignments by updating the `BTN_PORT` and `BTN_PIN` arrays.
- Switch to TIM support for stereo or volume control by modifying the PWM channel setup in `MX_TIM4_Init`.

## Project Structure

- `Src/main.c` – Core application logic, piano scan loop, recorder, and playback
- `Inc/main.h` – HAL includes and board pin definitions
- `Drivers/` – STM32 HAL and CMSIS dependencies provided by STM32CubeMX
- `STM32CubeIDE/` – Original CubeIDE project files (reference only; PlatformIO build uses the root sources)

## Testing and Future Work

- Hardware debounce or timer-based filtering could reduce switch chatter
- Add LED feedback during record/playback states to improve usability
- Consider integrating USB MIDI output to control external instruments or DAWs

Feel free to adapt the project for class demonstrations, embedded audio workshops, or as a starting point for more advanced digital instrument experiments.
