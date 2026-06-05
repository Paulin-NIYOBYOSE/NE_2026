# WASAC Utility Billing System

A secure, automated **Utility Billing System** for the Rwanda Water and Sanitation Corporation (WASAC) and Rwanda Energy Group (REG), built with **Spring Boot** and backed by **PostgreSQL**.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Business Rules](#6-business-rules)
7. [Database Routines](#7-database-routines)
8. [Roles & Permissions](#8-roles--permissions)
9. [Validation Rules](#9-validation-rules)
10. [Prerequisites & Setup](#10-prerequisites--setup)
11. [Running the Application](#11-running-the-application)
12. [Default Admin Account](#12-default-admin-account)
13. [Swagger Testing Guide (Step-by-Step)](#13-swagger-testing-guide-step-by-step)
14. [API Endpoints Reference](#14-api-endpoints-reference)

---

## 1. System Overview

WASAC manages water and electricity distribution across Rwanda. This backend system automates:

- **Customer and meter management** — store customer profiles and assign utility meters
- **Meter reading capture** — operators record monthly consumption data
- **Bill generation** — automated calculation using configured tariffs, taxes, and service charges
- **Payment processing** — supports partial and full payments with automatic status updates
- **Notifications** — database triggers fire automatic messages on bill creation and full payment
- **Role-based access control** — JWT-secured with four distinct roles

---

## 2. Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Java 17 |
| Framework | Spring Boot 3.3.0 |
| Security | Spring Security + JWT (jjwt 0.12.3) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| API Docs | Springdoc OpenAPI 2.5.0 (Swagger UI) |
| Build Tool | Maven |
| Extras | Lombok, Bean Validation (Jakarta) |

---

## 3. Architecture

The system follows a layered Spring Boot architecture:

```
HTTP Request
    │
    ▼
JwtAuthenticationFilter          ← validates JWT, populates SecurityContext
    │
    ▼
REST Controller (@RestController) ← handles HTTP, delegates to service
    │
    ▼
Service Layer (@Service)          ← business logic, business rules enforcement
    │
    ▼
Repository Layer (@Repository)    ← Spring Data JPA, database queries
    │
    ▼
PostgreSQL Database               ← persistence + triggers + stored procedures
```

**Security Flow:**
1. Client sends `Authorization: Bearer <token>` header
2. `JwtAuthenticationFilter` validates the token and sets the authenticated `User` in `SecurityContextHolder`
3. `@PreAuthorize("hasRole('ADMIN')")` annotations on controller methods enforce role-based access
4. Unauthenticated requests to protected endpoints receive `401 Unauthorized`
5. Authenticated users accessing wrong role's endpoints receive `403 Forbidden`

---

## 4. Project Structure

```
src/main/java/rw/gov/wasac/billing/
├── WasacBillingApplication.java         Main entry point
│
├── config/
│   ├── SecurityConfig.java              Spring Security + JWT filter chain
│   ├── SwaggerConfig.java               OpenAPI / Swagger UI configuration
│   ├── DataInitializer.java             Seeds roles and admin account on startup
│   └── DatabaseRoutineInitializer.java  Creates PostgreSQL triggers & procedures
│
├── security/
│   ├── JwtTokenProvider.java            Token generation and validation
│   ├── JwtAuthenticationFilter.java     Per-request JWT extraction filter
│   └── UserDetailsServiceImpl.java      Loads user from DB for Spring Security
│
├── domain/
│   ├── enums/                           RoleName, UserStatus, MeterType, BillStatus, ...
│   ├── entity/                          JPA entities (User, Customer, Meter, Bill, ...)
│   └── repository/                      Spring Data JPA interfaces
│
├── service/                             Business logic layer (12 services)
│
├── web/
│   ├── controller/                      REST controllers (12 controllers)
│   └── dto/
│       ├── request/                     Validated request bodies
│       └── response/                    Response DTOs
│
└── exception/
    ├── GlobalExceptionHandler.java      Unified error responses
    ├── ResourceNotFoundException.java
    ├── BusinessException.java
    └── DuplicateResourceException.java
```

---

## 5. Database Schema

Key tables and their relationships:

```
users ──< user_roles >── roles
users ──< role_requests

customers ──< meters ──< meter_readings
customers ─── users  (optional link: a customer can have a user account)

tariffs ──< tariff_tiers

meter_readings ──> bills ──< payments
customers ──< bills
customers ──< notifications

tax_configs  (applied during bill generation)
service_charges (applied during bill generation)
penalties    (applied to overdue bills)
```

**Unique Constraints:**
- `users.email` — no duplicate email addresses
- `customers.national_id` — no duplicate NID
- `meters.meter_number` — unique system-wide
- `meter_readings(meter_id, reading_month, reading_year)` — one reading per meter per month
- `bills(customer_id, meter_id, billing_month, billing_year)` — one bill per meter per period

---

## 6. Business Rules

### Customer Rules
- National ID must be unique — duplicate registration is blocked
- Inactive customers cannot have bills generated for them

### Meter Rules
- Meter number must be unique across the entire system
- Only **ACTIVE** meters accept new readings

### Meter Reading Rules
- `current_reading` must be **strictly greater** than `previous_reading`
- Only **one reading** allowed per meter per month/year combination
- Meter must be **ACTIVE** at the time of reading

### Tariff Rules
- Tariffs are **versioned** — each new tariff for a meter type increments the version number
- Creating a new tariff automatically **deactivates** the previous current tariff
- **FLAT** tariff requires a `unit_price`
- **TIER_BASED** tariff requires at least one tier with `min_units` and `unit_price`

### Billing Rules
- Only **ACTIVE** customers can be billed
- Bill generation checks for an existing bill for the same meter/period — duplicate bills are blocked
- Bill total = `consumption_amount + service_charge + tax_amount + penalty_amount`
- Bills start in **PENDING** status → must be approved by ADMIN or FINANCE
- Only **APPROVED** bills can receive payments

### Payment Rules
- Supports **partial payments** (amount less than outstanding balance)
- Supports **full payments** (amount equal to or exceeding outstanding balance)
- `outstanding_balance` is automatically updated after each payment
- Bill status is automatically set to **PAID** when `outstanding_balance` reaches zero
- Cannot record payment against REJECTED or PENDING bills

---

## 7. Database Routines

Three PostgreSQL routines are created automatically at application startup via `JdbcTemplate`:

### Trigger 1 — Bill Generation Notification
```sql
TRIGGER: trg_notify_on_bill_insert   (AFTER INSERT ON bills)
FUNCTION: fn_notify_on_bill_insert()
```
**Fires when:** A new bill is inserted into the `bills` table  
**Action:** Inserts a row into `notifications` with type `BILL_GENERATED`  
**Message format:**
```
Dear <Customer Name>, Your <Month>/<Year> utility bill of <Amount> FRW has been successfully processed.
```

### Trigger 2 — Full Payment Notification
```sql
TRIGGER: trg_notify_on_full_payment  (AFTER UPDATE ON bills)
FUNCTION: fn_notify_on_full_payment()
```
**Fires when:** A bill is updated and `outstanding_balance` changes from `> 0` to `<= 0`  
**Action:** Inserts a row into `notifications` with type `PAYMENT_CONFIRMED`

### Stored Procedure — Bill Reference Generator
```sql
FUNCTION: generate_bill_reference(meter_type VARCHAR, year INT, month INT)
RETURNS: VARCHAR  -- e.g. 'WASAC-2024-06-W-000001'
```

### Stored Procedure with Cursor — Monthly Billing Report
```sql
FUNCTION: get_monthly_billing_report(year INT, month INT)
RETURNS: TABLE (customer_name, meter_number, meter_type, bill_reference,
                total_amount, amount_paid, outstanding, bill_status)
```
**Usage (run directly in PostgreSQL):**
```sql
SELECT * FROM get_monthly_billing_report(2024, 6);
```

---

## 8. Roles & Permissions

| Endpoint Group | ADMIN | OPERATOR | FINANCE | CUSTOMER |
|----------------|-------|----------|---------|----------|
| POST /api/auth/** | Public | Public | Public | Public |
| GET/POST/PUT/DELETE /api/users | YES | NO | NO | NO |
| Role request management | YES | NO | NO | NO |
| Submit role request | NO | NO | NO | YES |
| /api/customers | YES | NO | NO | NO |
| /api/meters | YES | NO | NO | NO |
| /api/meter-readings (POST/GET) | YES | YES | NO | NO |
| /api/tariffs | YES | NO | NO | NO |
| /api/tax-configs | YES | NO | NO | NO |
| /api/service-charges | YES | NO | NO | NO |
| /api/penalties | YES | NO | NO | NO |
| POST /api/bills/generate | YES | NO | YES | NO |
| PATCH /api/bills/{id}/approve | YES | NO | YES | NO |
| GET /api/bills | YES | NO | YES | NO |
| GET /api/bills/my | NO | NO | NO | YES |
| POST /api/payments | NO | NO | YES | NO |
| GET /api/payments | YES | NO | YES | NO |
| GET /api/payments/my | NO | NO | NO | YES |
| GET /api/notifications/my | NO | NO | NO | YES |
| GET /api/notifications | YES | NO | NO | NO |

---

## 9. Validation Rules

All request bodies are validated before reaching the service layer. Here is a summary:

### User / Auth Fields
| Field | Rule |
|-------|------|
| `full_names` | Required, 3–255 characters |
| `email` | Required, valid email format |
| `phone_number` | Required, Rwanda format: `+250788000000`, `250788000000`, or `0788000000` |
| `password` | Required, 6–100 chars, must contain uppercase, lowercase, and digit |

### Customer Fields
| Field | Rule |
|-------|------|
| `national_id` | Required, **exactly 16 digits** (Rwanda NID format) |
| `address` | Required, 5–500 characters |

### Meter Fields
| Field | Rule |
|-------|------|
| `meter_number` | Required, 3–100 chars, uppercase letters/digits/hyphens only |
| `installation_date` | Required, **cannot be in the future** (`@PastOrPresent`) |

### Meter Reading Fields
| Field | Rule |
|-------|------|
| `previous_reading` | Required, >= 0.000 |
| `current_reading` | Required, >= 0.001 |
| `reading_date` | Required, **cannot be in the future** (`@PastOrPresent`) |
| Cross-field | `current_reading` > `previous_reading` (enforced in service) |

### Tariff / Tax / Penalty Fields
| Field | Rule |
|-------|------|
| `unit_price` (tariff) | Required for FLAT type, > 0 |
| `tiers` (tariff) | Required for TIER_BASED type |
| Tax `rate` | Decimal between 0.0001 and 0.9999 (e.g. 0.18 = 18%) |
| Service charge `amount` | >= 0.01 FRW |
| Penalty `days_overdue` | 1–3650 days |
| Penalty `rate` | 0.0001–0.9999 for PERCENTAGE type |

### Payment Fields
| Field | Rule |
|-------|------|
| `bill_reference` | Required, pattern: `WASAC-YYYY-MM-W/E-XXXXXXXX` |
| `amount_paid` | Required, >= 0.01 FRW |
| `payment_date` | Required, **cannot be in the future** (`@PastOrPresent`) |

---

## 10. Prerequisites & Setup

### Requirements
- Java 17+
- Maven 3.8+
- PostgreSQL 14+ running locally

### Database Setup
```bash
# Connect to PostgreSQL and create the database
psql -U paulin -c "CREATE DATABASE wasac_billing;"
```

The application uses:
- **Host:** localhost:5432
- **Database:** wasac_billing
- **Username:** paulin
- **Password:** paulin

> To change these, edit `src/main/resources/application.properties`

---

## 11. Running the Application

### Option A — Using the JAR (recommended)
```bash
cd "/path/to/wasac-billing-system"
mvn package -DskipTests
java -jar target/wasac-billing-system-1.0.0.jar
```

### Option B — Using Maven directly
```bash
cd "/path/to/wasac-billing-system"
mvn spring-boot:run
```

On startup the application:
1. Creates/recreates all database tables (`ddl-auto=create`)
2. Seeds 4 roles: `ROLE_ADMIN`, `ROLE_OPERATOR`, `ROLE_FINANCE`, `ROLE_CUSTOMER`
3. Seeds the admin user: `admin@wasac.rw` / `Admin@1234`
4. Creates PostgreSQL triggers and stored procedures via `JdbcTemplate`

**Access points:**
- API Base URL: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

---

## 12. Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@wasac.rw` |
| Password | `Admin@1234` |
| Role | `ROLE_ADMIN` |

---

## 13. Swagger Testing Guide (Step-by-Step)

Open `http://localhost:8080/swagger-ui/index.html` in your browser.

---

### STEP 1 — Authenticate as Admin

**Endpoint:** `POST /api/auth/login`

Request body:
```json
{
  "email": "admin@wasac.rw",
  "password": "Admin@1234"
}
```

Response — copy the `access_token` from the response:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "roles": ["ROLE_ADMIN"]
  }
}
```

Click **Authorize** (top right in Swagger), enter: `Bearer eyJhbGciOiJIUzI1NiJ9...`

---

### STEP 2 — Configure Tariffs (as Admin)

**Endpoint:** `POST /api/tariffs`

**Water flat-rate tariff:**
```json
{
  "meter_type": "WATER",
  "tariff_type": "FLAT",
  "unit_price": 350.0000,
  "effective_from": "2024-01-01"
}
```

**Electricity tier-based tariff:**
```json
{
  "meter_type": "ELECTRICITY",
  "tariff_type": "TIER_BASED",
  "effective_from": "2024-01-01",
  "tiers": [
    { "min_units": 0.0, "max_units": 100.0, "unit_price": 100.0000 },
    { "min_units": 100.0, "max_units": 200.0, "unit_price": 120.0000 },
    { "min_units": 200.0, "max_units": null, "unit_price": 150.0000 }
  ]
}
```

---

### STEP 3 — Configure VAT and Service Charges (as Admin)

**Create VAT:** `POST /api/tax-configs`
```json
{
  "name": "VAT",
  "rate": 0.18,
  "applies_to": "ALL"
}
```

**Create service charge:** `POST /api/service-charges`
```json
{
  "name": "Water Connection Fee",
  "amount": 500.00,
  "meter_type": "WATER"
}
```

**Create late penalty:** `POST /api/penalties`
```json
{
  "name": "Late Payment Penalty (30 days)",
  "penalty_type": "PERCENTAGE",
  "rate": 0.05,
  "days_overdue": 30
}
```

---

### STEP 4 — Create a Customer (as Admin)

**Endpoint:** `POST /api/customers`
```json
{
  "full_names": "Jean Baptiste Uwimana",
  "national_id": "1199900012345678",
  "email": "jean@example.com",
  "phone_number": "+250788111222",
  "address": "KG 123 St, Kigali, Rwanda"
}
```

> Note the returned `id` (e.g. `1`) — you will need it to assign a meter.

---

### STEP 5 — Create and Assign a Meter (as Admin)

**Endpoint:** `POST /api/meters`
```json
{
  "meter_number": "WTR-KGL-000001",
  "meter_type": "WATER",
  "installation_date": "2024-01-15",
  "customer_id": 1
}
```

> Note the returned meter `id` — you will need it for meter readings.

---

### STEP 6 — Create an Operator User (as Admin)

**Endpoint:** `POST /api/users`
```json
{
  "full_names": "Operator One",
  "email": "operator@wasac.rw",
  "phone_number": "+250788333444",
  "password": "Operator@1234",
  "role": "ROLE_OPERATOR"
}
```

---

### STEP 7 — Capture Meter Reading (as Operator)

1. Login as operator: `POST /api/auth/login` → `{ "email": "operator@wasac.rw", "password": "Operator@1234" }`
2. Authorize with the new token.

**Endpoint:** `POST /api/meter-readings`
```json
{
  "meter_id": 1,
  "previous_reading": 0.000,
  "current_reading": 25.500,
  "reading_date": "2024-06-30"
}
```

> The system validates: `current > previous`, meter is active, no duplicate for this month.

> Note the returned reading `id` — you need it to generate the bill.

---

### STEP 8 — Create a Finance User and Generate + Approve Bill

**Create finance user** (as Admin): `POST /api/users`
```json
{
  "full_names": "Finance Officer",
  "email": "finance@wasac.rw",
  "phone_number": "+250788555666",
  "password": "Finance@1234",
  "role": "ROLE_FINANCE"
}
```

**Generate bill** (as Admin or Finance): `POST /api/bills/generate`
```json
{
  "meter_reading_id": 1
}
```

The system automatically:
- Looks up the current tariff for the meter type
- Applies service charges and VAT
- Checks for overdue penalties
- Generates a unique `bill_reference` (e.g. `WASAC-2024-06-W-A1B2C3D4`)
- PostgreSQL trigger fires → inserts a notification for the customer

**Approve the bill**: `PATCH /api/bills/{id}/approve`

---

### STEP 9 — Record Payment (as Finance)

1. Login as finance: `POST /api/auth/login` → `{ "email": "finance@wasac.rw", "password": "Finance@1234" }`
2. Authorize with the finance token.

**Endpoint:** `POST /api/payments`
```json
{
  "bill_reference": "WASAC-2024-06-W-A1B2C3D4",
  "amount_paid": 5000.00,
  "payment_method": "MOBILE_MONEY",
  "payment_date": "2024-07-02T10:30:00",
  "reference_number": "MTN-2024-0702-001"
}
```

If `amount_paid` covers the full outstanding balance:
- Bill status becomes `PAID`
- PostgreSQL trigger fires → inserts `PAYMENT_CONFIRMED` notification

For partial payment — send a smaller amount. The `outstanding_balance` is updated but status stays `APPROVED`.

---

### STEP 10 — View Bills and Notifications (as Customer)

First, link a user account to the customer:
1. Create a CUSTOMER user: `POST /api/users` with `"role": "ROLE_CUSTOMER"`
2. Update the customer record to link the user: `PUT /api/customers/{id}` (or create the customer with `user_id`)

Then login as the customer user and use:
- `GET /api/bills/my` — view own bills
- `GET /api/payments/my` — view own payment history
- `GET /api/notifications/my` — view billing and payment notifications
- `PATCH /api/notifications/{id}/read` — mark a notification as read

---

### STEP 11 — Role Upgrade Request Flow

A CUSTOMER user can request a role upgrade:
1. Login as customer → `POST /api/users/role-requests` → `{ "requested_role": "ROLE_OPERATOR" }`
2. Login as admin → `GET /api/users/role-requests/pending` → see the request
3. Approve: `PATCH /api/users/role-requests/{requestId}/approve`
   — or reject: `PATCH /api/users/role-requests/{requestId}/reject`

---

### STEP 12 — Quick Register (Self-Registration)

Any user can self-register via:
```
POST /api/auth/register
```
They automatically receive `ROLE_CUSTOMER` and can then request a role upgrade.

---

## 14. API Endpoints Reference

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Self-register (ROLE_CUSTOMER) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/users` | ADMIN | Create user with specific role |
| GET | `/api/users` | ADMIN | List all users |
| GET | `/api/users/{id}` | ADMIN | Get user by ID |
| PUT | `/api/users/{id}` | ADMIN | Update user |
| PATCH | `/api/users/{id}/activate` | ADMIN | Activate user |
| PATCH | `/api/users/{id}/deactivate` | ADMIN | Deactivate user |
| DELETE | `/api/users/{id}` | ADMIN | Delete user |
| PUT | `/api/users/{id}/role` | ADMIN | Directly assign/change role |
| GET | `/api/users/role-requests` | ADMIN | List all role requests |
| GET | `/api/users/role-requests/pending` | ADMIN | List pending role requests |
| PATCH | `/api/users/role-requests/{id}/approve` | ADMIN | Approve role request |
| PATCH | `/api/users/role-requests/{id}/reject` | ADMIN | Reject role request |
| POST | `/api/users/role-requests` | CUSTOMER | Submit role upgrade request |
| POST | `/api/customers` | ADMIN | Create customer |
| GET | `/api/customers` | ADMIN | List all customers |
| GET | `/api/customers/{id}` | ADMIN | Get customer by ID |
| PUT | `/api/customers/{id}` | ADMIN | Update customer |
| PATCH | `/api/customers/{id}/deactivate` | ADMIN | Deactivate customer |
| POST | `/api/meters` | ADMIN | Create and assign meter |
| GET | `/api/meters` | ADMIN | List all meters |
| GET | `/api/meters/{id}` | ADMIN | Get meter by ID |
| GET | `/api/meters/customer/{customerId}` | ADMIN | List meters by customer |
| PATCH | `/api/meters/{id}/activate` | ADMIN | Activate meter |
| PATCH | `/api/meters/{id}/deactivate` | ADMIN | Deactivate meter |
| POST | `/api/meter-readings` | OPERATOR | Capture meter reading |
| GET | `/api/meter-readings` | ADMIN, OPERATOR | List all readings |
| GET | `/api/meter-readings/{id}` | ADMIN, OPERATOR | Get reading by ID |
| GET | `/api/meter-readings/meter/{meterId}` | ADMIN, OPERATOR | Readings by meter |
| POST | `/api/tariffs` | ADMIN | Create versioned tariff |
| GET | `/api/tariffs` | ADMIN | List all tariffs |
| GET | `/api/tariffs/{id}` | ADMIN | Get tariff by ID |
| GET | `/api/tariffs/current/{meterType}` | ADMIN, FINANCE | Get current tariff |
| POST | `/api/tax-configs` | ADMIN | Create tax configuration |
| GET | `/api/tax-configs` | ADMIN | List all tax configs |
| PUT | `/api/tax-configs/{id}` | ADMIN | Update tax config |
| PATCH | `/api/tax-configs/{id}/toggle` | ADMIN | Toggle active status |
| POST | `/api/service-charges` | ADMIN | Create service charge |
| GET | `/api/service-charges` | ADMIN | List all service charges |
| PUT | `/api/service-charges/{id}` | ADMIN | Update service charge |
| PATCH | `/api/service-charges/{id}/toggle` | ADMIN | Toggle active status |
| POST | `/api/penalties` | ADMIN | Create penalty rule |
| GET | `/api/penalties` | ADMIN | List all penalties |
| PATCH | `/api/penalties/{id}/toggle` | ADMIN | Toggle active status |
| POST | `/api/bills/generate` | ADMIN, FINANCE | Generate bill from reading |
| GET | `/api/bills` | ADMIN, FINANCE | List all bills |
| GET | `/api/bills/{id}` | ADMIN, FINANCE | Get bill by ID |
| GET | `/api/bills/customer/{customerId}` | ADMIN, FINANCE | Bills by customer |
| GET | `/api/bills/my` | CUSTOMER | View own bills |
| PATCH | `/api/bills/{id}/approve` | ADMIN, FINANCE | Approve bill |
| PATCH | `/api/bills/{id}/reject` | ADMIN, FINANCE | Reject bill |
| POST | `/api/payments` | FINANCE | Record payment |
| GET | `/api/payments` | ADMIN, FINANCE | List all payments |
| GET | `/api/payments/{id}` | ADMIN, FINANCE | Get payment by ID |
| GET | `/api/payments/bill/{billId}` | ADMIN, FINANCE | Payments by bill |
| GET | `/api/payments/my` | CUSTOMER | View own payment history |
| GET | `/api/notifications` | ADMIN | All notifications |
| GET | `/api/notifications/my` | CUSTOMER | Own notifications |
| PATCH | `/api/notifications/{id}/read` | CUSTOMER | Mark notification as read |
| GET | `/api/notifications/my/unread-count` | CUSTOMER | Count unread notifications |
