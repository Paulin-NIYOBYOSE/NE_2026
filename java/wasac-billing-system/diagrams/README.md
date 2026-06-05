# Diagrams

This folder contains source code for generating and exporting system diagrams.

---

## Folder Structure

```
diagrams/
├── erd/
│   └── wasac_billing_erd.dbml       ← Paste at dbdiagram.io to generate ERD
├── flow/
│   └── wasac_billing_flow.md        ← Paste each Mermaid block at mermaid.live
└── exports/
    ├── erd/                          ← Save your exported ERD image here
    └── flow/                         ← Save your exported flow diagram images here
```

---

## How to Generate the ERD

1. Open [https://dbdiagram.io](https://dbdiagram.io) and click **Create new diagram**
2. Copy the full content of [erd/wasac_billing_erd.dbml](erd/wasac_billing_erd.dbml)
3. Paste it into the left panel — the ERD renders instantly on the right
4. To export: click **Export** → **PNG** or **PDF**
5. Save the exported file into `exports/erd/`

**What the ERD covers (15 tables):**
- `roles`, `users`, `user_roles`, `role_requests` — identity & access
- `customers`, `meters`, `meter_readings` — field operations
- `tariffs`, `tariff_tiers` — tariff versioning
- `tax_configs`, `service_charges`, `penalties` — pricing rules
- `bills`, `payments`, `notifications` — billing lifecycle

---

## How to Generate the Flow Diagrams

1. Open [https://mermaid.live](https://mermaid.live)
2. Open [flow/wasac_billing_flow.md](flow/wasac_billing_flow.md)
3. Copy one Mermaid code block at a time (the content between the triple backticks)
4. Paste it into the Mermaid Live editor — diagram renders on the right
5. To export: click the **Download** button → choose PNG or SVG
6. Save exported files into `exports/flow/`

**10 diagrams available:**

| # | Title | Type |
|---|-------|------|
| 1 | JWT Authentication Flow | Sequence |
| 2 | System-Wide Request Flow (Security + Roles) | Flowchart |
| 3 | Customer & Meter Onboarding Flow | Flowchart |
| 4 | Meter Reading Capture Flow | Flowchart |
| 5 | Bill Generation & Approval Flow | Flowchart |
| 6 | Payment Processing Flow | Flowchart |
| 7 | Role Upgrade Request Flow | Sequence |
| 8 | Notification Flow (PostgreSQL Triggers) | Flowchart |
| 9 | Tariff Versioning Flow | Flowchart |
| 10 | Data Initialization Flow (Startup) | Flowchart |
