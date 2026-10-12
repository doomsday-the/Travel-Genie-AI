DROP PROCEDURE IF EXISTS sp_trip_budget_summary;
DELIMITER //
CREATE PROCEDURE sp_trip_budget_summary(IN p_trip_id BIGINT)
BEGIN
    SELECT e.category, SUM(e.amount) AS total, COUNT(*) AS entries
    FROM expenses e
    WHERE e.trip_id = p_trip_id
    GROUP BY e.category
    ORDER BY total DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_trip_budget_report;
DELIMITER //
CREATE PROCEDURE sp_trip_budget_report(IN p_trip_id BIGINT)
BEGIN
    CALL sp_trip_budget_summary(p_trip_id);
END //
DELIMITER ;
