# System Architecture & Data Flow — Smart Parking Management System

This document describes how the Smart Parking Management System (`main.cpp`) is
structured and how data flows through it, using Mermaid diagrams.

---

## 1. High-level system architecture

The system is a single-process, in-memory C++ console application organised into
three layers: the **UI/menu layer**, the **input-validation layer**, and the
**core domain layer** (`ParkingSystem` + the `Vehicle` OOP hierarchy + storage).

```mermaid
flowchart TB
    User([User / Console])

    subgraph UI["UI Layer (main + menus)"]
        Main["main() — Main Menu loop"]
        Reports["reportsMenu()"]
    end

    subgraph Valid["Input Validation Layer (namespace io)"]
        ReadInt["readInt()"]
        ReadDouble["readPositiveDouble()"]
        ReadStr["readNonEmpty()"]
        ReadType["readVehicleType()"]
        ReadDate["readDateTime()"]
    end

    subgraph Core["Core Domain Layer (class ParkingSystem)"]
        Ops["Operations:\naddSlot / registerEntry /\nregisterExit / updatePrice / reports"]

        subgraph OOP["Vehicle Hierarchy (OOP)"]
            VBase["Vehicle (abstract)"]
            VMoto["Motorcycle"]
            VCar["Car"]
            VTruck["Truck"]
        end

        subgraph Store["In-Memory Storage"]
            Slots["slots\nunordered_map<int, ParkingSlot>"]
            FreeQ["freeByType\nunordered_map<type, queue<int>>"]
            Active["activeByPlate\nunordered_map<string, ActiveParking>"]
            Hist["history\nvector<ParkingRecord>"]
            Tariffs["tariffs\nunordered_map<type, double>"]
        end
    end

    User --> Main
    Main --> Reports
    Main --> Valid
    Reports --> Valid
    Valid --> Ops
    Ops --> Store
    Ops --> OOP
    VBase --> VMoto
    VBase --> VCar
    VBase --> VTruck
    Ops --> User
```

---

## 2. Component responsibilities

```mermaid
classDiagram
    class Vehicle {
        <<abstract>>
        #string plate
        +getPlate() string
        +type() VehicleType*
        +typeName() string*
    }
    class Motorcycle
    class Car
    class Truck
    Vehicle <|-- Motorcycle
    Vehicle <|-- Car
    Vehicle <|-- Truck

    class ParkingSlot {
        +int slotId
        +VehicleType supported
        +string zone
        +SlotStatus status
    }
    class ActiveParking {
        +unique_ptr~Vehicle~ vehicle
        +int slotId
        +time_t entryTime
    }
    class ParkingRecord {
        +string plate
        +VehicleType type
        +int slotId
        +time_t entryTime
        +time_t exitTime
        +long long billedHours
        +double rateApplied
        +double fee
    }
    class ParkingSystem {
        -unordered_map slots
        -unordered_map freeByType
        -unordered_map activeByPlate
        -vector history
        -unordered_map tariffs
        +addSlot()
        +registerEntry()
        +registerExit()
        +updatePrice()
        +reports()
    }

    ParkingSystem o-- ParkingSlot
    ParkingSystem o-- ActiveParking
    ParkingSystem o-- ParkingRecord
    ActiveParking o-- Vehicle
```

---

## 3. Data flow — Vehicle Entry (Task 2)

```mermaid
flowchart TD
    A([Select option 3: Register entry]) --> B{Any slots configured?}
    B -- No --> Z[Show: add a slot first]
    B -- Yes --> C[readNonEmpty: plate]
    C --> D[readVehicleType]
    D --> E[readDateTime: entry time]
    E --> F{Plate already active?}
    F -- Yes --> G[Reject: cannot park twice]
    F -- No --> H[Pop free slot from freeByType queue]
    H --> I{Available slot found?}
    I -- No --> J[Reject: no slot available]
    I -- Yes --> K[Mark slot Occupied]
    K --> L[Create Vehicle via factory]
    L --> M[Store in activeByPlate]
    M --> N([Confirm: parked at slot])
```

---

## 4. Data flow — Vehicle Exit & Fee (Tasks 3 & 4)

```mermaid
flowchart TD
    A([Select option 4: Vehicle exit]) --> B[readNonEmpty: plate]
    B --> C[readDateTime: exit time]
    C --> D{Plate found in activeByPlate?}
    D -- No --> E[Reject: no active parking]
    D -- Yes --> F{exit time > entry time?}
    F -- No --> G[Reject: exit aborted]
    F -- Yes --> H["billedHours = ceil(duration / 3600)"]
    H --> I["fee = billedHours x current tariff"]
    I --> J[Release slot -> Available, push to freeByType]
    J --> K[Freeze record into history\nrateApplied + fee]
    K --> L[Print receipt]
    L --> M[Erase from activeByPlate]
    M --> N([Done])
```

---

## 5. Data flow — Price Update (Task 3 rule)

Price updates change only the live `tariffs` map; historical records keep the
rate that was frozen at exit time.

```mermaid
flowchart LR
    A([Option 5: Update price]) --> B[readVehicleType]
    B --> C[readPositiveDouble: new rate]
    C --> D[tariffs type = newRate]
    D --> E([Future exits use new rate])
    H[(history records)] -.->|unchanged| H
```

---

## 6. Overall state lifecycle of a parking slot

```mermaid
stateDiagram-v2
    [*] --> Available: addSlot()
    Available --> Occupied: registerEntry() allocates slot
    Occupied --> Available: registerExit() releases slot
    Available --> [*]
```
