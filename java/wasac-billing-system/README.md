# WASAC Utility Billing System

Spring Boot backend for Rwanda's national water (WASAC) and electricity (REG) unified postpaid billing.

---

## Quick Start

### Prerequisites
- Java 17+, Maven 3.8+, PostgreSQL running locally

### 1. Create the database
```sql
psql -U paulin -c "CREATE DATABASE wasac_billing;" postgres
```

### 2. Run
```bash
mvn spring-boot:run
```

On first run the system automatically:
- Creates all tables (`ddl-auto=create`)
- Seeds 4 roles + admin user
- Installs PostgreSQL triggers and stored procedures

### 3. Open Swagger UI
```
http://localhost:8080/swagger-ui/index.html
```

---

## Roles

| Role | What they can do |
|------|-----------------|
| ROLE_ADMIN | Full access: users, customers, meters, tariffs, bill approval |
| ROLE_OPERATOR | Capture meter readings only |
| ROLE_FINANCE | Approve/reject bills, record payments |
| ROLE_CUSTOMER | View own bills, payments, notifications |

---

## Testing Guide — follow this order

### Step 1 — Login as Admin
`POST /api/auth/login`
```json
{ "email": "admin@wasac.rw", "password": "Admin@1234" }
```
Copy `access_token` → click **Authorize** (top-right) → enter `Bearer <token>` → click **Authorize**.

---

### Step 2 — Configure billing rules

**Tariff** `POST /api/tariffs`
```json
{ "meterType": "WATER", "tariffType": "FLAT", "unitPrice": 500, "effectiveFrom": "2024-01-01" }
```

**VAT** `POST /api/tax-configs`
```json
{ "name": "VAT", "rate": 0.18, "appliesTo": "WATER", "isActive": true }
```

**Service charge** `POST /api/service-charges`
```json
{ "name": "Maintenance", "amount": 1000, "meterType": "WATER", "isActive": true }
```

> **Bill formula:**
> `subtotal = consumption × rate + service charge`
> `VAT = subtotal × 0.18`
> `total = subtotal + VAT + penalty (if overdue)`

---

### Step 3 — Register a Customer and Meter

**Customer** `POST /api/customers`
```json
{
  "fullNames": "Alice Uwimana",
  "nationalId": "1199780123456789",
  "email": "alice@example.com",
  "phoneNumber": "0781234567",
  "address": "KG 123 St, Kigali"
}
```

**Meter** `POST /api/meters`
```json
{ "customerId": 1, "meterNumber": "WTR-001", "meterType": "WATER", "installationDate": "2024-01-01" }
```

---

### Step 4 — Create an Operator and capture a reading

**Create operator** `POST /api/users`
```json
{
  "fullNames": "Bob Hakizimana",
  "email": "bob@wasac.rw",
  "phoneNumber": "0789000001",
  "password": "Operator@1",
  "roleName": "ROLE_OPERATOR"
}
```

Login as operator → paste operator token in **Authorize**.

**Capture reading** `POST /api/meter-readings`
```json
{
  "meterId": 1,
  "previousReading": 0,
  "currentReading": 50,
  "readingDate": "2024-06-30",
  "readingMonth": 6,
  "readingYear": 2024
}
```

Rules enforced: meter must be ACTIVE · current > previous · one reading per meter per month.

---

### Step 5 — Generate and Approve a Bill

Switch back to admin token.

**Generate** `POST /api/bills/generate`
```json
{ "meterReadingId": 1 }
```

**Approve** `PATCH /api/bills/{id}/approve`

A `BILL_GENERATED` notification is inserted by PostgreSQL trigger automatically.

---

### Step 6 — Record Payment

**Create finance user** `POST /api/users` with `"roleName": "ROLE_FINANCE"`, login, authorize.

**Payment** `POST /api/payments`
```json
{
  "billReference": "WASAC-2024-06-W-XXXXXXXX",
  "amountPaid": 30000,
  "paymentMethod": "MOBILE_MONEY",
  "paymentDate": "2024-07-10"
}
```

- Partial payments keep the bill `APPROVED`.
- Bill becomes `PAID` when `outstandingBalance = 0` — triggers `PAYMENT_CONFIRMED` notification.

---

### Step 7 — View Notifications as Customer

Link a user account to the customer via `PUT /api/customers/{id}` (include `userId`), login as that user.

`GET /api/notifications/my` → see auto-generated messages from the PostgreSQL triggers.

---

## Automated Monthly Billing

A scheduled job runs at **02:00 on the 1st of every month**. It scans every active meter, finds readings for the previous month, and auto-generates bills where none exist yet. Manual generation via Swagger still works at any time.

---

## Diagrams

| Artifact | Tool | File |
|----------|------|------|
| ERD (15 tables) | [dbdiagram.io](https://dbdiagram.io) | `diagrams/erd/wasac_billing_erd.dbml` |
| Flow diagram | [mermaid.live](https://mermaid.live) | `diagrams/flow/wasac_billing_flow.md` |

Save exports to `diagrams/exports/erd/` and `diagrams/exports/flow/`.
