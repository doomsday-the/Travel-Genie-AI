#!/bin/bash
set -e

echo "========================================================"
echo "  TravelGenie AI - Docker PostgreSQL Runner (POSIX)     "
echo "========================================================"

if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

docker-compose up --build -d
echo "Waiting 8s for PostgreSQL initialization..."
sleep 8

docker-compose exec -T backend python manage.py migrate
docker-compose exec -T db sh -c 'psql -U "${POSTGRES_USER:-travelgenie}" -d "${POSTGRES_DB:-travelgenie}"' < backend/migrations_sql/01_view.sql
docker-compose exec -T db sh -c 'psql -U "${POSTGRES_USER:-travelgenie}" -d "${POSTGRES_DB:-travelgenie}"' < backend/migrations_sql/02_procedure.sql
docker-compose exec -T db sh -c 'psql -U "${POSTGRES_USER:-travelgenie}" -d "${POSTGRES_DB:-travelgenie}"' < backend/migrations_sql/03_trigger.sql
docker-compose exec -T backend python seed_data.py

echo "TravelGenie AI Ready!"
echo "Frontend: http://localhost:5173"
echo "API:      http://localhost:8000/api/"
