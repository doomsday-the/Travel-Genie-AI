@echo off
echo ========================================================
echo   TravelGenie AI - Instant 1-Click Local Runner
echo ========================================================
echo.

cd backend
if not exist "venv" (
    echo [1/4] Creating Python virtual environment...
    py -3.12 -m venv venv || python -m venv venv
)

echo [2/4] Ensuring dependencies are installed...
call venv\Scripts\activate
pip install -r requirements.txt

echo [3/4] Applying database migrations...
set USE_SQLITE=True
python manage.py makemigrations accounts destinations trips bookings budget
python manage.py migrate

echo [4/4] Seeding initial database (Destinations, Hotels, Flights, Users)...
python seed_data.py

echo.
echo ========================================================
echo   Starting TravelGenie AI Services!
echo   Frontend: http://localhost:5173
echo   API:      http://localhost:8000/api/
echo   Admin:    admin / admin123
echo   Traveler: traveler / traveler123
echo ========================================================
echo.

start "TravelGenie Backend (Django)" cmd /k "call venv\Scripts\activate && set USE_SQLITE=True && python manage.py runserver 0.0.0.0:8000"
cd ..\frontend
if not exist "node_modules" (
    echo [Frontend] Installing node dependencies...
    call npm install
)
start "TravelGenie Frontend (Vite)" cmd /k "npm run dev"
