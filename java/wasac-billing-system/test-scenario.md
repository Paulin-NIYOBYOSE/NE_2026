# WASAC SYSTEM — SIMPLE TEST FLOW

## Users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@wasac.rw` | `Admin@1234` |
| Operator | `bob.operator@wasac.rw` | `Bob@12345` |
| Finance | `claire.finance@wasac.rw` | `Claire@1234` |
| Customer | `alice@example.com` | `Alice@1234` |

---

## 1. Login as Admin

`POST /api/auth/login`
```json
{
  "email": "admin@wasac.rw",
  "password": "Admin@1234"
}
```
> Copy token → Authorize Swagger

---

## 2. Setup (Admin)

**Tariff**

`POST /api/tariffs`
```json
{
  "meter_type": "WATER",
  "tariff_type": "FLAT",
  "unit_price": 500,
  "effective_from": "2024-01-01"
}
```

**VAT**

`POST /api/tax-configs`
```json
{
  "name": "VAT",
  "rate": 0.18,
  "applies_to": "ALL",
  "is_active": true
}
```

**Service Charge**

`POST /api/service-charges`
```json
{
  "name": "Service Fee",
  "amount": 1000,
  "meter_type": "WATER",
  "is_active": true
}
```

---

## 3. Register Customer

`POST /api/auth/register`
```json
{
  "full_names": "Alice Uwimana",
  "email": "alice@example.com",
  "phone_number": "0781234567",
  "national_id": "1199780123456789",
  "address": "Kigali Gasabo",
  "password": "Alice@1234"
}
```

---

## 4. Create Meter (Admin)

`POST /api/meters`
```json
{
  "customer_id": 1,
  "meter_number": "WTR-001",
  "meter_type": "WATER",
  "installation_date": "2024-01-10"
}
```

---

## 5. Meter Reading (Operator)

Login as operator → authorize → then:

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

---

## 6. Generate Bill (Admin / Finance)

Switch back to admin token.

`POST /api/bills/generate`
```json
{
  "meter_reading_id": 1
}
```
> Copy `bill_reference` from the response

**Bill formula:**
```
consumption_amount = 50 × 500        = 25,000 FRW
subtotal           = 25,000 + 1,000  = 26,000 FRW
VAT (18%)          = 26,000 × 0.18   =  4,680 FRW
total_amount                         = 30,680 FRW
```

---

## 7. Approve Bill

`PATCH /api/bills/{id}/approve`

---

## 8. Payment (Finance)

Login as finance → authorize → then:

**Partial payment**

`POST /api/payments`
```json
{
  "bill_reference": "WASAC-2024-06-W-XXXX",
  "amount_paid": 15000,
  "payment_method": "MOBILE_MONEY",
  "payment_date": "2024-07-05"
}
```

**Full payment (clears balance)**

`POST /api/payments`
```json
{
  "bill_reference": "WASAC-2024-06-W-XXXX",
  "amount_paid": 15680,
  "payment_method": "BANK_TRANSFER",
  "payment_date": "2024-07-10"
}
```
> Bill status → **PAID**. PostgreSQL trigger fires PAYMENT_CONFIRMED notification automatically.

---

## 9. Customer Check

Login as customer → authorize → then:

| Endpoint | What you see |
|----------|-------------|
| `GET /api/bills/my` | Alice's bill — status PAID, total 30,680 FRW |
| `GET /api/payments/my` | Two payments: 15,000 + 15,680 FRW |
| `GET /api/notifications/my` | BILL_GENERATED + PAYMENT_CONFIRMED messages from DB triggers |
