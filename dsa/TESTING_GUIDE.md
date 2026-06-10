# Testing Guide — Smart Parking Management System

Step-by-step instructions for verifying every feature, including happy-path
flows, edge cases, and invalid-input rejection tests.

---

## 1. Build

```bash
g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking
./parking
```

The program starts, shows the current tariffs, and displays the main menu.

---

## 2. Input Format Reference

| Field | Format / Notes |
|-------|----------------|
| Menu option | Single integer (e.g. `1`, `7`) |
| Vehicle type | `1` = Motorcycle, `2` = Car, `3` = Truck |
| Slot ID | Integer 1–999 999 |
| Plate number | Any non-empty string (e.g. `RAB123A`) |
| Date / time | `YYYY-MM-DD HH:MM` (e.g. `2026-06-10 08:30`), not in the future |
| Hourly rate | Positive decimal number |

---

## 3. Happy Path — Full Session

Follow these steps in order. Each step shows what to select and what to type.

### Step 1 — Add a Car slot
```
Main Menu: 1
  Slot ID: 101
  Vehicle type: 2   (Car)
  Zone: A
```
**Expected:** `[+] Slot 101 added | Type: Car | Zone: A`

---

### Step 2 — Add a Motorcycle slot
```
Main Menu: 1
  Slot ID: 201
  Vehicle type: 1   (Motorcycle)
  Zone: B
```
**Expected:** `[+] Slot 201 added | Type: Motorcycle | Zone: B`

---

### Step 3 — View all slots
```
Main Menu: 2
```
**Expected:** Table showing slots 101 and 201, both **Available**.

---

### Step 4 — Register a Car entry
```
Main Menu: 3
  Plate: RAB123A
  Vehicle type: 2   (Car)
  Entry time: 2026-06-10 08:00
```
**Expected:** `[+] Car RAB123A → Slot 101 | Entry: 2026-06-10 08:00`

---

### Step 5 — Register a Motorcycle entry
```
Main Menu: 3
  Plate: RAC456B
  Vehicle type: 1   (Motorcycle)
  Entry time: 2026-06-10 09:15
```
**Expected:** `[+] Motorcycle RAC456B → Slot 201 | Entry: 2026-06-10 09:15`

---

### Step 6 — View active sessions
```
Main Menu: 7 → 2
```
**Expected:** Two rows — RAB123A (08:00) listed before RAC456B (09:15).

---

### Step 7 — Process Car exit
```
Main Menu: 4
  Plate: RAB123A
  Exit time: 2026-06-10 10:45
```
**Expected receipt:**
```
  Billed Hours  : 3 hr(s)   (2h 45m → rounds up to 3)
  Rate / Hour   : 1000 RWF
  AMOUNT DUE    : 3000 RWF
```

---

### Step 8 — Confirm slot is free
```
Main Menu: 7 → 1
```
**Expected:** Slot 101 listed as available.

---

### Step 9 — View transaction history
```
Main Menu: 7 → 3
```
**Expected:** One record for RAB123A with 3 hrs at 1000 RWF = 3000 RWF.

---

### Step 10 — View daily revenue
```
Main Menu: 7 → 4
```
**Expected:**
```
  2026-06-10    3000
  Grand Total   3000 RWF
```

---

## 4. Tariff Update — History Freeze Test

Purpose: verify that changing a rate does **not** alter completed records.

```
# 1. Complete a Car session at default rate 1000
#    (e.g. 1 hour → fee 1000 RWF logged)

Main Menu: 5
  Vehicle type: 2   (Car)
  New rate: 1500

Main Menu: 7 → 3
```
**Expected:** The completed record still shows `rate 1000` and `fee 1000 RWF`,
not 1500. The new rate applies only to future exits.

---

## 5. Invalid Input Tests

The program must never crash. For each test below, enter the bad input at the
relevant prompt and confirm the expected error message appears, followed by
a re-prompt.

### 5.1 Menu selection

| Input | Expected message |
|-------|-----------------|
| `abc` | `Invalid input — whole numbers only` |
| `9` | `Value must be between 0 and 7` |
| `` (Enter) | `Please enter a number` |

---

### 5.2 Slot configuration

| Scenario | Action | Expected |
|----------|--------|----------|
| Duplicate slot ID | Add slot 101 twice | `Slot ID 101 already exists. Slot IDs must be unique.` |
| Empty zone | Press Enter at zone prompt | `Input cannot be empty.` |
| Slot ID = 0 | Enter `0` | `Value must be between 1 and 999999` |
| Slot ID = text | Enter `abc` | `Invalid input` |

---

### 5.3 Vehicle entry

| Scenario | Action | Expected |
|----------|--------|----------|
| Double parking | Park same plate twice | `Vehicle RAB123A is already parked` |
| No slot of type | Try Car when all Car slots occupied | `No available Car slots right now` |
| Empty plate | Press Enter | `Input cannot be empty` |

---

### 5.4 Date / time validation

| Input | Expected message |
|-------|-----------------|
| `10/06/2026` | `Invalid format. Example: 2025-06-10 08:30` |
| `2026-02-30 10:00` | `Day is out of range for the given month/year` |
| `2026-13-01 10:00` | `Month must be between 01 and 12` |
| `2026-06-10 25:00` | `Time must be between 00:00 and 23:59` |
| `1990-01-01 10:00` | `Year must be between 2000 and 2100` |
| Future timestamp | `Date cannot be in the future` |

---

### 5.5 Exit validation

| Scenario | Action | Expected |
|----------|--------|----------|
| Unknown plate | Exit `NOPLATE` | `No active parking session found for plate: NOPLATE` |
| Exit ≤ entry | Enter exit time at or before entry | `Exit time … must be after entry time … Aborted` |

---

### 5.6 Tariff input

| Input | Expected message |
|-------|-----------------|
| `-5` | `Rate must be greater than zero` |
| `0` | `Rate must be greater than zero` |
| `xyz` | `Invalid input — please enter a valid positive number` |
| `9999999999` | `Rate is unrealistically large` |

---

## 6. Automated Pipe Test

You can replay a scripted session without typing interactively:

```bash
printf '%s\n' \
  '1' '101' '2' 'A' \
  '1' '201' '1' 'B' \
  '3' 'RAB123A' '2' '2026-06-10 08:00' \
  '3' 'RAC456B' '1' '2026-06-10 09:15' \
  '4' 'RAB123A' '2026-06-10 10:45' \
  '5' '2' '1500' \
  '7' '3' '0' \
  '7' '4' '0' \
  '0' | ./parking
```

**Verify in the output:**
- Car RAB123A receipt shows **3 hours × 1000 = 3000 RWF**
- Transaction history still shows rate **1000** (not the updated 1500)
- Daily revenue shows **3000 RWF** for `2026-06-10`

---

## 7. Partial-Hour Rounding Check

| Entry | Exit | Duration | Billed hours | Fee (Car @ 1000) |
|-------|------|----------|-------------|-----------------|
| 08:00 | 08:01 | 1 min | 1 | 1 000 |
| 08:00 | 09:00 | 60 min | 1 | 1 000 |
| 08:00 | 09:01 | 61 min | 2 | 2 000 |
| 08:00 | 10:45 | 165 min | 3 | 3 000 |
| 08:00 | 12:00 | 240 min | 4 | 4 000 |
