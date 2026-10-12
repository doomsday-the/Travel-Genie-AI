-- Create view v_trip_spend and alias v_trip_cost_summary
CREATE OR REPLACE VIEW v_trip_spend AS
SELECT t.id AS trip_id, t.title, b.total_amount AS budget,
       COALESCE(SUM(e.amount), 0) AS spent,
       b.total_amount - COALESCE(SUM(e.amount), 0) AS remaining
FROM trips t
JOIN budgets b ON b.trip_id = t.id
LEFT JOIN expenses e ON e.trip_id = t.id
GROUP BY t.id, t.title, b.total_amount;

CREATE OR REPLACE VIEW v_trip_cost_summary AS
SELECT * FROM v_trip_spend;
