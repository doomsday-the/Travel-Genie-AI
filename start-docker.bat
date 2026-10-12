@echo off
echo ========================================================
echo   TravelGenie AI - Docker Containerized Runner
echo ========================================================
echo.

if not exist ".env" (
    echo [.env] Copying .env.example to .env...
    copy .env.example .env
)

echo [Docker] Building and launching containers...
docker-compose up --build -d

echo [Docker] Waiting for database to initialize (10s)...
timeout /t 10 /nobreak >nul

echo [Docker] Running database migrations...
docker-compose exec -T backend python manage.py makemigrations accounts destinations trips bookings budget
docker-compose exec -T backend python manage.py migrate

echo [Docker] Loading SQL Views, Procedures, Triggers...
docker-compose exec -T backend python seed_data.py

echo.
echo ========================================================
echo   TravelGenie AI Ready!
echo   Frontend: http://localhost:5173
echo   API:      http://localhost:8000/api/
echo   Admin:    admin / admin123
echo   Traveler: traveler / traveler123
echo ========================================================
