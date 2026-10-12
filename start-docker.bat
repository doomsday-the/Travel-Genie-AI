@echo off
echo ========================================================
echo   TravelGenie AI - Docker PostgreSQL Runner
echo ========================================================
echo.

if not exist ".env" (
    echo [.env] Copying .env.example to .env...
    copy .env.example .env
)

echo [Docker] Building and launching PostgreSQL & application containers...
docker-compose up --build -d

echo [Docker] Waiting for PostgreSQL to initialize (8s)...
timeout /t 8 /nobreak >nul

echo [Docker] Running Django migrations...
docker-compose exec -T backend python manage.py migrate

echo [Docker] Loading PostgreSQL Views, Procedures, Triggers...
docker-compose exec -T db sh -c "psql -U travelgenie -d travelgenie" < backend/migrations_sql/01_view.sql
docker-compose exec -T db sh -c "psql -U travelgenie -d travelgenie" < backend/migrations_sql/02_procedure.sql
docker-compose exec -T db sh -c "psql -U travelgenie -d travelgenie" < backend/migrations_sql/03_trigger.sql

echo [Docker] Seeding database with initial data...
docker-compose exec -T backend python seed_data.py

echo.
echo ========================================================
echo   TravelGenie AI Ready!
echo   Frontend: http://localhost:5173
echo   API:      http://localhost:8000/api/
echo   Admin:    admin / admin123
echo   Traveler: traveler / traveler123
echo ========================================================
