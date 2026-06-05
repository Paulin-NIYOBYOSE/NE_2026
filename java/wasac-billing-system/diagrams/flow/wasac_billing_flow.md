# WASAC Utility Billing System — Flow Diagram

Paste the Mermaid block below at: https://mermaid.live

```mermaid
flowchart TD

    %% ── ENTRY POINT ──────────────────────────────────────────
    Client([HTTP Request]) --> JWT[JWT Authentication Filter\nValidate Bearer Token]
    JWT --> |Invalid / Missing| E1([401 Unauthorized])
    JWT --> |Valid| Role{Role-Based Access\n@PreAuthorize}
    Role --> |Denied| E2([403 Forbidden])

    %% ── ROLE BRANCHES ────────────────────────────────────────
    Role --> |Public| Auth
    Role --> |ADMIN| Setup
    Role --> |ADMIN| UserMgmt
    Role --> |OPERATOR| Reading
    Role --> |ADMIN · FINANCE| Billing
    Role --> |FINANCE| Payment
    Role --> |CUSTOMER\nACTIVE only| Portal

    %% ── PUBLIC — AUTH ────────────────────────────────────────
    subgraph Auth["  Public — Authentication  "]
        direction LR
        R1[POST /api/auth/register\nfull_names · email · phone\nnational_id · address · password]
        R1 --> R2{NID unique?\nEmail unique?}
        R2 --> |No| R3([409 Conflict])
        R2 --> |Yes| R4[(Create User ACTIVE\n+ Customer INACTIVE\nlinked together)]
        R4 --> R5([JWT token\ncustomer_status: INACTIVE])

        L1[POST /api/auth/login] --> L2[(Authenticate\nreturn JWT\n+ customer_status)]
    end

    %% ── ADMIN — SYSTEM SETUP ─────────────────────────────────
    subgraph Setup["  ADMIN — System Setup  "]
        direction LR
        T1[Configure Tariff\nFLAT or TIER_BASED\neffective_from / effective_to\nauto-versioned]
        T1 --> T2[Configure VAT\nrate = 0.18 → 18%]
        T2 --> T3[Service Charges\nfixed FRW per meter type]
        T3 --> T4[Penalty Rules\nFIXED or % of bill]
    end

    %% ── ADMIN — USER & CUSTOMER MANAGEMENT ──────────────────
    subgraph UserMgmt["  ADMIN — User & Customer Management  "]
        direction LR
        U1[Create User\nwith specific role] --> U2[Create Meter\nassign to customer]
        U2 --> U3[PATCH /api/customers/id/approve\nstatus INACTIVE → ACTIVE\nbilling unlocked]
        U3 --> U4[Deactivate / reactivate\nusers and customers]
    end

    %% ── OPERATOR — METER READING ─────────────────────────────
    subgraph Reading["  OPERATOR — Meter Reading  "]
        MV{Meter ACTIVE?\ncurrent > previous?\nNo duplicate this month?}
        MV --> |Fail| ME([400 Business Error])
        MV --> |Pass| MS[(Save MeterReading\nconsumption = current − previous)]
    end

    %% ── BILLING ENGINE ───────────────────────────────────────
    subgraph Billing["  ADMIN · FINANCE — Billing Engine  "]
        MS --> BT[Find tariff valid\non reading date\neffective_from ≤ date ≤ effective_to]
        BT --> BF[consumption × rate = consumption_amount\nsubtotal = consumption_amount + service_charge\nVAT = subtotal × tax_rate\ntotal = subtotal + VAT + overdue penalty]
        BF --> BP[(Bill saved\nstatus = PENDING\ndue = today + 30 days)]
        BP --> |PostgreSQL trigger| BN[(Notification\nBILL_GENERATED\nauto-inserted)]
        BP --> BA[PATCH approve\nstatus → APPROVED]
        BA --> BR[PATCH reject\nstatus → REJECTED]
    end

    %% ── SCHEDULED AUTO-BILLING ───────────────────────────────
    subgraph Scheduler["  Scheduled — Auto Billing  "]
        SC([02:00 · 1st of every month]) --> SS[Scan all ACTIVE meters]
        SS --> SQ{Reading for\nprevious month?\nNo bill yet?}
        SQ --> |Yes| SA[Generate Bill automatically]
        SQ --> |No| SK([Skip meter])
        SA --> BP
    end

    %% ── PAYMENT ──────────────────────────────────────────────
    subgraph Payment["  FINANCE — Payment  "]
        BA --> PR[POST /api/payments\nbillReference · amount · method]
        PR --> PG{Bill = APPROVED?}
        PG --> |No| PE([400 Business Error\nOnly APPROVED bills can be paid])
        PG --> |Yes| PC[Cap payment at\noutstanding_balance]
        PC --> PS[(Save Payment\nUpdate bill balance)]
        PS --> PB{balance = 0?}
        PB --> |No| PP[(Bill stays APPROVED\nPartial payment recorded)]
        PB --> |Yes| PF[(Bill status → PAID)]
        PF --> |PostgreSQL trigger| PN[(Notification\nPAYMENT_CONFIRMED\n'bill fully paid')]
    end

    %% ── CUSTOMER PORTAL ──────────────────────────────────────
    subgraph Portal["  CUSTOMER — Self-Service\n  (ACTIVE accounts only)  "]
        CV[GET /api/bills/my\nGET /api/payments/my\nGET /api/notifications/my\nPATCH notification/id/read]
    end

    BN --> Portal
    PP --> Portal
    PN --> Portal

    %% ── STYLES ───────────────────────────────────────────────
    style E1   fill:#e55,color:#fff,stroke:#c00
    style E2   fill:#e55,color:#fff,stroke:#c00
    style R3   fill:#e55,color:#fff,stroke:#c00
    style ME   fill:#e55,color:#fff,stroke:#c00
    style PE   fill:#e55,color:#fff,stroke:#c00
    style SK   fill:#e55,color:#fff,stroke:#c00
    style BP   fill:#336791,color:#fff,stroke:#234f6e
    style MS   fill:#336791,color:#fff,stroke:#234f6e
    style R4   fill:#336791,color:#fff,stroke:#234f6e
    style PS   fill:#336791,color:#fff,stroke:#234f6e
    style PP   fill:#336791,color:#fff,stroke:#234f6e
    style PF   fill:#336791,color:#fff,stroke:#234f6e
    style BN   fill:#336791,color:#fff,stroke:#234f6e
    style PN   fill:#336791,color:#fff,stroke:#234f6e
    style BF   fill:#2a6,color:#fff,stroke:#1a5
    style SC   fill:#a47,color:#fff,stroke:#834
    style R5   fill:#2a6,color:#fff,stroke:#1a5
```
