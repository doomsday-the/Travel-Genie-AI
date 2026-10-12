#!/bin/bash
set -e

echo "========================================================"
echo "  TravelGenie AI - Docker Containerized Runner          "
echo "========================================================"

if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

docker-compose up --build -d
echo "Waiting 10s for MySQL initialization..."
sleep 10

docker-compose exec -T backend python manage.py makemigrations accounts destinations trips bookings budget
docker-compose exec -T backend python manage.py migrate
docker-compose exec -T backend python seed_data.py

echo "TravelGenie AI Ready!"
echo "Frontend: http://localhost:5173"
echo "API:      http://localhost:8000/api/"
