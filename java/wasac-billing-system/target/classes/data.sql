-- =============================================================
-- WASAC Utility Billing System - Database Routines
-- PostgreSQL Triggers and Stored Procedures
-- These run after JPA creates the schema (defer-datasource-initialization=true)
-- =============================================================

-- =============================================================
-- STORED PROCEDURE: Generate a unique bill reference number
-- Usage: SELECT generate_bill_reference('WATER', 2024, 6);
-- =============================================================
CREATE OR REPLACE FUNCTION generate_bill_reference(
    p_meter_type VARCHAR,
    p_year       INT,
    p_month      INT
) RETURNS VARCHAR AS $$
DECLARE
    v_count     INT;
    v_type_code CHAR(1);
    v_reference VARCHAR(50);
BEGIN
    SELECT COUNT(*) + 1 INTO v_count
    FROM bills
    WHERE billing_year = p_year AND billing_month = p_month;

    v_type_code := UPPER(SUBSTR(p_meter_type, 1, 1));

    v_reference := 'WASAC-' || p_year
                || '-' || LPAD(p_month::TEXT, 2, '0')
                || '-' || v_type_code
                || '-' || LPAD(v_count::TEXT, 6, '0');
    RETURN v_reference;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- TRIGGER FUNCTION 1: On bill INSERT → notify customer
-- Message format: "Dear <name>, Your <Month>/<Year> utility bill of <Amount> FRW has been successfully processed."
-- =============================================================
CREATE OR REPLACE FUNCTION fn_notify_on_bill_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_name TEXT;
    v_month_name    TEXT;
    v_message       TEXT;
BEGIN
    SELECT full_names INTO v_customer_name
    FROM customers
    WHERE id = NEW.customer_id;

    v_month_name := TO_CHAR(TO_DATE(NEW.billing_month::TEXT, 'MM'), 'FMMonth');

    v_message := 'Dear ' || v_customer_name
              || ', Your ' || v_month_name || '/' || NEW.billing_year
              || ' utility bill of ' || TO_CHAR(NEW.total_amount, 'FM999,999,990.00')
              || ' FRW has been successfully processed.';

    INSERT INTO notifications (customer_id, message, notification_type, is_read, created_at)
    VALUES (NEW.customer_id, v_message, 'BILL_GENERATED', false, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_on_bill_insert ON bills;
CREATE TRIGGER trg_notify_on_bill_insert
    AFTER INSERT ON bills
    FOR EACH ROW
    EXECUTE FUNCTION fn_notify_on_bill_insert();


-- =============================================================
-- TRIGGER FUNCTION 2: On bill UPDATE when outstanding_balance → 0
--   → update status to PAID and notify customer
-- =============================================================
CREATE OR REPLACE FUNCTION fn_notify_on_full_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_name TEXT;
    v_month_name    TEXT;
    v_message       TEXT;
BEGIN
    -- Only fire when balance just reached zero
    IF NEW.outstanding_balance <= 0 AND OLD.outstanding_balance > 0 THEN

        SELECT full_names INTO v_customer_name
        FROM customers
        WHERE id = NEW.customer_id;

        v_month_name := TO_CHAR(TO_DATE(NEW.billing_month::TEXT, 'MM'), 'FMMonth');

        v_message := 'Dear ' || v_customer_name
                  || ', Your ' || v_month_name || '/' || NEW.billing_year
                  || ' utility bill of ' || TO_CHAR(NEW.total_amount, 'FM999,999,990.00')
                  || ' FRW has been successfully processed.';

        INSERT INTO notifications (customer_id, message, notification_type, is_read, created_at)
        VALUES (NEW.customer_id, v_message, 'PAYMENT_CONFIRMED', false, NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_on_full_payment ON bills;
CREATE TRIGGER trg_notify_on_full_payment
    AFTER UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION fn_notify_on_full_payment();


-- =============================================================
-- STORED PROCEDURE (CURSOR-based): Monthly billing report
-- Returns a summary of all bills for a given month/year
-- Usage: SELECT * FROM get_monthly_billing_report(2024, 6);
-- =============================================================
CREATE OR REPLACE FUNCTION get_monthly_billing_report(
    p_year  INT,
    p_month INT
) RETURNS TABLE (
    customer_name    TEXT,
    meter_number     TEXT,
    meter_type       TEXT,
    bill_reference   TEXT,
    total_amount     NUMERIC,
    amount_paid      NUMERIC,
    outstanding      NUMERIC,
    bill_status      TEXT
) AS $$
DECLARE
    r_bill RECORD;
    cur_bills CURSOR FOR
        SELECT
            c.full_names   AS cname,
            m.meter_number AS mnum,
            m.meter_type   AS mtype,
            b.bill_reference,
            b.total_amount,
            b.amount_paid,
            b.outstanding_balance,
            b.status
        FROM bills b
        JOIN customers c ON c.id = b.customer_id
        JOIN meters    m ON m.id = b.meter_id
        WHERE b.billing_year = p_year AND b.billing_month = p_month
        ORDER BY c.full_names;
BEGIN
    OPEN cur_bills;
    LOOP
        FETCH cur_bills INTO r_bill;
        EXIT WHEN NOT FOUND;

        customer_name  := r_bill.cname;
        meter_number   := r_bill.mnum;
        meter_type     := r_bill.mtype;
        bill_reference := r_bill.bill_reference;
        total_amount   := r_bill.total_amount;
        amount_paid    := r_bill.amount_paid;
        outstanding    := r_bill.outstanding_balance;
        bill_status    := r_bill.status;

        RETURN NEXT;
    END LOOP;
    CLOSE cur_bills;
END;
$$ LANGUAGE plpgsql;
