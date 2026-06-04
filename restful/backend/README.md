# Fire Extinguisher Management System - Microservices Backend

A distributed backend system built with **NestJS Microservices Architecture**, migrated from a monolithic design to demonstrate proper microservices principles including service separation, event-driven communication, and independent scalability.

## UI/UX Mockups

[View Figma Design](https://www.figma.com/design/0JUDZFtYe7VOSQBrXM26pc/Fire-Extinguisher-Management-System?node-id=0-1&t=hVO1MLVDgHq7qMo5-1)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (:5000)                          │
│  • JWT Validation • Rate Limiting • CORS • Routing • Swagger    │
└────┬────────┬────────┬────────┬────────┬────────┬────────┬─────┘
     │        │        │        │        │        │        │
     ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│  Auth  ││  User  ││ Extin- ││Inspect-││Mainten-││Report- ││Notifi- │
│Service ││Service ││guisher ││  ion   ││ ance   ││  ing   ││cation  │
│ :5001  ││ :5002  ││Service ││Service ││Service ││Service ││Service │
│        ││        ││ :5003  ││ :5004  ││ :5005  ││ :5006  ││ :5007  │
└────┬───┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬───┘
     │        │         │         │         │         │         │
     └────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
                          │                   │
                ┌─────────▼─────────┐ ┌───────▼─────────┐
                │    PostgreSQL      │ │    RabbitMQ      │
                │  (Shared Server,   │ │ (Message Broker) │
                │  Separate Schemas) │ │                  │
                └───────────────────┘ └──────────────────┘
```

---

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 5000 | Central entry point, routing, auth validation |
| Auth Service | 5001 | Registration, login, JWT, role management |
| User Service | 5002 | User profile management |
| Extinguisher Service | 5003 | Fire extinguisher CRUD, stock tracking |
| Inspection Service | 5004 | Inspection scheduling and tracking |
| Maintenance Service | 5005 | Maintenance logs and history |
| Reporting Service | 5006 | Analytics, PDF/CSV export |
| Notification Service | 5007 | Email notifications, alerts |

---

## Technology Stack

- **Framework:** NestJS 10
- **Language:** TypeScript
- **Database:** PostgreSQL 15 (separate schemas per service)
- **Message Broker:** RabbitMQ
- **Authentication:** JWT + Refresh Tokens
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker + Docker Compose
- **Logging:** Winston
- **Security:** Helmet, Rate Limiting, CORS

---

## Database Architecture

Each microservice owns its own schema within a shared PostgreSQL instance:

| Service | Schema | Tables |
|---------|--------|--------|
| Auth | `auth_schema` | users, refresh_tokens |
| User | `user_schema` | user_profiles |
| Extinguisher | `extinguisher_schema` | fire_extinguishers |
| Inspection | `inspection_schema` | inspections |
| Maintenance | `maintenance_schema` | maintenance_logs |
| Reporting | `reporting_schema` | reports |
| Notification | `notification_schema` | notifications |

---

## Communication Patterns

### Synchronous (REST)
- API Gateway → Individual Services (HTTP proxy)

### Asynchronous (RabbitMQ Events)
- `user.created` → Notification Service sends welcome email
- `inspection.scheduled` → Notification Service alerts inspector
- `maintenance.logged` → Reporting Service updates analytics
- `extinguisher.expired` → Notification Service sends alert
- `password.reset.requested` → Notification Service sends reset email

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm or yarn

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Start in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Local Development

1. **Start infrastructure:**
```bash
# Start PostgreSQL and RabbitMQ
docker-compose up postgres rabbitmq -d
```

2. **Install dependencies for each service:**
```bash
cd api-gateway && npm install
cd ../auth-service && npm install
cd ../user-service && npm install
cd ../extinguisher-service && npm install
cd ../inspection-service && npm install
cd ../maintenance-service && npm install
cd ../reporting-service && npm install
cd ../notification-service && npm install
```

3. **Start each service:**
```bash
# In separate terminals
cd api-gateway && npm run start:dev
cd auth-service && npm run start:dev
cd user-service && npm run start:dev
cd extinguisher-service && npm run start:dev
cd inspection-service && npm run start:dev
cd maintenance-service && npm run start:dev
cd reporting-service && npm run start:dev
cd notification-service && npm run start:dev
```

---

## API Documentation

Once running, access Swagger docs at:
- **Gateway (aggregated):** http://localhost:5000/api/docs
- **Auth Service:** http://localhost:5001/api/docs
- **User Service:** http://localhost:5002/api/docs
- **Extinguisher Service:** http://localhost:5003/api/docs
- **Inspection Service:** http://localhost:5004/api/docs
- **Maintenance Service:** http://localhost:5005/api/docs
- **Reporting Service:** http://localhost:5006/api/docs
- **Notification Service:** http://localhost:5007/api/docs

---

## API Routes (via Gateway)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |
| GET | /api/users | List users |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| POST | /api/extinguishers | Create extinguisher |
| GET | /api/extinguishers | List extinguishers |
| GET | /api/extinguishers/stats | Get stats |
| GET | /api/extinguishers/expired | Get expired |
| POST | /api/inspections | Schedule inspection |
| GET | /api/inspections | List inspections |
| GET | /api/inspections/upcoming | Upcoming inspections |
| POST | /api/maintenance | Log maintenance |
| GET | /api/maintenance | List maintenance logs |
| POST | /api/reports | Generate report |
| GET | /api/reports/dashboard | Dashboard stats |
| GET | /api/notifications | List notifications |

---

## Event-Driven Workflows

### User Registration Flow
1. Client → API Gateway → Auth Service
2. Auth Service creates user & emits `user.created`
3. User Service creates profile (listens to `user.created`)
4. Notification Service sends welcome email (listens to `user.created`)

### Inspection Scheduling Flow
1. Client → API Gateway → Inspection Service
2. Inspection Service validates & stores inspection
3. Emits `inspection.scheduled` event
4. Notification Service alerts inspector

### Maintenance Logging Flow
1. Client → API Gateway → Maintenance Service
2. Maintenance Service stores record
3. Emits `maintenance.logged` event
4. Reporting Service updates analytics
5. Notification Service sends confirmation

---

## Security

- **JWT Authentication** with access & refresh tokens
- **Role-Based Access Control** (admin, inspector, technician, user)
- **Helmet** for HTTP security headers
- **Rate Limiting** (100 requests/minute default)
- **CORS** configured for frontend origins
- **Input Validation** using class-validator
- **Password Hashing** with bcrypt (10 salt rounds)

---

## Project Structure

```
backend/
├── api-gateway/          # Central routing & auth validation
├── auth-service/         # Authentication & authorization
├── user-service/         # User profile management
├── extinguisher-service/ # Fire extinguisher CRUD
├── inspection-service/   # Inspection scheduling
├── maintenance-service/  # Maintenance logging
├── reporting-service/    # Reports & analytics
├── notification-service/ # Email & notifications
├── shared/               # Shared DTOs, guards, utilities
├── docker-compose.yml    # Container orchestration
├── init-db.sql           # Database schema initialization
└── README.md             # This file
```

---

## RabbitMQ Management

Access RabbitMQ management UI at: http://localhost:15672
- Username: `guest`
- Password: `guest`

---

## Environment Variables

Each service has its own `.env` file. Key variables:
- `PORT` - Service port
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA`
- `JWT_SECRET` - Must be same across all services
- `RABBITMQ_URL` - RabbitMQ connection string
- `SMTP_*` - Email configuration (notification service only)
