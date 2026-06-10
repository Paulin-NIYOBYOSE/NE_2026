// =============================================================================
// Smart Parking Management System — Kigali City Parking Authority
//
// Single-file C++17 implementation using in-memory data structures.
//
// Build : g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking
// Run   : ./parking
//
// See README.md for full documentation, OOP/DSA analysis, and test flows.
// =============================================================================

#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <unordered_map>
#include <queue>
#include <memory>
#include <limits>
#include <ctime>
#include <cmath>
#include <algorithm>
#include <sstream>

// ─────────────────────────────────────────────────────────────────────────────
// Vehicle type enum + string helper
// ─────────────────────────────────────────────────────────────────────────────

enum class VehicleType { Motorcycle, Car, Truck };

static std::string vehicleTypeName(VehicleType t) {
    switch (t) {
        case VehicleType::Motorcycle: return "Motorcycle";
        case VehicleType::Car:        return "Car";
        case VehicleType::Truck:      return "Truck";
    }
    return "Unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// Vehicle class hierarchy
//
// OOP principles demonstrated here:
//   - Abstraction   : Vehicle declares a pure-virtual interface; callers
//                     never need to know the concrete subtype.
//   - Inheritance   : Motorcycle, Car, Truck derive from Vehicle.
//   - Polymorphism  : getType() / getTypeName() dispatch at runtime via vtable.
//   - Encapsulation : licensePlate is protected; exposed only through getPlate().
// ─────────────────────────────────────────────────────────────────────────────

class Vehicle {
protected:
    std::string licensePlate;
public:
    explicit Vehicle(std::string plate) : licensePlate(std::move(plate)) {}
    virtual ~Vehicle() = default;

    const std::string& getPlate()    const { return licensePlate; }
    virtual VehicleType getType()    const = 0;   // pure virtual — makes class abstract
    virtual std::string getTypeName() const = 0;
};

class Motorcycle : public Vehicle {
public:
    explicit Motorcycle(std::string p) : Vehicle(std::move(p)) {}
    VehicleType getType()     const override { return VehicleType::Motorcycle; }
    std::string getTypeName() const override { return "Motorcycle"; }
};

class Car : public Vehicle {
public:
    explicit Car(std::string p) : Vehicle(std::move(p)) {}
    VehicleType getType()     const override { return VehicleType::Car; }
    std::string getTypeName() const override { return "Car"; }
};

class Truck : public Vehicle {
public:
    explicit Truck(std::string p) : Vehicle(std::move(p)) {}
    VehicleType getType()     const override { return VehicleType::Truck; }
    std::string getTypeName() const override { return "Truck"; }
};

// Factory: construct the correct polymorphic Vehicle from a type code.
static std::unique_ptr<Vehicle> createVehicle(VehicleType t, const std::string& plate) {
    switch (t) {
        case VehicleType::Motorcycle: return std::make_unique<Motorcycle>(plate);
        case VehicleType::Car:        return std::make_unique<Car>(plate);
        case VehicleType::Truck:      return std::make_unique<Truck>(plate);
    }
    return nullptr;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core data records
// ─────────────────────────────────────────────────────────────────────────────

enum class SlotStatus { Available, Occupied };

struct ParkingSlot {
    int         slotId  = 0;
    VehicleType accepts{};
    std::string zone;
    SlotStatus  status  = SlotStatus::Available;
};

// Represents a vehicle that is currently parked (live session).
struct ActiveSession {
    std::unique_ptr<Vehicle> vehicle;
    int         slotId    = 0;
    std::time_t entryTime = 0;
};

// Fee, rate, and duration are all frozen at exit time so future tariff
// changes never retroactively alter completed transaction records.
struct CompletedTransaction {
    std::string plate;
    VehicleType type{};
    int         slotId       = 0;
    std::time_t entryTime    = 0;
    std::time_t exitTime     = 0;
    long long   billedHours  = 0;
    double      rateApplied  = 0.0;
    double      totalFee     = 0.0;
};

// ─────────────────────────────────────────────────────────────────────────────
// Time helpers
// ─────────────────────────────────────────────────────────────────────────────

static std::string formatDateTime(std::time_t t) {
    std::tm tmv{};
#if defined(_WIN32)
    localtime_s(&tmv, &t);
#else
    localtime_r(&t, &tmv);
#endif
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M", &tmv);
    return std::string(buf);
}

static std::string formatDate(std::time_t t) {
    return formatDateTime(t).substr(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers — consistent visual style across all output
// ─────────────────────────────────────────────────────────────────────────────

namespace display {

    // Decorative separators
    static const int  W    = 64;
    static const char FILL = '-';

    static void ruler(char c = FILL) {
        std::cout << "  " << std::string(W, c) << "\n";
    }

    static void subHeader(const std::string& title) {
        std::cout << "\n";
        ruler();
        std::cout << "  " << title << "\n";
        ruler();
    }

    // Success / info message
    static void ok(const std::string& msg) {
        std::cout << "  [+] " << msg << "\n";
    }

    // Warning / error message
    static void err(const std::string& msg) {
        std::cout << "\n  [!] " << msg << "\n";
    }

    // Supplementary note (indented, no marker)
    static void note(const std::string& msg) {
        std::cout << "      " << msg << "\n";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Input & validation utilities  (namespace io)
//
// Every reader loops until the user provides valid input.
// The program never crashes on bad input.
// ─────────────────────────────────────────────────────────────────────────────

namespace io {

    static void flushInput() {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }

    // Read one trimmed line; returns false on EOF.
    static bool readLine(const std::string& prompt, std::string& out) {
        std::cout << prompt;
        if (!std::getline(std::cin, out)) return false;
        size_t a = out.find_first_not_of(" \t\r\n");
        size_t b = out.find_last_not_of(" \t\r\n");
        out = (a == std::string::npos) ? "" : out.substr(a, b - a + 1);
        return true;
    }

    // Loops until a non-empty string is entered.
    static std::string readNonEmpty(const std::string& prompt) {
        std::string s;
        while (true) {
            if (!readLine(prompt, s)) { flushInput(); continue; }
            if (!s.empty()) return s;
            display::err("Input cannot be empty. Please try again.");
        }
    }

    // Integer in [lo, hi] — rejects text, symbols, out-of-range, overflow.
    static long long readInt(const std::string& prompt, long long lo, long long hi) {
        std::string s;
        while (true) {
            if (!readLine(prompt, s)) { flushInput(); continue; }
            if (s.empty()) { display::err("Please enter a number."); continue; }
            try {
                size_t pos = 0;
                long long v = std::stoll(s, &pos);
                if (pos != s.size()) {
                    display::err("Invalid input — whole numbers only, no extra characters.");
                    continue;
                }
                if (v < lo || v > hi) {
                    std::cout << "  [!] Value must be between " << lo << " and " << hi << ".\n";
                    continue;
                }
                return v;
            } catch (...) {
                display::err("Invalid input — please enter a valid number.");
            }
        }
    }

    // Positive, finite, non-zero double (for tariff values).
    static double readPositiveDouble(const std::string& prompt) {
        std::string s;
        while (true) {
            if (!readLine(prompt, s)) { flushInput(); continue; }
            if (s.empty()) { display::err("Please enter a value."); continue; }
            try {
                size_t pos = 0;
                double v = std::stod(s, &pos);
                if (pos != s.size())            { display::err("Invalid number format."); continue; }
                if (std::isinf(v) || std::isnan(v)) { display::err("Value is not a valid number."); continue; }
                if (!(v > 0.0))                 { display::err("Rate must be greater than zero."); continue; }
                if (v > 1.0e9)                  { display::err("Rate is unrealistically large. Please try again."); continue; }
                return v;
            } catch (...) {
                display::err("Invalid input — please enter a valid positive number.");
            }
        }
    }

    // Menu selector for vehicle type (shows options, validates range).
    static VehicleType readVehicleType(const std::string& title) {
        std::cout << "\n  " << title << "\n"
                  << "    [1] Motorcycle\n"
                  << "    [2] Car\n"
                  << "    [3] Truck\n";
        long long c = readInt("  Select [1-3]: ", 1, 3);
        switch (c) {
            case 1: return VehicleType::Motorcycle;
            case 2: return VehicleType::Car;
            default: return VehicleType::Truck;
        }
    }

    static int daysInMonth(int year, int month) {
        static const int dim[] = {31,28,31,30,31,30,31,31,30,31,30,31};
        if (month == 2) {
            bool leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
            return leap ? 29 : 28;
        }
        return dim[month - 1];
    }

    // Read and validate a date-time string in "YYYY-MM-DD HH:MM" format.
    // Enforces: valid calendar date, year 2000-2100, no future timestamps.
    static std::time_t readDateTime(const std::string& label) {
        std::time_t now = std::time(nullptr);
        std::string s;
        while (true) {
            if (!readLine("  " + label + " (YYYY-MM-DD HH:MM): ", s)) {
                flushInput();
                continue;
            }
            int Y = 0, Mo = 0, D = 0, H = 0, Mi = 0;
            char d1 = 0, d2 = 0, colon = 0;
            std::istringstream ss(s);
            ss >> Y >> d1 >> Mo >> d2 >> D >> H >> colon >> Mi;
            if (ss.fail() || d1 != '-' || d2 != '-' || colon != ':') {
                display::err("Invalid format. Example: 2025-06-10 08:30");
                continue;
            }
            std::string trailing;
            if (ss >> trailing) {
                display::err("Unexpected characters after the time. Use: 2025-06-10 08:30");
                continue;
            }
            if (Y < 2000 || Y > 2100) {
                display::err("Year must be between 2000 and 2100.");
                continue;
            }
            if (Mo < 1 || Mo > 12) {
                display::err("Month must be between 01 and 12.");
                continue;
            }
            if (D < 1 || D > daysInMonth(Y, Mo)) {
                display::err("Day is out of range for the given month/year.");
                continue;
            }
            if (H < 0 || H > 23 || Mi < 0 || Mi > 59) {
                display::err("Time must be between 00:00 and 23:59.");
                continue;
            }
            std::tm tmv{};
            tmv.tm_year  = Y - 1900;
            tmv.tm_mon   = Mo - 1;
            tmv.tm_mday  = D;
            tmv.tm_hour  = H;
            tmv.tm_min   = Mi;
            tmv.tm_isdst = -1;
            std::time_t t = std::mktime(&tmv);
            if (t == static_cast<std::time_t>(-1)) {
                display::err("Could not interpret that date and time. Please try again.");
                continue;
            }
            if (t > now) {
                display::err("Date cannot be in the future. Current time: " + formatDateTime(now));
                continue;
            }
            return t;
        }
    }

} // namespace io

// ─────────────────────────────────────────────────────────────────────────────
// ParkingSystem — central manager
//
// Encapsulates all state and business logic.
//
// Data structures used:
//   slots          : unordered_map<int, ParkingSlot>            O(1) ID lookup
//   freeQueues     : unordered_map<int, queue<int>>             O(1) slot allocation per type
//   activeSessions : unordered_map<string, ActiveSession>       O(1) entry/exit by plate
//   transactions   : vector<CompletedTransaction>               O(1) append, O(n) traversal
//   tariffs        : unordered_map<int, double>                 O(1) rate lookup
// ─────────────────────────────────────────────────────────────────────────────

class ParkingSystem {

    // ── Private state ─────────────────────────────────────────────────────────
    std::unordered_map<int, ParkingSlot>           slots;
    std::unordered_map<int, std::queue<int>>       freeQueues;     // per VehicleType
    std::unordered_map<std::string, ActiveSession> activeSessions;
    std::vector<CompletedTransaction>              transactions;
    std::unordered_map<int, double>                tariffs;

    // VehicleType → int for use as map key
    static int typeKey(VehicleType t) { return static_cast<int>(t); }

    // Ceiling division: partial hours are always billed as full hours.
    static long long computeBilledHours(std::time_t entry, std::time_t exit) {
        double secs = std::difftime(exit, entry);
        if (secs <= 0.0) return 0LL;
        return static_cast<long long>(std::ceil(secs / 3600.0));
    }

public:

    // Default tariffs (RWF per hour).
    ParkingSystem() {
        tariffs[typeKey(VehicleType::Motorcycle)] =  500.0;
        tariffs[typeKey(VehicleType::Car)]        = 1000.0;
        tariffs[typeKey(VehicleType::Truck)]      = 2000.0;
    }

    // ── Task 1: Slot Configuration ────────────────────────────────────────────

    bool addSlot(int id, VehicleType type, const std::string& zone) {
        if (slots.count(id)) {
            display::err("Slot ID " + std::to_string(id) +
                         " already exists. Slot IDs must be unique.");
            return false;
        }
        ParkingSlot slot;
        slot.slotId  = id;
        slot.accepts = type;
        slot.zone    = zone;
        slot.status  = SlotStatus::Available;
        slots[id]    = slot;
        freeQueues[typeKey(type)].push(id);
        display::ok("Slot " + std::to_string(id) +
                    " added  |  Type: " + vehicleTypeName(type) +
                    "  |  Zone: " + zone);
        return true;
    }

    void listAllSlots() const {
        if (slots.empty()) {
            std::cout << "\n  No parking slots have been configured yet.\n";
            return;
        }
        display::subHeader("ALL PARKING SLOTS");
        std::cout << "  " << std::left
                  << std::setw(9)  << "Slot ID"
                  << std::setw(14) << "Type"
                  << std::setw(12) << "Zone"
                  << "Status\n";
        display::ruler();

        std::vector<int> ids;
        ids.reserve(slots.size());
        for (const auto& kv : slots) ids.push_back(kv.first);
        std::sort(ids.begin(), ids.end());

        int available = 0, occupied = 0;
        for (int id : ids) {
            const ParkingSlot& s = slots.at(id);
            bool avail = (s.status == SlotStatus::Available);
            avail ? ++available : ++occupied;
            std::cout << "  " << std::left
                      << std::setw(9)  << s.slotId
                      << std::setw(14) << vehicleTypeName(s.accepts)
                      << std::setw(12) << s.zone
                      << (avail ? "Available" : "Occupied") << "\n";
        }
        display::ruler();
        std::cout << "  Total: " << slots.size()
                  << "  |  Available: " << available
                  << "  |  Occupied: "  << occupied << "\n";
    }

    // ── Task 2: Vehicle Entry ─────────────────────────────────────────────────

    void registerEntry(const std::string& plate, VehicleType type,
                       std::time_t entryTime) {
        if (activeSessions.count(plate)) {
            display::err("Vehicle " + plate +
                         " is already parked. A vehicle cannot be assigned two slots.");
            return;
        }

        // Pull the next available slot for this type from the queue.
        // Stale entries (slots later occupied by a different path) are skipped.
        std::queue<int>& q = freeQueues[typeKey(type)];
        int chosenSlot = -1;
        while (!q.empty()) {
            int candidate = q.front();
            q.pop();
            auto it = slots.find(candidate);
            if (it != slots.end() && it->second.status == SlotStatus::Available) {
                chosenSlot = candidate;
                break;
            }
        }
        if (chosenSlot == -1) {
            display::err("No available " + vehicleTypeName(type) +
                         " slots right now. Entry cannot be completed.");
            return;
        }

        slots[chosenSlot].status = SlotStatus::Occupied;
        ActiveSession session;
        session.vehicle   = createVehicle(type, plate);
        session.slotId    = chosenSlot;
        session.entryTime = entryTime;
        activeSessions[plate] = std::move(session);

        display::ok(vehicleTypeName(type) + " " + plate +
                    "  →  Slot " + std::to_string(chosenSlot) +
                    "  |  Entry: " + formatDateTime(entryTime));
    }

    // ── Task 3 & 4: Vehicle Exit and Payment ──────────────────────────────────

    void registerExit(const std::string& plate, std::time_t exitTime) {
        auto it = activeSessions.find(plate);
        if (it == activeSessions.end()) {
            display::err("No active parking session found for plate: " + plate);
            return;
        }

        ActiveSession& session = it->second;
        if (exitTime <= session.entryTime) {
            display::err("Exit time (" + formatDateTime(exitTime) +
                         ") must be after entry time (" +
                         formatDateTime(session.entryTime) + "). Aborted.");
            return;
        }

        VehicleType type  = session.vehicle->getType();
        long long   hours = computeBilledHours(session.entryTime, exitTime);
        double      rate  = tariffs[typeKey(type)];   // current rate, frozen below
        double      fee   = static_cast<double>(hours) * rate;

        // Release the slot back into the free queue.
        slots[session.slotId].status = SlotStatus::Available;
        freeQueues[typeKey(type)].push(session.slotId);

        // Snapshot the transaction — immune to future tariff changes.
        CompletedTransaction tx;
        tx.plate       = plate;
        tx.type        = type;
        tx.slotId      = session.slotId;
        tx.entryTime   = session.entryTime;
        tx.exitTime    = exitTime;
        tx.billedHours = hours;
        tx.rateApplied = rate;
        tx.totalFee    = fee;
        transactions.push_back(tx);

        // ── Receipt ──────────────────────────────────────────────────────────
        const std::string SEP = "  " + std::string(44, '-');
        std::cout << "\n";
        std::cout << "  " << std::string(44, '=') << "\n";
        std::cout << "            PARKING RECEIPT\n";
        std::cout << "  " << std::string(44, '=') << "\n";
        std::cout << "  Plate         : " << plate << "\n";
        std::cout << "  Vehicle Type  : " << vehicleTypeName(type) << "\n";
        std::cout << "  Slot Number   : " << session.slotId << " (now released)\n";
        std::cout << SEP << "\n";
        std::cout << "  Entry Time    : " << formatDateTime(session.entryTime) << "\n";
        std::cout << "  Exit Time     : " << formatDateTime(exitTime) << "\n";
        std::cout << SEP << "\n";
        std::cout << "  Billed Hours  : " << hours
                  << " hr(s)  [partial hours rounded up]\n";
        std::cout << "  Rate / Hour   : " << std::fixed << std::setprecision(0)
                  << rate << " RWF\n";
        std::cout << SEP << "\n";
        std::cout << "  AMOUNT DUE    : " << std::fixed << std::setprecision(0)
                  << fee << " RWF\n";
        std::cout << "  " << std::string(44, '=') << "\n";

        activeSessions.erase(it);
    }

    // ── Task 3: Tariff Management ─────────────────────────────────────────────

    void updateTariff(VehicleType type, double newRate) {
        double oldRate = tariffs[typeKey(type)];
        tariffs[typeKey(type)] = newRate;
        display::ok(vehicleTypeName(type) + " tariff updated: " +
                    std::to_string(static_cast<int>(oldRate)) + " RWF  →  " +
                    std::to_string(static_cast<int>(newRate)) + " RWF/hr.");
        display::note("Existing completed transactions are not affected.");
    }

    void showTariffs() const {
        display::subHeader("CURRENT HOURLY TARIFFS");
        std::cout << "  " << std::left
                  << std::setw(18) << "Vehicle Type"
                  << "Rate (RWF / hr)\n";
        display::ruler();
        for (VehicleType vt : {VehicleType::Motorcycle, VehicleType::Car, VehicleType::Truck}) {
            std::cout << "  " << std::left << std::setw(18) << vehicleTypeName(vt)
                      << std::fixed << std::setprecision(0)
                      << tariffs.at(typeKey(vt)) << "\n";
        }
    }

    // ── Task 5: Reports ───────────────────────────────────────────────────────

    void reportAvailableSlots() const {
        display::subHeader("AVAILABLE PARKING SLOTS");
        std::vector<int> ids;
        for (const auto& kv : slots)
            if (kv.second.status == SlotStatus::Available)
                ids.push_back(kv.first);
        std::sort(ids.begin(), ids.end());

        if (ids.empty()) {
            std::cout << "  All slots are currently occupied.\n";
            return;
        }
        std::cout << "  " << std::left
                  << std::setw(10) << "Slot ID"
                  << std::setw(15) << "Type"
                  << "Zone\n";
        display::ruler();
        for (int id : ids) {
            const ParkingSlot& s = slots.at(id);
            std::cout << "  " << std::left
                      << std::setw(10) << s.slotId
                      << std::setw(15) << vehicleTypeName(s.accepts)
                      << s.zone << "\n";
        }
        display::ruler();
        std::cout << "  Available: " << ids.size()
                  << " of " << slots.size() << " total slot(s).\n";
    }

    void reportActiveParking() const {
        display::subHeader("CURRENTLY PARKED VEHICLES");
        if (activeSessions.empty()) {
            std::cout << "  No vehicles are currently parked.\n";
            return;
        }
        // Collect pointers and sort by entry time for a readable listing.
        std::vector<const ActiveSession*> sorted;
        sorted.reserve(activeSessions.size());
        for (const auto& kv : activeSessions)
            sorted.push_back(&kv.second);
        std::sort(sorted.begin(), sorted.end(),
                  [](const ActiveSession* a, const ActiveSession* b) {
                      return a->entryTime < b->entryTime;
                  });

        std::cout << "  " << std::left
                  << std::setw(14) << "Plate"
                  << std::setw(14) << "Type"
                  << std::setw(9)  << "Slot"
                  << "Entry Time\n";
        display::ruler();
        for (const ActiveSession* s : sorted) {
            std::cout << "  " << std::left
                      << std::setw(14) << s->vehicle->getPlate()
                      << std::setw(14) << s->vehicle->getTypeName()
                      << std::setw(9)  << s->slotId
                      << formatDateTime(s->entryTime) << "\n";
        }
        display::ruler();
        std::cout << "  Total parked: " << activeSessions.size() << " vehicle(s).\n";
    }

    void reportTransactionHistory() const {
        display::subHeader("COMPLETED TRANSACTION HISTORY");
        if (transactions.empty()) {
            std::cout << "  No completed transactions on record.\n";
            return;
        }
        std::cout << "  " << std::left
                  << std::setw(12) << "Plate"
                  << std::setw(13) << "Type"
                  << std::setw(6)  << "Slot"
                  << std::setw(17) << "Entry"
                  << std::setw(17) << "Exit"
                  << std::setw(5)  << "Hrs"
                  << std::setw(8)  << "Rate"
                  << "Fee (RWF)\n";
        display::ruler();
        double grandTotal = 0.0;
        for (const CompletedTransaction& tx : transactions) {
            std::cout << "  " << std::left
                      << std::setw(12) << tx.plate
                      << std::setw(13) << vehicleTypeName(tx.type)
                      << std::setw(6)  << tx.slotId
                      << std::setw(17) << formatDateTime(tx.entryTime)
                      << std::setw(17) << formatDateTime(tx.exitTime)
                      << std::setw(5)  << tx.billedHours
                      << std::setw(8)  << std::fixed << std::setprecision(0) << tx.rateApplied
                      << std::fixed << std::setprecision(0) << tx.totalFee << "\n";
            grandTotal += tx.totalFee;
        }
        display::ruler();
        std::cout << "  Records: " << transactions.size()
                  << "  |  All-time Revenue: "
                  << std::fixed << std::setprecision(0) << grandTotal << " RWF\n";
    }

    void reportDailyRevenue() const {
        display::subHeader("DAILY REVENUE SUMMARY");
        if (transactions.empty()) {
            std::cout << "  No transactions to report.\n";
            return;
        }
        // Group completed transactions by exit date.
        std::unordered_map<std::string, double> dailyRevenue;
        for (const CompletedTransaction& tx : transactions)
            dailyRevenue[formatDate(tx.exitTime)] += tx.totalFee;

        std::vector<std::string> days;
        days.reserve(dailyRevenue.size());
        for (const auto& kv : dailyRevenue) days.push_back(kv.first);
        std::sort(days.begin(), days.end());

        std::cout << "  " << std::left
                  << std::setw(14) << "Date"
                  << "Revenue (RWF)\n";
        display::ruler();
        double grandTotal = 0.0;
        for (const std::string& day : days) {
            double rev = dailyRevenue.at(day);
            std::cout << "  " << std::left << std::setw(14) << day
                      << std::fixed << std::setprecision(0) << rev << "\n";
            grandTotal += rev;
        }
        display::ruler();
        std::cout << "  Grand Total   "
                  << std::fixed << std::setprecision(0) << grandTotal << " RWF\n";
    }

    // ── Convenience accessors ─────────────────────────────────────────────────

    bool hasSlots()    const { return !slots.empty(); }
    int  activeCount() const { return static_cast<int>(activeSessions.size()); }
};

// ─────────────────────────────────────────────────────────────────────────────
// Console menus
// ─────────────────────────────────────────────────────────────────────────────

static void printMainMenu() {
    std::cout << "\n"
              << "  +--------------------------------------------------+\n"
              << "  |       SMART PARKING MANAGEMENT SYSTEM            |\n"
              << "  +--------------------------------------------------+\n"
              << "  |  [1]  Add New Parking Slot                       |\n"
              << "  |  [2]  View All Parking Slots                     |\n"
              << "  |  [3]  Register Vehicle Entry                     |\n"
              << "  |  [4]  Vehicle Exit & Payment                     |\n"
              << "  |  [5]  Update Parking Tariff                      |\n"
              << "  |  [6]  View Current Tariffs                       |\n"
              << "  |  [7]  Reports                                    |\n"
              << "  |  [0]  Exit                                       |\n"
              << "  +--------------------------------------------------+\n";
}

static void printReportsMenu() {
    std::cout << "\n"
              << "  +------------------------------------+\n"
              << "  |            REPORTS MENU            |\n"
              << "  +------------------------------------+\n"
              << "  |  [1]  Available Slots              |\n"
              << "  |  [2]  Currently Parked Vehicles    |\n"
              << "  |  [3]  Transaction History          |\n"
              << "  |  [4]  Daily Revenue Summary        |\n"
              << "  |  [0]  Back to Main Menu            |\n"
              << "  +------------------------------------+\n";
}

static void runReportsMenu(ParkingSystem& sys) {
    while (true) {
        printReportsMenu();
        long long c = io::readInt("  Select [0-4]: ", 0, 4);
        switch (c) {
            case 1: sys.reportAvailableSlots();     break;
            case 2: sys.reportActiveParking();      break;
            case 3: sys.reportTransactionHistory(); break;
            case 4: sys.reportDailyRevenue();       break;
            case 0: return;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

int main() {
    ParkingSystem sys;

    std::cout << "\n"
              << "  ====================================================\n"
              << "      Smart Parking Management System\n"
              << "      Kigali City Parking Authority\n"
              << "  ====================================================\n";
    sys.showTariffs();

    while (true) {
        printMainMenu();
        long long choice = io::readInt("  Select option [0-7]: ", 0, 7);

        switch (choice) {

            case 1: {   // Add parking slot
                long long id = io::readInt("  Enter unique Slot ID (1-999999): ", 1, 999999);
                VehicleType t = io::readVehicleType("Supported vehicle type:");
                std::string zone = io::readNonEmpty("  Zone label (e.g. A, B, North): ");
                sys.addSlot(static_cast<int>(id), t, zone);
                break;
            }

            case 2:     // View all slots
                sys.listAllSlots();
                break;

            case 3: {   // Vehicle entry
                if (!sys.hasSlots()) {
                    display::err("No parking slots configured. Add slots first (option 1).");
                    break;
                }
                std::string plate = io::readNonEmpty("  Vehicle plate number: ");
                VehicleType t = io::readVehicleType("Vehicle type:");
                std::time_t entry = io::readDateTime("Entry time");
                sys.registerEntry(plate, t, entry);
                break;
            }

            case 4: {   // Vehicle exit & payment
                std::string plate = io::readNonEmpty("  Plate of exiting vehicle: ");
                std::time_t exitT = io::readDateTime("Exit time");
                sys.registerExit(plate, exitT);
                break;
            }

            case 5: {   // Update tariff
                VehicleType t = io::readVehicleType("Vehicle type to reprice:");
                double rate   = io::readPositiveDouble("  New hourly rate (RWF): ");
                sys.updateTariff(t, rate);
                break;
            }

            case 6:     // View tariffs
                sys.showTariffs();
                break;

            case 7:     // Reports sub-menu
                runReportsMenu(sys);
                break;

            case 0:     // Exit
                std::cout << "\n"
                          << "  Thank you for using the Smart Parking Management System.\n"
                          << "  Goodbye.\n\n";
                return 0;
        }
    }
}
