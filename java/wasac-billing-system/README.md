# WASAC Utility Billing System

Spring Boot REST API for Rwanda's national water (WASAC) and electricity (REG) unified postpaid billing.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Java 17, Spring Boot 3.3.0 |
| Security | Spring Security 6 + JWT (jjwt 0.12.3) |
| Database | PostgreSQL (JPA / Hibernate) |
| Docs | Springdoc OpenAPI 2.5.0 (Swagger UI) |
| Build | Maven |

---

## Quick Start

### 1. Create the database
```bash
psql -U paulin -c "CREATE DATABASE wasac_billing;" postgres
```

### 2. Run
```bash
mvn spring-boot:run
```

On first startup the system automatically:
- Creates all tables (`ddl-auto=create`)
- Seeds 4 roles + one admin account
- Installs PostgreSQL triggers and stored procedures

### 3. Open Swagger UI
```
http://localhost:8080/swagger-ui/index.html
```

---

## Default Admin

| Field | Value |
|-------|-------|
| Email | `admin@wasac.rw` |
| Password | `Admin@1234` |

---

## Roles

| Role | What they can do |
|------|-----------------|
| `ROLE_ADMIN` | Full access: users, customers, meters, tariffs, bill approval |
| `ROLE_OPERATOR` | Capture meter readings only |
| `ROLE_FINANCE` | Approve/reject bills, record payments |
| `ROLE_CUSTOMER` | View own bills, payments, notifications (only after admin approval) |

---

## How to Authenticate in Swagger

1. Call `POST /api/auth/login` with admin credentials
2. Copy `access_token` from the response
3. Click **Authorize** (top-right lock icon)
4. Enter: `Bearer <your-token>` → click **Authorize**

---

## Full Testing Flow

Follow these steps **in order**.

---

### Step 1 — Login as Admin

`POST /api/auth/login`
```json
{ "email": "admin@wasac.rw", "password": "Admin@1234" }
```
Authorize with the returned token.

---

### Step 2 — Configure Billing Rules

**Create tariff** `POST /api/tariffs`
```json
{
  "meter_type": "WATER",
  "tariff_type": "FLAT",
  "unit_price": 500,
  "effective_from": "2024-01-01"
}
```

**Create VAT** `POST /api/tax-configs`
```json
{ "name": "VAT", "rate": 0.18, "applies_to": "WATER", "is_active": true }
```

**Create service charge** `POST /api/service-charges`
```json
{ "name": "Maintenance Fee", "amount": 1000, "meter_type": "WATER", "is_active": true }
```

> **Bill formula:**
> `subtotal = (consumption × tariff rate) + service charge`
> `VAT = subtotal × 0.18`
> `total = subtotal + VAT + overdue penalty`

---

### Step 3 — Customer Self-Registration (New Flow)

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

Response includes `"customer_status": "INACTIVE"` — the account exists but billing is locked until admin approval.

**Admin approves the customer** `PATCH /api/customers/{id}/approve`

After approval, `"customer_status": "ACTIVE"` appears on login and billing features are unlocked.

> Admin can also create customers directly via `POST /api/customers` — those are ACTIVE immediately.

---

### Step 4 — Create a Meter (Admin)

`POST /api/meters`
```json
{
  "customer_id": 1,
  "meter_number": "WTR-001",
  "meter_type": "WATER",
  "installation_date": "2024-01-01"
}
```

---

### Step 5 — Create an Operator and Capture a Reading

**Create operator** `POST /api/users`
```json
{
  "full_names": "Bob Hakizimana",
  "email": "bob@wasac.rw",
  "phone_number": "0789000001",
  "password": "Bob@12345",
  "role": "ROLE_OPERATOR"
}
```

Login as operator → paste operator token in **Authorize**.

**Capture reading** `POST /api/meter-readings`
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

Rules enforced: meter must be ACTIVE · `current_reading > previous_reading` · one reading per meter per month.

---

### Step 6 — Generate and Approve a Bill (Admin/Finance)

Switch back to admin token.

**Generate bill** `POST /api/bills/generate`
```json
{ "meter_reading_id": 1 }
```

**Approve bill** `PATCH /api/bills/{id}/approve`

A `BILL_GENERATED` notification is automatically inserted by a PostgreSQL trigger.

---

### Step 7 — Record Payment (Finance)

**Create finance user** `POST /api/users` with `"role": "ROLE_FINANCE"`, login, authorize.

**Record payment** `POST /api/payments`
```json
{
  "bill_reference": "WASAC-2024-06-W-XXXXXXXX",
  "amount_paid": 30680,
  "payment_method": "MOBILE_MONEY",
  "payment_date": "2024-07-10"
}
```

- Partial payments keep the bill `APPROVED`
- Full payment (`outstanding_balance = 0`) sets bill to `PAID` and fires the `PAYMENT_CONFIRMED` trigger

---

### Step 8 — Customer Views Their Data

Login as the registered customer → authorize with customer token.

- `GET /api/bills/my` — own bills
- `GET /api/payments/my` — own payment history
- `GET /api/notifications/my` — BILL_GENERATED and PAYMENT_CONFIRMED messages

> All three endpoints return `"Your account is pending admin approval"` if the customer is still INACTIVE.

---

## Automated Monthly Billing

A scheduled job runs at **02:00 on the 1st of every month**. It scans all active meters, finds readings for the previous month, and auto-generates bills where none exist yet. Manual generation via Swagger works in parallel at any time.

---

## Database Routines (PostgreSQL)

| Routine | Type | Purpose |
|---------|------|---------|
| `generate_bill_reference(type, year, month)` | Stored procedure | Generates bill reference string |
| `fn_notify_on_bill_insert` + trigger | Trigger | Auto-inserts BILL_GENERATED notification on bill INSERT |
| `fn_notify_on_full_payment` + trigger | Trigger | Auto-inserts PAYMENT_CONFIRMED notification when balance reaches 0 |
| `get_monthly_billing_report(year, month)` | Stored procedure (cursor) | Returns full billing report for a period |

---

## Diagrams

| Artifact | Tool | File |
|----------|------|------|
| ERD (15 tables, DBML) | [dbdiagram.io](https://dbdiagram.io) | `diagrams/erd/wasac_billing_erd.dbml` |
| Flow diagram (Mermaid) | [mermaid.live](https://mermaid.live) | `diagrams/flow/wasac_billing_flow.md` |

Save exports → `diagrams/exports/erd/` and `diagrams/exports/flow/`
