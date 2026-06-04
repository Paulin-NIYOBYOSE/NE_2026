# Diagrams & Architecture Documentation

This folder contains all architecture, DFD, and database design files for the **Fire Extinguisher Management System**.

## Folder Structure

```
diagrams/
  README.md                          ← This file
  mermaid/                           ← Mermaid diagram source files
    system-architecture.mmd          ← System architecture diagram
    dfd-level0.mmd                   ← Data Flow Diagram Level 0 (Context)
    dfd-level1.mmd                   ← Data Flow Diagram Level 1 (Decomposed)
  dbml/                              ← Database design files
    database-schema.dbml             ← Complete DBML schema code
  outputs/                           ← ← SAVE YOUR RENDERED IMAGES HERE
    (empty — for you to fill)
```

---

## How to Generate Visual Diagrams

### 1. System Architecture Diagram

**File:** `mermaid/system-architecture.mmd`

**Steps:**
1. Go to https://mermaid.live
2. Open the `.mmd` file and copy its contents
3. Paste into the Mermaid Live Editor
4. Click **"PNG"** or **"SVG"** button to download
5. **Save the image to:** `outputs/system-architecture.png`

**What it shows:**
- React frontend (port 3000)
- API Gateway (port 5000)
- 7 microservices (ports 5001-5007)
- RabbitMQ message bus
- PostgreSQL database with 7 schemas

---

### 2. DFD Level 0 (Context Diagram)

**File:** `mermaid/dfd-level0.mmd`

**Steps:**
1. Go to https://mermaid.live
2. Copy contents of `dfd-level0.mmd`
3. Paste into editor
4. Export as PNG/SVG
5. **Save to:** `outputs/dfd-level0.png`

**What it shows:**
- External entity (User)
- System boundary (all microservices)
- Data flows numbered 1-8
- External systems (PostgreSQL, RabbitMQ, SMTP)

---

### 3. DFD Level 1 (Decomposed)

**File:** `mermaid/dfd-level1.mmd`

**Steps:**
1. Go to https://mermaid.live
2. Copy contents of `dfd-level1.mmd`
3. Paste into editor
4. Export as PNG/SVG
5. **Save to:** `outputs/dfd-level1.png`

**What it shows:**
- 8 numbered processes (1.0 Gateway through 8.0 Notification)
- All data flows between processes
- All data stores (8 tables)
- RabbitMQ event queue and SMTP

---

### 4. Database ER Diagram

**File:** `dbml/database-schema.dbml`

**Steps:**
1. Go to https://dbdiagram.io
2. Create a new diagram (no account needed)
3. Click **"Import"** → **"DBML"**
4. Copy contents of `database-schema.dbml` and paste
5. The ER diagram auto-generates with all tables, relationships, and sample data
6. Click **"Export"** → **"PNG"** or **"SVG"**
7. **Save to:** `outputs/database-er-diagram.png`

**What it shows:**
- 8 tables across 7 PostgreSQL schemas
- 11 enums with all values
- 8 logical cross-service relationships
- 15 named indexes
- Sample data for every table

---

## Expected Output Files

After generating all diagrams, your `outputs/` folder should look like:

```
outputs/
  system-architecture.png
  dfd-level0.png
  dfd-level1.png
  database-er-diagram.png
```

---

## Quick Reference Table

| Diagram | Source File | Tool | Output File |
|---------|-------------|------|-------------|
| System Architecture | `mermaid/system-architecture.mmd` | [mermaid.live](https://mermaid.live) | `outputs/system-architecture.png` |
| DFD Level 0 | `mermaid/dfd-level0.mmd` | [mermaid.live](https://mermaid.live) | `outputs/dfd-level0.png` |
| DFD Level 1 | `mermaid/dfd-level1.mmd` | [mermaid.live](https://mermaid.live) | `outputs/dfd-level1.png` |
| Database ER | `dbml/database-schema.dbml` | [dbdiagram.io](https://dbdiagram.io) | `outputs/database-er-diagram.png` |

---

## Tips for Exam Presentation

1. **Architecture diagram** — Use this to explain microservices to examiners
2. **DFD Level 0** — Show the big picture: who uses the system, what data flows
3. **DFD Level 1** — Break down into processes to show you understand data flow in detail
4. **ER Diagram** — Show normalized database design with proper relationships

All diagrams demonstrate:
- **Microservices architecture** (7 independent services + gateway)
- **Event-driven communication** (RabbitMQ)
- **Database-per-service** pattern (7 PostgreSQL schemas)
- **Cross-service data relationships** (logical foreign keys)
