-- PostgreSQL Function returning category-level budget summary
CREATE OR REPLACE FUNCTION sp_trip_budget_summary(p_trip_id BIGINT)
RETURNS TABLE(category VARCHAR, total NUMERIC, entries BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT e.category, SUM(e.amount) AS total, COUNT(*) AS entries
    FROM expenses e
    WHERE e.trip_id = p_trip_id
    GROUP BY e.category
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_trip_budget_report(p_trip_id BIGINT)
RETURNS TABLE(category VARCHAR, total NUMERIC, entries BIGINT) AS $$
BEGIN
    RETURN QUERY SELECT * FROM sp_trip_budget_summary(p_trip_id);
END;
$$ LANGUAGE plpgsql;
