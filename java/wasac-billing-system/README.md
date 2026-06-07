# WASAC Billing System

A Spring Boot REST API for managing WASAC (Water and Sanitation Corporation) customer billing, meter readings, payments, and notifications.

## Tech Stack

- **Java 17** + **Spring Boot 3**
- **PostgreSQL** — relational database
- **Spring Security** + **JWT** — authentication
- **Spring Data JPA / Hibernate** — ORM
- **Springdoc OpenAPI** — Swagger UI
- **JavaMail** — email notifications
- **Maven** — build tool

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd wasac-billing-system
```

### 2. Create the database

```sql
CREATE DATABASE wasac_billing;
```

### 3. Configure the application

Copy the example config and fill in your values:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Edit `application.properties` and set:

| Property | Description |
|---|---|
| `spring.datasource.username` | Your PostgreSQL username |
| `spring.datasource.password` | Your PostgreSQL password |
| `app.jwt.secret` | A base64-encoded secret (min 32 chars) |
| `spring.mail.username` | Your Gmail address |
| `spring.mail.password` | Your Gmail [App Password](https://myaccount.google.com/apppasswords) |

### 4. Build and run

```bash
mvn clean install
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

## API Documentation

Swagger UI is available at:

```
http://localhost:8080/swagger-ui/index.html
```

## Default Admin Account

On first startup the system seeds a default admin:

| Field | Value |
|---|---|
| Email | `admin@wasac.rw` |
| Password | `Admin@1234` |

> Change this password immediately after first login.

## Project Structure

```
src/main/java/rw/gov/wasac/billing/
├── config/          # Security, Swagger, async, data initializer
├── domain/
│   ├── entity/      # JPA entities
│   ├── enums/       # Status/type enums
│   └── repository/  # Spring Data repositories
├── exception/       # Global exception handler
├── security/        # JWT filter & provider
├── service/         # Business logic
└── web/
    ├── controller/  # REST controllers
    └── dto/         # Request/response DTOs
```

## Diagrams

- [ERD](diagrams/erd/wasac_billing_erd.dbml) — entity relationship diagram
- [Flow](diagrams/flow/wasac_billing_flow.md) — billing flow diagram
