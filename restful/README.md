# Fire Extinguisher Management System

> National Exam 2026 — TZW Ltd (Kigali, Rwanda)

---

## Overview

A full-stack **microservices** web application for managing fire extinguisher inventory, inspections, maintenance, and compliance reporting.

- **Frontend:** React 19 + TypeScript + Tailwind CSS + Vite
- **Backend:** NestJS microservices (API Gateway + 7 services) + PostgreSQL + RabbitMQ
- **Architecture:** Event-driven, schema-per-service database design

---

## Quick Links

| Resource | Link |
|----------|------|
| **UI/UX Mockups** | [Figma Design](https://www.figma.com/design/0JUDZFtYe7VOSQBrXM26pc/Fire-Extinguisher-Management-System?node-id=0-1&t=hVO1MLVDgHq7qMo5-1) |
| **API Documentation** | http://localhost:5000/api/docs (Swagger) |
| **Database Dump** | `db_dump.sql` (PostgreSQL full backup) |
| **System Diagrams** | `diagrams/` (Mermaid + DBML) |

---

## Project Structure

```
restful/
  README.md                <- This file
  db_dump.sql              <- Full PostgreSQL database backup
  start-backend.sh         <- Start all backend services
  stop-all.sh              <- Stop all services
  diagrams/                <- Architecture & DFD diagrams
    mermaid/               <- System architecture, DFD Level 0 & 1
    dbml/                  <- Database ER diagram (dbdiagram.io)
    README.md              <- How to generate visual diagrams
  backend/                 <- NestJS microservices backend
    README.md              <- Backend docs
    api-gateway/           <- Port 5000 (routing, auth, Swagger)
    auth-service/          <- Port 5001 (login, register, JWT)
    user-service/          <- Port 5002 (user profiles)
    extinguisher-service/  <- Port 5003 (extinguisher CRUD)
    inspection-service/    <- Port 5004 (inspection scheduling)
    maintenance-service/   <- Port 5005 (maintenance logging)
    reporting-service/     <- Port 5006 (reports, audit logs)
    notification-service/  <- Port 5007 (notifications)
  frontend/                <- React + Vite frontend
    README.md              <- Frontend docs
    src/                   <- App source code
```

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@tzw.com` | `Admin123!` |
| **User** | `user@tzw.com` | `User123!` |

---

## How to Run

### Prerequisites
- PostgreSQL 15+ running locally
- RabbitMQ running locally
- Node.js 20+

### 1. Database Setup
```bash
# Create database
psql -U paulin -c "CREATE DATABASE fire_extinguisher_db;"

# Or restore from dump
psql -U paulin -d fire_extinguisher_db < db_dump.sql
```

### 2. Start Backend Services
```bash
cd restful
./start-backend.sh
```

Services will be available at:
- **API Gateway:** http://localhost:5000/api/docs
- **Auth Service:** http://localhost:5001/api/docs
- **User Service:** http://localhost:5002/api/docs
- **Extinguisher Service:** http://localhost:5003/api/docs
- **Inspection Service:** http://localhost:5004/api/docs
- **Maintenance Service:** http://localhost:5005/api/docs
- **Reporting Service:** http://localhost:5006/api/docs
- **Notification Service:** http://localhost:5007/api/docs

### 3. Start Frontend
```bash
cd restful/frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### Stop Everything
```bash
cd restful
./stop-all.sh
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite, Zustand |
| **Gateway** | NestJS, Swagger/OpenAPI, JWT validation, rate limiting |
| **Services** | NestJS, TypeORM, RabbitMQ (event-driven) |
| **Database** | PostgreSQL 15 (7 schemas: auth, user, extinguisher, inspection, maintenance, reporting, notification) |
| **Message Bus** | RabbitMQ |
| **Security** | JWT + Refresh Tokens, bcrypt, RBAC (admin/inspector/technician/user) |

---

## Features

- **Authentication:** Register, login, JWT tokens, password reset
- **Role-Based Access:** Admin, Inspector, Technician, User
- **Extinguisher Management:** CRUD, expiry tracking, status management
- **Inspection Scheduling:** Schedule, update, cancel inspections
- **Maintenance Logging:** Log repairs with cost tracking
- **Reports & Analytics:** Dashboard stats, PDF/CSV export
- **Notifications:** Real-time alerts for expiry, inspections, role requests
- **Audit Logs:** Track all actions performed in the system
- **Role Requests:** Users can request role changes, admins approve/reject

---

## Key Design Decisions

1. **Microservices Architecture** — Each domain runs as an independent service with its own database schema
2. **API Gateway Pattern** — Single entry point handles auth, routing, rate limiting
3. **Event-Driven Communication** — RabbitMQ decouples services (user.created, inspection.scheduled, etc.)
4. **Schema-Per-Service** — PostgreSQL shared instance, but each service owns its schema

---

## Database Schemas

| Schema | Tables |
|--------|--------|
| `auth_schema` | users, refresh_tokens, role_requests |
| `user_schema` | user_profiles |
| `extinguisher_schema` | fire_extinguishers |
| `inspection_schema` | inspections |
| `maintenance_schema` | maintenance_logs |
| `reporting_schema` | reports, audit_logs |
| `notification_schema` | notifications |

Full SQL dump included: `db_dump.sql`

---

## Diagrams

Architecture and data flow diagrams are in `diagrams/`:

- **System Architecture** — `mermaid/system-architecture.mmd`
- **DFD Level 0 (Context)** — `mermaid/dfd-level0.mmd`
- **DFD Level 1 (Detailed)** — `mermaid/dfd-level1.mmd`
- **Database ER Diagram** — `dbml/database-schema.dbml`

See `diagrams/README.md` for rendering instructions.

---

## Swagger / API Testing

Open the Gateway Swagger UI and:
1. Call `POST /api/auth/login` with test credentials to get a token
2. Click **Authorize** (top right) and enter `Bearer YOUR_TOKEN`
3. Explore all endpoints with pre-filled examples

All endpoints include documented request/response schemas and example values.

---

## License

Internal project for National Examination 2026.
