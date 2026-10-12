# 🌍 TravelGenie AI — Intelligent Trip Planner & Expense Intelligence

An AI-powered, production-grade travel planning and budgeting ecosystem built with **React (Vite) + Leaflet (OpenStreetMap)**, **Django REST Framework**, and **MySQL 8 (3NF Relational Architecture)**.

---

## ⚡ Quick Start: Instant Running on Any PC

### Option A: Instant 1-Click Local (Zero Docker Setup Required)
Ideal when cloning on a laptop without Docker or MySQL installed:

#### Windows:
```cmd
start-local.bat
```

#### macOS / Linux:
```bash
chmod +x start-local.sh
./start-local.sh
```
*Automatically sets up Python virtualenv, installs packages, runs database migrations, seeds rich demo data (cities, hotels, flights, attractions), and starts frontend & backend.*

---

### Option B: Containerized Run with Docker Compose (MySQL 8)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and launch containers
docker-compose up --build -d

# 3. Apply relational migrations & seed database
docker-compose exec -T backend python manage.py makemigrations accounts destinations trips bookings budget
docker-compose exec -T backend python manage.py migrate
docker-compose exec -T backend python seed_data.py
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Django REST API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **Django Administration**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 👥 Default Demo Credentials (RBAC)

| Account Role | Username | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Full access: Destinations, Attractions, All Users directory, Platform Analytics. |
| **Traveler (User)** | `traveler` | `traveler123` | Personal trips, AI planner, Booking engine, Budget tracking & expenses. |

---

## 🏗️ Technical Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Frontend** | React 18 (Vite) + React Router v6 | Ultra-fast SPA, responsive mobile-friendly layout |
| **Maps** | Leaflet + OpenStreetMap | Interactive, 100% free geographic mapping with zero API keys |
| **Backend** | Django 5 + Django REST Framework | Battle-tested ORM, native Argon2 password hashing, RBAC |
| **Database** | MySQL 8 (with SQLite local fallback) | 3NF normalized tables, SQL views, stored procedures, triggers |
| **Authentication** | JWT (`djangorestframework-simplejwt`) | Token rotation, blacklisting, `/api/auth/me/` RBAC state |
| **AI Engine** | Google Gemini / Groq API + Fallback | Structured JSON generation saved into normalized database tables |
| **Live External Data** | Open-Meteo & Free FX API | Live weather forecasts and exchange rates at zero cost |

---

## 🗄️ Relational Database Architecture (12 Tables in 3NF)

1. `roles` (`role_id`, `role_name`)
2. `users` (`id`, `username`, `email`, `password`, `role`, `role_id` FK, `date_joined`)
3. `destinations` (`id`, `name`, `country`, `currency_code`, `visa_info`, `best_season`, `latitude`, `longitude`)
4. `attractions` (`id`, `destination_id` FK, `name`, `category`, `avg_cost`, `latitude`, `longitude`)
5. `trips` (`id`, `user_id` FK, `destination_id` FK, `title`, `start_date`, `end_date`, `status`, `prompt_text`)
6. `itinerary_days` (`id`, `trip_id` FK, `day_number`, `summary`, `date`)
7. `itinerary_items` (`id`, `day_id` FK, `attraction_id` FK NULL, `title`, `start_time`, `est_cost`, `notes`)
8. `flights` (`id`, `origin`, `destination_id` FK, `airline`, `depart_at`, `price`)
9. `hotels` (`id`, `destination_id` FK, `name`, `price_per_night`, `rating`)
10. `bookings` (`id`, `user_id` FK, `trip_id` FK, `booking_type`, `flight_id` FK NULL, `hotel_id` FK NULL, `amount`, `status`, `booked_at`)
11. `budgets` (`id`, `trip_id` FK UNIQUE, `total_amount`, `currency`)
12. `expenses` (`id`, `trip_id` FK, `category`, `amount`, `spent_on`, `note`)
*(Plus `packing_items` and `weather_cache`)*

### Database Integrity Constraints:
- `CHECK (end_date >= start_date)`
- `CHECK (price >= 0)` and `CHECK (amount >= 0)`
- `DEFAULT 'planned'` on trip status
- `UNIQUE (email)` and `UNIQUE (username)`

---

## ⚙️ Advanced SQL Objects (Raw SQL)

- **SQL View (`v_trip_cost_summary` / `v_trip_spend`)**: Aggregates total spent per trip and computes remaining allowance dynamically.
- **Stored Procedure (`sp_trip_budget_report`)**: Generates category-level expenditure breakdown for a given `trip_id`.
- **Triggers**:
  - `trg_expense_positive`: Rejects non-positive expense amounts (`SIGNAL SQLSTATE '45000'`).
  - `trg_expense_after_insert`: Audits and flags records when a trip exceeds its allocated budget.
- **Atomic Transactions**: Booking creation (`POST /api/bookings/`) executes in `transaction.atomic()` to create both the Booking row and an Expense entry simultaneously (all-or-nothing).

---

## 📁 Repository Layout

```
├── backend/
│   ├── accounts/          # Custom User model, Roles, JWT Auth & User Admin
│   ├── destinations/      # Destinations, Attractions, Open-Meteo Weather
│   ├── trips/             # Trips, Days, Items, Packing Checklist
│   ├── bookings/          # Flights, Hotels, Atomic Reservations
│   ├── budget/            # Budgets, Expenses, SQL Views & Stored Procs
│   ├── ai_planner/        # LLM Client (Gemini/Groq) with Fallback Generator
│   ├── config/            # Django settings (MySQL + SQLite fallback), URLs
│   ├── migrations_sql/    # Raw SQL objects (View, Procedure, Trigger)
│   └── seed_data.py       # Comprehensive 3NF demo database seeder
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance with JWT interceptor
│   │   ├── auth/          # AuthContext & ProtectedRoute guards
│   │   ├── pages/         # Dashboard, Trips, TripDetail, PlanTrip, Bookings, Budget
│   │   │   └── admin/     # Destinations, Users, Analytics
│   │   └── main.jsx       # Theme, dynamic RBAC navigation, and Router
├── docs/
│   ├── ARCHITECTURE.md    # Detailed architecture, ER Diagram & Relational Schema
│   └── screenshots/       # Application screenshots
├── docker-compose.yml
├── start-local.bat        # 1-Click Windows Local Runner
├── start-local.sh         # 1-Click Linux/Mac Local Runner
└── README.md
```
