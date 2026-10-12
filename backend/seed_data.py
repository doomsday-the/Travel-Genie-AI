import os
import django
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Role
from destinations.models import Destination, Attraction
from bookings.models import Flight, Hotel, Booking
from trips.models import Trip, ItineraryDay, ItineraryItem, PackingItem
from budget.models import Budget, Expense

User = get_user_model()


def seed():
    print("[Seeder] Starting TravelGenie AI Database Seeder...")

    # 1. Seed Roles
    admin_role, _ = Role.objects.get_or_create(role_name="admin")
    user_role, _ = Role.objects.get_or_create(role_name="user")

    # 2. Seed Users
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@travelgenie.ai",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
            "role_ref": admin_role,
            "is_staff": True,
            "is_superuser": True,
        },
    )
    if created:
        admin_user.set_password("admin123")
        admin_user.save()
        print("   Created Admin user: admin / admin123")

    traveler_user, created = User.objects.get_or_create(
        username="traveler",
        defaults={
            "email": "traveler@travelgenie.ai",
            "first_name": "Alex",
            "last_name": "Wanderer",
            "role": "user",
            "role_ref": user_role,
        },
    )
    if created:
        traveler_user.set_password("traveler123")
        traveler_user.save()
        print("   Created Traveler user: traveler / traveler123")

    # 3. Seed Destinations
    dest_data = [
        {
            "name": "Jaipur",
            "country": "India",
            "currency_code": "INR",
            "visa_info": "Domestic travel for Indian citizens / eVisa for foreign visitors",
            "best_season": "October to March",
            "description": "The Pink City of Rajasthan, famous for royal palaces and historic forts",
            "latitude": 26.9124,
            "longitude": 75.7873,
            "attractions": [
                ("Hawa Mahal", "Architecture", 200, 26.9239, 75.8267, "Palace of Winds with honeycomb windows"),
                ("Amber Fort", "Historical Fort", 500, 26.9855, 75.8513, "Majestic hilltop fort with elephant pathway"),
                ("City Palace", "Museum / Palace", 300, 26.9258, 75.8237, "Courtyards, gardens and royal royal museum"),
                ("Chokhi Dhani", "Cultural Experience", 1200, 26.7663, 75.8360, "Traditional Rajasthani village hospitality and food"),
            ],
            "hotels": [
                ("Rambagh Palace Heritage", 14500, 4.9),
                ("Jai Mahal Palace", 8500, 4.7),
                ("Pink City Haveli Stay", 3200, 4.4),
            ],
            "flights": [
                ("IndiGo", "Delhi", "2026-11-10 07:15:00", "2026-11-10 08:15:00", 3500),
                ("Air India", "Mumbai", "2026-11-10 10:30:00", "2026-11-10 12:15:00", 5200),
                ("SpiceJet", "Bangalore", "2026-11-10 14:00:00", "2026-11-10 16:30:00", 6800),
            ],
        },
        {
            "name": "Kyoto",
            "country": "Japan",
            "currency_code": "JPY",
            "visa_info": "eVisa / Visa-waiver for 68 countries",
            "best_season": "March to May & October to November",
            "description": "Ancient imperial capital with thousands of classical Buddhist temples and gardens",
            "latitude": 35.0116,
            "longitude": 135.7683,
            "attractions": [
                ("Fushimi Inari Shrine", "Shinto Shrine", 0, 34.9671, 135.7727, "Famous path of 10,000 orange Torii gates"),
                ("Kinkaku-ji (Golden Pavilion)", "Zen Temple", 500, 35.0394, 135.7292, "Zen temple covered in pure gold leaf"),
                ("Arashiyama Bamboo Grove", "Nature Walk", 0, 35.0160, 135.6713, "Enchanting path surrounded by soaring bamboo stems"),
                ("Gion Historic Quarter", "Cultural Walk", 0, 35.0037, 135.7770, "Traditional wooden Machiya houses and geisha district"),
            ],
            "hotels": [
                ("The Ritz-Carlton Kyoto", 24000, 4.9),
                ("Kamo River Ryokan Inn", 8900, 4.6),
                ("Kyoto Central Machiya", 4800, 4.3),
            ],
            "flights": [
                ("Japan Airlines", "Tokyo", "2026-12-01 08:00:00", "2026-12-01 09:15:00", 7500),
                ("ANA", "Delhi", "2026-12-01 23:00:00", "2026-12-02 09:30:00", 38000),
            ],
        },
        {
            "name": "Lisbon",
            "country": "Portugal",
            "currency_code": "EUR",
            "visa_info": "Schengen Visa required for non-EU travelers",
            "best_season": "May to October",
            "description": "Hilly, coastal capital known for its cafe culture and soulful Fado music",
            "latitude": 38.7223,
            "-longitude": 9.1393,
            "longitude": -9.1393,
            "attractions": [
                ("Belém Tower", "Historical Monument", 800, 38.6916, -9.2160, "16th-century fortress on the Tagus River"),
                ("Jerónimos Monastery", "World Heritage Site", 1000, 38.6979, -9.2067, "Gothic Manueline architecture"),
                ("Alfama District Walk", "Historic Neighborhood", 0, 38.7126, -9.1303, "Steep alleys with views, trams, and Fado taverns"),
            ],
            "hotels": [
                ("Bairro Alto Boutique Hotel", 11200, 4.7),
                ("Alfama Heritage Suites", 6400, 4.4),
            ],
            "flights": [
                ("TAP Air Portugal", "London", "2026-11-15 06:45:00", "2026-11-15 09:30:00", 8200),
                ("Lufthansa", "Frankfurt", "2026-11-15 11:20:00", "2026-11-15 13:30:00", 11500),
            ],
        },
        {
            "name": "Bali",
            "country": "Indonesia",
            "currency_code": "IDR",
            "visa_info": "30-day Visa on Arrival available for 90+ nationalities",
            "best_season": "April to October",
            "description": "Island paradise renowned for forested volcanic mountains, iconic rice paddies, and beaches",
            "latitude": -8.4095,
            "longitude": 115.1889,
            "attractions": [
                ("Uluwatu Temple", "Sea Temple", 350, -8.8291, 115.0849, "Cliffside temple with dramatic sunsets and Kecak dance"),
                ("Tegallalang Rice Terraces", "Scenic Landscape", 200, -8.4316, 115.2798, "Cascading emerald rice terraces in Ubud"),
                ("Sacred Monkey Forest Sanctuary", "Nature & Wildlife", 450, -8.5188, 115.2588, "Natural forest reserve with over 1,000 long-tailed macaques"),
            ],
            "hotels": [
                ("Four Seasons Resort Sayan", 22000, 4.9),
                ("Ubud Jungle Haven Resort", 5500, 4.5),
                ("Canggu Beachfront Villas", 3800, 4.3),
            ],
            "flights": [
                ("Singapore Airlines", "Singapore", "2026-11-20 09:15:00", "2026-11-20 12:05:00", 12000),
                ("AirAsia", "Kuala Lumpur", "2026-11-20 15:30:00", "2026-11-20 18:35:00", 7800),
            ],
        },
    ]

    for d_info in dest_data:
        dest, _ = Destination.objects.get_or_create(
            name=d_info["name"],
            defaults={
                "country": d_info["country"],
                "currency_code": d_info["currency_code"],
                "visa_info": d_info["visa_info"],
                "best_season": d_info["best_season"],
                "description": d_info["description"],
                "latitude": d_info["latitude"],
                "longitude": d_info["longitude"],
            },
        )
        for name, cat, cost, lat, lng, desc in d_info.get("attractions", []):
            Attraction.objects.get_or_create(
                destination=dest,
                name=name,
                defaults={
                    "category": cat,
                    "avg_cost": cost,
                    "latitude": lat,
                    "longitude": lng,
                    "description": desc,
                },
            )
        for h_name, h_price, h_rating in d_info.get("hotels", []):
            Hotel.objects.get_or_create(
                destination=dest,
                name=h_name,
                defaults={
                    "price_per_night": h_price,
                    "rating": h_rating,
                },
            )
        for airline, orig, dep, arr, price in d_info.get("flights", []):
            Flight.objects.get_or_create(
                airline=airline,
                origin=orig,
                destination=dest,
                depart_at=dep,
                defaults={
                    "arrival_at": arr,
                    "price": price,
                },
            )

    print("   Seeded 4 Destinations, Attractions, Hotels & Flights.")

    # 4. Seed a Realistic Sample Trip for the Traveler
    jaipur = Destination.objects.filter(name="Jaipur").first()
    if jaipur:
        start_d = date.today() + timedelta(days=10)
        end_d = start_d + timedelta(days=2)
        trip, created = Trip.objects.get_or_create(
            user=traveler_user,
            title="Royal Heritage Jaipur Tour",
            defaults={
                "destination": jaipur,
                "start_date": start_d,
                "end_date": end_d,
                "status": "planned",
                "prompt_text": "3 days in Jaipur exploring palaces, forts and street cuisine",
            },
        )
        if created:
            # Budget
            budget = Budget.objects.create(trip=trip, total_amount=25000, currency="INR")

            # Days & Items
            hawa = Attraction.objects.filter(destination=jaipur, name__icontains="Hawa").first()
            amber = Attraction.objects.filter(destination=jaipur, name__icontains="Amber").first()
            city_palace = Attraction.objects.filter(destination=jaipur, name__icontains="City").first()

            day1 = ItineraryDay.objects.create(
                trip=trip,
                day_number=1,
                summary="Arrival and Palace of Winds",
                date=start_d,
            )
            ItineraryItem.objects.create(
                day=day1,
                attraction=hawa,
                title="Hawa Mahal Walk",
                start_time="10:00:00",
                est_cost=200,
                notes="Morning photography before the crowds arrive",
            )
            ItineraryItem.objects.create(
                day=day1,
                attraction=city_palace,
                title="City Palace Tour",
                start_time="14:00:00",
                est_cost=500,
                notes="Explore the royal courtyards and art gallery",
            )

            day2 = ItineraryDay.objects.create(
                trip=trip,
                day_number=2,
                summary="Historic Hilltop Forts",
                date=start_d + timedelta(days=1),
            )
            ItineraryItem.objects.create(
                day=day2,
                attraction=amber,
                title="Amber Fort Exploration",
                start_time="09:00:00",
                est_cost=500,
                notes="Climb to Sheesh Mahal (Mirror Palace)",
            )

            # Packing items
            for item in ["Passport / ID", "Cotton scarves", "Sunscreen SPF 50", "Walking shoes", "Camera"]:
                PackingItem.objects.create(trip=trip, item_name=item, is_packed=(item == "Passport / ID"))

            # Expenses
            Expense.objects.create(
                trip=trip,
                category="Hotels",
                amount=6400,
                spent_on=date.today(),
                note="Advance hotel booking deposit",
            )
            Expense.objects.create(
                trip=trip,
                category="Activities",
                amount=700,
                spent_on=date.today(),
                note="Museum tickets pass",
            )

            # Booking
            hotel_sample = Hotel.objects.filter(destination=jaipur).first()
            if hotel_sample:
                Booking.objects.create(
                    user=traveler_user,
                    trip=trip,
                    booking_type="hotel",
                    hotel=hotel_sample,
                    amount=6400,
                    status="confirmed",
                )

            print("   Created sample trip: Royal Heritage Jaipur Tour with full relational data.")

    print("[SUCCESS] TravelGenie AI Database successfully seeded!")


if __name__ == "__main__":
    seed()
