-- Run after migrations. Table names follow Django conventions.
INSERT INTO destinations_destination (name, country, description, latitude, longitude, created_at) VALUES
('Jaipur', 'India', 'The Pink City of Rajasthan', 26.912400, 75.787300, NOW()),
('Munnar', 'India', 'Tea gardens and hill scenery in Kerala', 10.089200, 77.059500, NOW()),
('Kyoto', 'Japan', 'Temples, gardens and traditional streets', 35.011600, 135.768300, NOW()),
('Lisbon', 'Portugal', 'Hilly coastal capital with trams and viewpoints', 38.722300, -9.139300, NOW());

INSERT INTO bookings_hotel (name, destination_id, price_per_night, rating) VALUES
('Rambagh Stay', 1, 4500.00, 4.5),
('Tea Valley Resort', 2, 3200.00, 4.2),
('Kamo River Inn', 3, 9000.00, 4.6);

INSERT INTO bookings_flight (airline, origin, destination, departure, arrival, price) VALUES
('IndiGo', 'Chennai', 'Jaipur', '2026-12-01 06:30:00', '2026-12-01 09:15:00', 7200.00),
('Air India', 'Chennai', 'Tokyo', '2026-12-10 22:00:00', '2026-12-11 08:30:00', 38000.00);
