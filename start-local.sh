#!/bin/bash
set -e

echo "========================================================"
echo "  TravelGenie AI - Instant 1-Click Local Runner (POSIX) "
echo "========================================================"

cd backend
if [ ! -d "venv" ]; then
    echo "[1/4] Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "[2/4] Applying database migrations..."
export USE_SQLITE=True
python manage.py makemigrations accounts destinations trips bookings budget
python manage.py migrate

echo "[3/4] Seeding initial database..."
python seed_data.py

echo "[4/4] Starting backend & frontend..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "TravelGenie AI is running!"
echo "Frontend: http://localhost:5173"
echo "API:      http://localhost:8000/api/"

wait $BACKEND_PID $FRONTEND_PID
