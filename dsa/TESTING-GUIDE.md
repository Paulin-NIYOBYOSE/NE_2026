# Testing Guide — Smart Parking Management System

This guide explains how to **compile and run** the program, the **default parking
rates**, **how to use each menu option**, and a set of **step-by-step test cases**
(including invalid-input tests) you can use to demonstrate every feature.

---

## 1. Compile & run

### Option A — simple

```bash
g++ main.cpp -o main
./main
```

### Option B — recommended (explicit standard + warnings)

```bash
g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking
./parking
```

No external libraries are needed (C++ standard library only).

---

## 2. Default parking rates (tariffs)

| Vehicle type | Default rate (RWF / hour)                                        |
| ------------ | ---------------------------------------------------------------- |
| Motorcycle   | 500                                                              |
| Car          | 1,000                                                            |
| Truck        | 2,000 _(not in brief — sensible default, editable via option 5)_ |

Billing rules:

- Fees are computed **only at exit**.
- **Partial hours are billed as full hours** (rounded up): 15 min → 1 h, 1 h 20 → 2 h.
- A price update affects **only future exits**; completed records keep their old rate.

---

## 3. Menu options reference

```
========== MAIN MENU ==========
 1) Configure parking slot   -> add a unique slot (ID, type, zone)
 2) List parking slots       -> show all slots + status
 3) Register vehicle entry   -> park a vehicle, auto-assign a matching slot
 4) Vehicle exit & payment   -> release slot, compute fee, print receipt, log
 5) Update parking prices    -> change active hourly rate of a vehicle type
 6) View current tariffs     -> show active rates
 7) Reports                  -> available slots / parked / history / revenue
 0) Exit program
```

Reports submenu (option 7):

```
 1) Available slots
 2) Parked vehicles
 3) Vehicle history
 4) Daily revenue
 0) Back
```

**Input formats**

- Numbers: plain integers/decimals (e.g. `1`, `1500`).
- Vehicle type: choose `1` Motorcycle, `2` Car, `3` Truck.
- Date/time: `YYYY-MM-DD HH:MM`, e.g. `2025-06-10 08:30` (must not be in the future).

---

## 4. Guided demo (happy path)

Run the program and enter the following in order:

| Step | Menu        | Inputs                                        | Expected result                       |
| ---- | ----------- | --------------------------------------------- | ------------------------------------- |
| 1    | `1`         | id `1`, type `2` (Car), zone `A`              | Slot 1 configured, Available          |
| 2    | `1`         | id `2`, type `1` (Motorcycle), zone `B`       | Slot 2 configured                     |
| 3    | `2`         | —                                             | Table lists slots 1 & 2 as Available  |
| 4    | `3`         | plate `RAB123C`, type `2`, `2025-06-10 08:00` | Car parked at slot 1                  |
| 5    | `4`         | plate `RAB123C`, `2025-06-10 09:20`           | Receipt: **2 h × 1000 = 2000 RWF**    |
| 6    | `7`→`4`→`0` | —                                             | Daily revenue `2025-06-10 : 2000 RWF` |

---

## 5. Feature-by-feature tests

### Task 1 — Slot configuration

- Add slot `1` Car zone A → success.
- Try adding slot `1` again → **rejected** (`Slot ID 1 already exists`).
- Option `2` → slot listed.

### Task 2 — Vehicle entry

- Park `RAB123C` (Car) in slot 1 → success.
- Park `RAB123C` again → **rejected** (cannot park twice).
- With no free Car slot, park another Car → **rejected** gracefully (no crash).

### Task 3 — Fees & price update

- Park then exit after `1h20` → billed **2 hours**.
- Option `5`: set Car to `1500`.
- Option `6`: tariffs show Car = 1500.
- Option `7`→`3`: a record completed before the change still shows **1000** (history unaffected).

### Task 4 — Exit & update

- Exit a parked vehicle → slot returns to **Available**, history gains a record.
- Option `7`→`1` confirms the slot is free again.

### Task 5 — Reports

- `7`→`1` available slots, `→2` parked vehicles, `→3` history, `→4` daily revenue.

---

## 6. Invalid-input tests (program must never crash)

| Test                  | Input                        | Expected message                                          |
| --------------------- | ---------------------------- | --------------------------------------------------------- |
| Non-numeric menu      | `abc` at main menu           | `Invalid input. Please enter a valid number.` + re-prompt |
| Out-of-range menu     | `9`                          | `Value must be between 0 and 7.`                          |
| Empty plate           | press Enter at plate prompt  | `Input cannot be empty.`                                  |
| Duplicate slot        | add id `1` twice             | `Slot ID 1 already exists.`                               |
| Double parking        | park same plate twice        | `cannot be parked twice.`                                 |
| Bad date format       | `10/06/2025`                 | `Invalid format. Use e.g. 2025-06-10 08:30`               |
| Invalid calendar date | `2025-02-30 10:00`           | `Day is invalid for the given month.`                     |
| Future date           | `2090-01-01 10:00`           | `cannot be in the future.`                                |
| Year out of range     | `1990-01-01 10:00`           | `Year must be between 2000 and 2100.`                     |
| Exit before entry     | exit `07:00` < entry `08:00` | `must be after entry time. Exit aborted.`                 |
| Negative price        | `-5` at price prompt         | `Price must be a positive number.`                        |
| Zero price            | `0`                          | `Price must be a positive number.`                        |
| Non-numeric price     | `xyz`                        | `Invalid input. Please enter a valid number.`             |
| Unknown plate exit    | `NOPLATE`                    | `No active parking found for plate NOPLATE.`              |

In every case the program prints a clear message and **re-prompts** instead of crashing.

---

## 7. One-shot automated test (optional)

You can pipe a scripted session to verify behaviour without typing manually:

```bash
printf '%s\n' \
'1' '1' '2' 'A' \
'3' 'RAB123C' '2' '2025-06-10 08:00' \
'4' 'RAB123C' '2025-06-10 09:20' \
'5' '2' '1500' \
'7' '3' '0' \
'0' | ./main
```

Expected highlights:

- Car `RAB123C` billed **2000 RWF** (2 h × 1000).
- After updating Car to 1500, history still shows the **1000** rate for that record.
