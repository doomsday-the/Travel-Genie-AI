-- Table for audit log if spending exceeds budget (PostgreSQL syntax)
CREATE TABLE IF NOT EXISTS expense_audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    expense_id BIGINT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(255)
);

-- 1. Trigger function: Ensure expense amount is positive
CREATE OR REPLACE FUNCTION fn_trg_expense_positive()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'Expense amount must be positive';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expense_positive ON expenses;
CREATE TRIGGER trg_expense_positive
BEFORE INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION fn_trg_expense_positive();

-- 2. Trigger function: Write audit log when expense pushes trip over budget
CREATE OR REPLACE FUNCTION fn_trg_expense_after_insert()
RETURNS TRIGGER AS $$
DECLARE
    total_spent NUMERIC(12, 2);
    trip_budget NUMERIC(12, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_spent FROM expenses WHERE trip_id = NEW.trip_id;
    SELECT total_amount INTO trip_budget FROM budgets WHERE trip_id = NEW.trip_id LIMIT 1;

    IF trip_budget IS NOT NULL AND total_spent > trip_budget THEN
        INSERT INTO expense_audit_log (trip_id, expense_id, amount, message)
        VALUES (NEW.trip_id, NEW.id, NEW.amount, 'Budget exceeded! Total spent: ' || total_spent || ' exceeds budget: ' || trip_budget);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expense_after_insert ON expenses;
CREATE TRIGGER trg_expense_after_insert
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION fn_trg_expense_after_insert();
