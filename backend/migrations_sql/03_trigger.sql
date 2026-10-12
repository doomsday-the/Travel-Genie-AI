-- Table for audit log if spending exceeds budget
CREATE TABLE IF NOT EXISTS expense_audit_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    expense_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(255)
);

DROP TRIGGER IF EXISTS trg_expense_positive;
DELIMITER //
CREATE TRIGGER trg_expense_positive BEFORE INSERT ON expenses
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expense amount must be positive';
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_expense_after_insert;
DELIMITER //
CREATE TRIGGER trg_expense_after_insert AFTER INSERT ON expenses
FOR EACH ROW
BEGIN
    DECLARE total_spent DECIMAL(12, 2);
    DECLARE trip_budget DECIMAL(12, 2);

    SELECT COALESCE(SUM(amount), 0) INTO total_spent FROM expenses WHERE trip_id = NEW.trip_id;
    SELECT total_amount INTO trip_budget FROM budgets WHERE trip_id = NEW.trip_id LIMIT 1;

    IF trip_budget IS NOT NULL AND total_spent > trip_budget THEN
        INSERT INTO expense_audit_log (trip_id, expense_id, amount, message)
        VALUES (NEW.trip_id, NEW.id, NEW.amount, CONCAT('Budget exceeded! Total spent: ', total_spent, ' exceeds budget: ', trip_budget));
    END IF;
END //
DELIMITER ;
