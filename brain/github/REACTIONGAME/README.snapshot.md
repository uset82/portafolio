<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/REACTIONGAME/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# Reaction Game on STM32F767 (Nucleo‑F767ZI)

https://www.tiktok.com/@carloscarpio82/video/7552605792403262742?is_from_webapp=1&sender_device=pc&web_id=7490154445721781782

A simple two‑player reflex game built with STM32Cube HAL and PlatformIO. Two players each have one push button and one LED. A separate "reflex" LED turns on after a random delay. As soon as the reflex LED turns on, the first player to press their button wins the round and their LED turns on. If any player presses too early (before the reflex LED turns on), the other player wins.

This repo also includes small debug helpers (startup LED test, heartbeat, input mirroring) so you can verify your wiring quickly in the lab.

## What’s in this project

- STM32Cube HAL bare‑metal project (C)
- PlatformIO configuration for Nucleo‑F767ZI
- GPIO configuration and an EXTI example
- Ready‑to‑use pin macros in `Inc/main.h`
- Minimal main loop with:
  - Heartbeat on LD2 to prove the MCU is running
  - Input→LED mirroring (helps you test buttons and LEDs)
  - Optional EXTI interrupt demo on PE13 (toggles a debug LED)

## Hardware at a glance

The circuit uses 2 push buttons, 3 LEDs, and 5 resistors:
- Player 1: 1 button + 1 LED (with current‑limit resistor) + 1 pull‑up resistor (10 kΩ)
- Player 2: 1 button + 1 LED (with current‑limit resistor) + 1 pull‑up resistor (10 kΩ)
- Reflex LED: 1 LED + 1 current‑limit resistor

Buttons are wired active‑low (external 10 kΩ pull‑up to 3V3). Pressing a button pulls the GPIO input to GND.

## Pin map (Nucleo‑F767ZI)

Current firmware maps the following signals. Arduino D‑pin numbers are shown in parentheses for convenience.

Inputs (active‑low, external pull‑ups):
- Player 1 button → PB8 (D15)
- Player 2 button → PB9 (D14)

Player LEDs (push‑pull outputs):
- P1 LED → PF13 (D7)  — named `LED_O` (orange)
- P2 LED → PE9  (D6)  — named `LED_R` (red)

Reflex LED options:
- Recommended (matches many lab boards): On‑board LD3 (PB14, red). Already defined by Cube as `LD3_Pin` on `GPIOB`.
- Alternatively: an external LED on PE11 (D5) — named `LED_G` (green) in this project and used as a debug LED by default.

Other useful signals:
- Heartbeat LED → LD2 (PB7, blue) blinks every 500 ms so you know the firmware is alive.
- EXTI demo input → PE13 (no pull, falling edge). Pressing PE13 toggles the debug LED (`LED_G` on PE11).

You can find these macros in `Inc/main.h`:
- `P1_Pin`/`P1_GPIO_Port` (PB8)
- `P2_Pin`/`P2_GPIO_Port` (PB9)
- `LED_O_Pin`/`LED_O_GPIO_Port` (PF13)
- `LED_R_Pin`/`LED_R_GPIO_Port` (PE9)
- `LED_G_Pin`/`LED_G_GPIO_Port` (PE11)
- `LD2_Pin`/`LD2_GPIO_Port` (PB7) and `LD3_Pin`/`LD3_GPIO_Port` (PB14) from the Cube templates

## How the game works (logic)

- After reset, the system performs a quick LED test (each external LED blinks once) and starts the heartbeat on LD2.
- The game then waits for a random delay (0–20 s).
- When the random time elapses, the Reflex LED (LD3) turns on.
- If any player presses before the Reflex LED is on → that’s a false start, so the other player wins and their LED turns on.
- If both press after the Reflex LED turns on, the one detected first wins. The game stops after each round; press the black reset button to play again.

Tip: Use a small debounce (10–20 ms) to avoid false triggers from mechanical bounce. The first stable press after the LED turns on should determine the winner.

### Suggested state machine

1) INIT → 2) WAIT_RANDOM → 3) REFLEX_ON → 4) WAIT_WINNER → 5) SHOW_RESULT → END (reset to replay)

Edge cases:
- False start: In WAIT_RANDOM, if P1 or P2 goes low, the other player wins immediately.
- Tie: If both presses arrive in the same tick/ISR, pick a policy (e.g., P1 wins ties, or rerun).

## Implementing the random delay

Your assignment mentions a `generateRandomNumber()` helper. You can also use a simple linear congruential generator (LCG) if you don’t want to configure the hardware RNG:

```c
// Minimal LCG; good enough for a classroom random delay.
static uint32_t rng_state = 0x12345678u;  // will be reseeded
static inline void rng_seed(uint32_t s) { rng_state = (s ? s : 1u); }
static inline uint32_t rng_next(void) { rng_state = rng_state * 1664525u + 1013904223u; return rng_state; }

// Call once after HAL_Init; a decent seed is the SysTick value after plugging in.
rng_seed(HAL_GetTick());

// Random delay between 0 and max_ms (e.g., 20000 for 20 s)
uint32_t random_delay_ms(uint32_t max_ms) { return rng_next() % max_ms; }
```

Example usage in your main loop:

```c
uint32_t delay = random_delay_ms(20000u); // 0–20 s
uint32_t start  = HAL_GetTick();
while ((HAL_GetTick() - start) < delay) {
  // detect false start: if P1 or P2 goes LOW here, the other wins
}
// Time’s up → turn Reflex LED (LD3) ON and wait for first valid press
```

If your board has the hardware RNG enabled, you can alternatively use it via HAL once it’s initialized.

## Building and flashing (Windows PowerShell)

- Build

```powershell
pio run
```

- Upload (ST‑LINK)

```powershell
pio run --target upload
```

If ST‑LINK occasionally reports `Error: open failed`, close any other ST tools (CubeProgrammer, another VS Code window), unplug/replug the USB, and retry. Updating the ST‑LINK firmware via STM32CubeProgrammer can also help. As a robust alternative for labs, you can switch to mass‑storage upload by setting `upload_protocol = mbed` in `platformio.ini`.

## What the current firmware does out of the box

This repo currently focuses on verifying your hardware wiring quickly:
- Startup LED test on the three external LEDs (PF13 → PE9 → PE11)
- Heartbeat on LD2 (PB7)
- Input→LED mirroring:
  - PB8 low → PF13 ON
  - PB9 low → PE9 ON
- EXTI demo: PE13 falling edge toggles PE11

Adapting this to the assignment is straightforward:
- Use on‑board LD3 (PB14) as the Reflex LED in your game logic.
- Use PF13 for Player 1’s indicator and PE9 for Player 2’s indicator.
- Replace the input‑mirroring section with the state machine shown above.

## Changing pins or polarity

- Inputs are configured with no internal pulls. Your buttons should provide external 10 kΩ pull‑ups (idle HIGH). If you must use internal pulls instead, change PB8/PB9 to `GPIO_PULLUP` in `MX_GPIO_Init` and keep active‑low logic.
- To make Reflex LED use LD3 (PB14), just drive `LD3_GPIO_Port/LD3_Pin` in your game code.
- To change the EXTI trigger on PE13, replace `GPIO_MODE_IT_FALLING` with `GPIO_MODE_IT_RISING` or `GPIO_MODE_IT_RISING_FALLING`.

## Repo layout

- `Src/` and `Inc/`: application sources and headers (CubeMX style)
- `Drivers/`: STM32 HAL and CMSIS
- `platformio.ini`: PlatformIO configuration (board, framework, linker script)
- `STM32F767ZITX_FLASH.ld`: linker script (tweaked to build with GCC 7)

## Troubleshooting checklist

- Heartbeat LED doesn’t blink: check power and that `LD2` is defined as PB7 in `Inc/main.h`.
- A player LED never turns on: verify the LED polarity and resistor, and confirm you’re driving the correct GPIO (PF13 or PE9).
- Button doesn’t register: measure PB8/PB9; should be ~3.3 V idle and ~0 V when pressed. Add debouncing if the LED flickers.
- Upload failures: disconnect other ST‑LINK users, replug USB, update ST‑LINK firmware, or switch `upload_protocol` to `mbed`.

## Extension ideas (for learning)

- Add software debounce with a 10–20 ms filter.
- Display reaction times on UART (ST‑Link VCP) or a 7‑segment/HD44780 LCD.
- Play multiple rounds and keep score.
- Use hardware RNG peripheral for the random delay.

Have fun, and share improvements back so others can learn from your approach! 🎮
