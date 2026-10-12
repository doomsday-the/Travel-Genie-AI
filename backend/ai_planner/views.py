from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from destinations.models import Destination, Attraction
from trips.models import Trip, ItineraryDay, ItineraryItem, PackingItem
from trips.serializers import TripSerializer
from budget.models import Budget
from .services import PlannerError, generate_itinerary


class PlanTripView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        d = request.data
        dest_name = d.get("destination", "").strip()
        if not dest_name:
            return Response({"detail": "Destination is required."}, status=status.HTTP_400_BAD_REQUEST)

        days_count = int(d.get("days", 3))
        if days_count < 1 or days_count > 30:
            days_count = 3
        budget_tier = d.get("budget", "moderate")
        interests = d.get("interests", [])
        user_prompt = d.get("prompt", "")

        # 1. Generate & validate itinerary JSON
        try:
            plan = generate_itinerary(dest_name, days_count, budget_tier, interests, user_prompt)
        except PlannerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        # 2. Save directly into normalized 3NF relational tables inside an atomic transaction
        with transaction.atomic():
            # Match existing destination or create new
            destination = Destination.objects.filter(name__iexact=dest_name).first()
            if not destination:
                destination = Destination.objects.create(
                    name=dest_name,
                    country=d.get("country", "Global Destination"),
                    latitude=26.9124,
                    longitude=75.7873,
                    currency_code="INR",
                    visa_info="Check local visa guidelines before departure",
                    best_season="October to March",
                )

            start_date_str = d.get("start_date")
            if start_date_str:
                try:
                    start_date = timezone.datetime.strptime(start_date_str, "%Y-%m-%d").date()
                except ValueError:
                    start_date = timezone.now().date()
            else:
                start_date = timezone.now().date() + timedelta(days=14)

            end_date = start_date + timedelta(days=days_count - 1)

            trip = Trip.objects.create(
                user=request.user,
                destination=destination,
                title=plan.get("title", f"{dest_name} Adventure"),
                start_date=start_date,
                end_date=end_date,
                status="planned",
                prompt_text=user_prompt or f"{days_count} days in {dest_name}",
            )

            # Create Budget
            est_budget = plan.get("estimated_budget", 50000)
            Budget.objects.create(
                trip=trip,
                total_amount=est_budget,
                currency=plan.get("currency", "INR"),
            )

            # Create normalized ItineraryDays & ItineraryItems
            for d_data in plan.get("days", []):
                day_num = d_data.get("day_number", 1)
                day_date = start_date + timedelta(days=day_num - 1)
                day_obj = ItineraryDay.objects.create(
                    trip=trip,
                    day_number=day_num,
                    summary=d_data.get("summary", f"Day {day_num} in {dest_name}"),
                    date=day_date,
                )

                for item in d_data.get("items", []):
                    time_val = item.get("time") or "10:00"
                    if len(time_val) == 5:
                        time_val += ":00"
                    elif len(time_val) > 8:
                        time_val = "10:00:00"

                    # Optional match with existing attraction
                    matched_attraction = Attraction.objects.filter(
                        destination=destination,
                        name__icontains=item.get("title", "")[:10]
                    ).first()

                    ItineraryItem.objects.create(
                        day=day_obj,
                        attraction=matched_attraction,
                        title=item.get("title", "Activity"),
                        start_time=time_val,
                        est_cost=item.get("est_cost", 0),
                        notes=item.get("notes", ""),
                    )

            # Create normalized PackingItems
            packing_items = plan.get("packing_list", [
                "Passport & travel documents",
                "Universal travel charger",
                "Comfortable walking shoes",
                "Light jacket & personal toiletries",
            ])
            for p_name in packing_items:
                PackingItem.objects.create(
                    trip=trip,
                    item_name=p_name,
                    is_packed=False,
                )

        # 3. Return the fully saved normalized trip data
        serialized = TripSerializer(trip).data
        return Response(serialized, status=status.HTTP_201_CREATED)
