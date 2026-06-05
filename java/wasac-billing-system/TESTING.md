# WASAC Utility Billing System — Test Scenario

Complete end-to-end test covering all required features. Run steps in order.

**Base URL:** `http://localhost:8080`  
**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

---

## Start the Server

```bash
mvn spring-boot:run
```

On first startup: tables are created, 4 roles seeded, admin account created, PostgreSQL triggers installed.

---

## STEP 1 — Login as Admin

`POST /api/auth/login`

```json
{
  "email": "admin@wasac.rw",
  "password": "Admin@1234"
}
```

**Copy `access_token` from response → click Authorize in Swagger → enter `Bearer <token>`**

---

## STEP 2 — Configure Tariffs (Task 4)

### 2a. Create Water Tariff (Flat Rate)

`POST /api/tariffs`

```json
{
  "meter_type": "WATER",
  "tariff_type": "FLAT",
  "unit_price": 500,
  "effective_from": "2024-01-01"
}
```

### 2b. Create Electricity Tariff (Tier-Based)

`POST /api/tariffs`

```json
{
  "meter_type": "ELECTRICITY",
  "tariff_type": "TIER_BASED",
  "effective_from": "2024-01-01",
  "tiers": [
    { "min_units": 0,   "max_units": 50,  "unit_price": 100 },
    { "min_units": 50,  "max_units": 200, "unit_price": 150 },
    { "min_units": 200, "max_units": null, "unit_price": 200 }
  ]
}
```

---

## STEP 3 — Configure Taxes, Service Charges & Penalties (Task 4)

### 3a. Create VAT

`POST /api/tax-configs`

```json
{
  "name": "VAT",
  "rate": 0.18,
  "applies_to": "ALL",
  "is_active": true
}
```

### 3b. Create Service Charge

`POST /api/service-charges`

```json
{
  "name": "Maintenance Fee",
  "amount": 1000,
  "meter_type": "WATER",
  "is_active": true
}
```

### 3c. Create Late Payment Penalty

`POST /api/penalties`

```json
{
  "name": "Late Payment Penalty",
  "penalty_type": "PERCENTAGE",
  "rate": 0.05,
  "days_overdue": 30,
  "is_active": true
}
```

---

## STEP 4 — Customer Self-Registration (Task 1 & 2)

`POST /api/auth/register`

```json
{
  "full_names": "Alice Uwimana",
  "email": "alice@example.com",
  "phone_number": "0781234567",
  "national_id": "1199780123456789",
  "address": "KG 123 St, Kigali",
  "password": "Alice@1234"
}
```

> Customer account is **ACTIVE immediately** after registration.  
> Response includes `"customer_status": "ACTIVE"`.

**Duplicate check:** Try registering with the same `national_id` or `email` — system returns 409 Conflict.

---

## STEP 5 — Create a Meter (Task 2)

Login as admin again. Use the `customer_id` returned from Step 4 (or `GET /api/customers` to find it).

`POST /api/meters`

```json
{
  "customer_id": 1,
  "meter_number": "WTR-KGL-001",
  "meter_type": "WATER",
  "installation_date": "2024-01-15"
}
```

> **Inactive meter rule:** Try `PATCH /api/meters/{id}/deactivate`, then attempt a reading — system blocks it.

---

## STEP 6 — Create Operator and Capture Meter Reading (Task 1 & 3)

### 6a. Create Operator User (as Admin)

`POST /api/users`

```json
{
  "full_names": "Bob Hakizimana",
  "email": "bob.operator@wasac.rw",
  "phone_number": "0789000001",
  "password": "Bob@12345",
  "role": "ROLE_OPERATOR"
}
```

### 6b. Login as Operator

`POST /api/auth/login`

```json
{
  "email": "bob.operator@wasac.rw",
  "password": "Bob@12345"
}
```

**Authorize Swagger with operator token.**

### 6c. Capture Meter Reading

`POST /api/meter-readings`

```json
{
  "meter_id": 1,
  "previous_reading": 0,
  "current_reading": 50,
  "reading_date": "2024-06-30",
  "reading_month": 6,
  "reading_year": 2024
}
```

> **Business rules enforced:**
> - `current_reading` must be greater than `previous_reading` — try equal values → 400 error
> - Try submitting a second reading for the same meter/month/year → 409 Conflict
> - Try reading on inactive meter → 400 error

---

## STEP 7 — Generate and Approve Bill (Task 5 & 6)

**Switch back to Admin token.**

### 7a. Generate Bill from Reading

`POST /api/bills/generate`

```json
{
  "meter_reading_id": 1
}
```

**Bill formula applied:**
```
consumption_amount = 50 units × 500 FRW = 25,000 FRW
subtotal           = 25,000 + 1,000 (service charge) = 26,000 FRW
VAT (18%)          = 26,000 × 0.18 = 4,680 FRW
total_amount       = 26,000 + 4,680 = 30,680 FRW
```

A **BILL_GENERATED** notification is automatically inserted by PostgreSQL trigger:
> *"Dear Alice Uwimana, Your June/2024 utility bill of 30,680.00 FRW has been successfully processed."*

### 7b. Approve the Bill

`PATCH /api/bills/{id}/approve`

---

## STEP 8 — Create Finance User and Record Payment (Task 5)

### 8a. Create Finance User (as Admin)

`POST /api/users`

```json
{
  "full_names": "Claire Ingabire",
  "email": "claire.finance@wasac.rw",
  "phone_number": "0789000002",
  "password": "Claire@1234",
  "role": "ROLE_FINANCE"
}
```

### 8b. Login as Finance

`POST /api/auth/login`

```json
{
  "email": "claire.finance@wasac.rw",
  "password": "Claire@1234"
}
```

**Authorize Swagger with finance token.**

### 8c. Record Partial Payment

`POST /api/payments`

```json
{
  "bill_reference": "WASAC-2024-06-W-XXXXXXXX",
  "amount_paid": 15000,
  "payment_method": "MOBILE_MONEY",
  "payment_date": "2024-07-10"
}
```

> Bill stays `APPROVED`, `outstanding_balance` drops to 15,680 FRW.

### 8d. Record Full Payment (clears balance)

`POST /api/payments`

```json
{
  "bill_reference": "WASAC-2024-06-W-XXXXXXXX",
  "amount_paid": 15680,
  "payment_method": "BANK_TRANSFER",
  "payment_date": "2024-07-15"
}
```

> Bill status → **PAID**. PostgreSQL trigger fires a **PAYMENT_CONFIRMED** notification:
> *"Dear Alice Uwimana, Your June/2024 utility bill of 30,680.00 FRW has been fully paid. Thank you!"*

---

## STEP 9 — Customer Views Their Data (Task 1 & 6)

### 9a. Login as Customer

`POST /api/auth/login`

```json
{
  "email": "alice@example.com",
  "password": "Alice@1234"
}
```

**Authorize Swagger with customer token.**

### 9b. View Own Bills

`GET /api/bills/my`

### 9c. View Payment History

`GET /api/payments/my`

### 9d. View Notifications (DB Trigger Messages)

`GET /api/notifications/my`

Expected: 2 notifications — BILL_GENERATED and PAYMENT_CONFIRMED.

### 9e. Mark Notification as Read

`PATCH /api/notifications/{id}/read`

---

## STEP 10 — Additional Admin Operations

### View All Customers

`GET /api/customers`

### View All Bills

`GET /api/bills`

### View Billing Report (Stored Procedure)

`GET /api/bills/report?year=2024&month=6`

### Tariff Versioning — Create New Version

`POST /api/tariffs` with a new `effective_from` date. Previous tariff's `effective_to` is set automatically to `(new date - 1 day)` and `is_current` → false. Old bills retain their historical tariff rate.

---

## Key Business Rules Summary

| Rule | Endpoint | Expected Error |
|------|----------|---------------|
| Duplicate email at registration | `POST /api/auth/register` | 409 Conflict |
| Duplicate National ID | `POST /api/auth/register` | 409 Conflict |
| Current reading ≤ previous reading | `POST /api/meter-readings` | 400 Bad Request |
| Two readings same meter+month+year | `POST /api/meter-readings` | 409 Conflict |
| Reading on inactive meter | `POST /api/meter-readings` | 400 Bad Request |
| Bill already exists for period | `POST /api/bills/generate` | 409 Conflict |
| Payment exceeds outstanding balance | `POST /api/payments` | 400 Bad Request |
| Operator accessing billing endpoints | Any `/api/bills` | 403 Forbidden |
| Customer accessing admin endpoints | Any `/api/users` | 403 Forbidden |

---

## Automated Monthly Billing

A scheduled job runs at **02:00 on the 1st of every month**. It automatically scans all active meters, finds readings for the previous month, and generates bills where none exist. Manual generation via Swagger works at any time alongside this scheduler.

---

## Database Routines Installed on Startup

| Routine | Trigger Event | Output |
|---------|---------------|--------|
| `fn_notify_on_bill_insert` | `INSERT` on `bills` | Inserts `BILL_GENERATED` notification |
| `fn_notify_on_full_payment` | `UPDATE` on `bills` (balance = 0) | Inserts `PAYMENT_CONFIRMED` notification |
| `generate_bill_reference()` | Called during bill generation | Returns formatted reference `WASAC-YYYY-MM-W/E-XXXXXXXX` |
| `get_monthly_billing_report()` | Called via reporting endpoint | Returns full billing summary for a month |
