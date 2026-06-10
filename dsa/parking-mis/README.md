# Smart Parking Management System

A fully console-based **Smart Parking Management System** for the Kigali City
Parking Authority. Built in **C++17** as a single `main.cpp` file with no
external dependencies. Demonstrates four OOP pillars and multiple DSA patterns.

---

## Table of Contents

1. [Build & Run](#build--run)
2. [Menu Reference](#menu-reference)
3. [Default Tariffs](#default-tariffs)
4. [OOP Concepts Used](#oop-concepts-used)
5. [Data Structures & Algorithms](#data-structures--algorithms)
6. [Validation Rules](#validation-rules)
7. [Complexity Analysis](#complexity-analysis)
8. [Sample Test Flow](#sample-test-flow)

---

## Build & Run

### Requirements
- GCC 7+ or Clang 5+ with C++17 support
- Standard library only — no third-party packages

### Compile
```bash
g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking
```

### Run
```bash
./parking
```

---

## Menu Reference

### Main Menu

| Option | Action |
|--------|--------|
| `[1]` | **Add New Parking Slot** — provide a unique ID, vehicle type, and zone label |
| `[2]` | **View All Parking Slots** — sorted table with current status and summary counts |
| `[3]` | **Register Vehicle Entry** — assign the next available slot to a vehicle |
| `[4]` | **Vehicle Exit & Payment** — compute fee, print receipt, and release the slot |
| `[5]` | **Update Parking Tariff** — change the hourly rate for a vehicle type |
| `[6]` | **View Current Tariffs** — display all three active rates |
| `[7]` | **Reports** — open the reports sub-menu |
| `[0]` | **Exit** |

### Reports Sub-Menu

| Option | Report |
|--------|--------|
| `[1]` | Available Slots — all free slots sorted by ID |
| `[2]` | Currently Parked Vehicles — active sessions sorted by entry time |
| `[3]` | Transaction History — completed records with a grand total |
| `[4]` | Daily Revenue Summary — revenue grouped and totalled by exit date |

---

## Default Tariffs

| Vehicle Type | Rate (RWF / hr) |
|--------------|-----------------|
| Motorcycle   | 500             |
| Car          | 1 000           |
| Truck        | 2 000           |

Rates can be changed at runtime via option `[5]`.

**Important:** The fee and rate are frozen into the transaction record at the
moment of exit. A subsequent tariff change never alters completed history.

**Billing rule:** Partial hours are always rounded **up** to the next full hour.
(Example: 1 h 20 min → billed as 2 hours.)

---

## OOP Concepts Used

### Abstraction
`Vehicle` is a pure-abstract base class with two pure-virtual methods
(`getType()`, `getTypeName()`). Callers work through the `Vehicle` interface
without knowing the concrete subtype.

### Inheritance
`Motorcycle`, `Car`, and `Truck` each inherit from `Vehicle` and provide
type-specific implementations.

### Polymorphism
Virtual dispatch resolves `getType()` and `getTypeName()` to the correct
concrete class at runtime. `ActiveSession` stores a `unique_ptr<Vehicle>`,
enabling polymorphic behaviour without object slicing.

### Encapsulation
- `Vehicle::licensePlate` is `protected`; external code accesses it only via
  the read-only `getPlate()` accessor.
- `ParkingSystem` keeps all five data structures private. Every state mutation
  goes through validated public methods — callers cannot corrupt internal state.

---

## Data Structures & Algorithms

| Name | Type | Purpose |
|------|------|---------|
| `slots` | `unordered_map<int, ParkingSlot>` | All configured slots keyed by unique ID — O(1) lookup |
| `freeQueues` | `unordered_map<int, queue<int>>` | FIFO queue of available slot IDs per vehicle type — O(1) FIFO allocation |
| `activeSessions` | `unordered_map<string, ActiveSession>` | Live sessions keyed by plate — O(1) duplicate check and exit lookup |
| `transactions` | `vector<CompletedTransaction>` | Append-only history — O(1) amortised append, O(n) traversal |
| `tariffs` | `unordered_map<int, double>` | Active hourly rate per vehicle type — O(1) lookup |

**Why a `queue` for free slots?**  
FIFO ordering gives fair (round-robin) slot allocation: the slot that became
free earliest is the next one allocated. Stale entries (edge-case duplicates)
are silently discarded on the next pop.

---

## Validation Rules

| Input | Rule |
|-------|------|
| Slot ID | Integer 1–999 999; must not already exist |
| Zone label | Non-empty string |
| License plate | Non-empty string |
| Date / time | Format `YYYY-MM-DD HH:MM`; valid calendar date; year 2000–2100; not in the future |
| Exit vs entry | Exit must be **strictly after** entry |
| Vehicle entry | Plate must not already have an active session |
| Slot availability | A free slot of the matching type must exist |
| Hourly rate | Positive finite number ≤ 1 000 000 000 |

The program **never crashes on invalid input**. Every prompt loops with a clear
error message until valid data is received.

---

## Complexity Analysis

Let *S* = total slots, *M* = active sessions, *T* = completed transactions,
*D* = distinct exit dates.

| Operation | Time | Space |
|-----------|------|-------|
| Add slot | O(1) avg | O(1) per slot |
| Vehicle entry (slot allocation) | O(1) amortised | O(1) per session |
| Vehicle exit (fee + release) | O(1) avg | O(1) per record |
| Update tariff | O(1) | O(1) |
| List all slots | O(S log S) — sorted output | O(S) |
| Available slots report | O(S log S) — filter + sort | O(S) |
| Active parking report | O(M log M) — sort by entry time | O(M) |
| Transaction history | O(T) traversal | O(T) |
| Daily revenue | O(T + D log D) | O(D) |

Overall space: **O(S + M + T)**.

---

## Sample Test Flow

```
# 1. Build and start
g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking && ./parking

# 2. Add slots (option 1 three times)
  ID: 101, Type: Car,        Zone: A
  ID: 201, Type: Motorcycle, Zone: B
  ID: 301, Type: Truck,      Zone: C

# 3. Register vehicle entries (option 3)
  Plate: RAB123A  Type: Car        Entry: 2026-06-10 08:00
  Plate: RAC456B  Type: Motorcycle Entry: 2026-06-10 09:30

# 4. Inspect active sessions
  Option 7 → [2] Currently Parked Vehicles

# 5. Process an exit (option 4)
  Plate: RAB123A  Exit: 2026-06-10 10:45
  → Duration: 2h 45m  → Billed: 3 hours
  → Fee: 3 × 1000 = 3 000 RWF

# 6. View daily revenue
  Option 7 → [4]
  → 2026-06-10 : 3 000 RWF

# 7. Update tariff and verify history is frozen (options 5, then 7→3)
  New Car rate: 1500
  → Transaction for RAB123A still shows 1 000 RWF/hr and fee 3 000 RWF

# 8. Error scenarios
  Option 1  → ID 101 again         → Slot ID already exists
  Option 3  → Plate RAC456B again  → Vehicle already parked
  Option 4  → Plate RAC456B, Exit 09:00 (before entry 09:30) → Invalid exit time
  Menu      → Enter "abc"          → Invalid input, re-prompted
``

mkdir -p ~/tmp
TMPDIR=~/tmp g++ -std=c++17 -Wall -Wextra -o parking main.cpp

TMPDIR=~/tmp g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking