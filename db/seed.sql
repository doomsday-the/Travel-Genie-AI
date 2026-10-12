-- Run after migrations. Table names match 3NF schema.
INSERT INTO destinations (name, country, currency_code, visa_info, best_season, description, latitude, longitude, created_at) VALUES
('Jaipur', 'India', 'INR', 'Domestic travel / eVisa', 'October to March', 'The Pink City of Rajasthan', 26.912400, 75.787300, NOW()),
('Kyoto', 'Japan', 'JPY', 'eVisa / Visa-waiver', 'March to May', 'Temples, gardens and traditional streets', 35.011600, 135.768300, NOW()),
('Lisbon', 'Portugal', 'EUR', 'Schengen Visa', 'May to October', 'Hilly coastal capital with trams and viewpoints', 38.722300, -9.139300, NOW()),
('Bali', 'Indonesia', 'IDR', 'Visa on Arrival', 'April to October', 'Island paradise with beaches and rice terraces', -8.409500, 115.188900, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, destination_id, price_per_night, rating) VALUES
('Rambagh Stay', 1, 4500.00, 4.5),
('Kamo River Inn', 2, 9000.00, 4.6),
('Lisbon Heritage Hotel', 3, 7200.00, 4.4)
ON CONFLICT DO NOTHING;

INSERT INTO flights (airline, origin, destination_id, depart_at, arrival_at, price) VALUES
('IndiGo', 'Chennai', 1, '2026-12-01 06:30:00', '2026-12-01 09:15:00', 7200.00),
('Air India', 'Delhi', 2, '2026-12-10 22:00:00', '2026-12-11 08:30:00', 38000.00)
ON CONFLICT DO NOTHING;
