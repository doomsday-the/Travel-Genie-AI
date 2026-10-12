from django.db import connection
from django.db.models import Sum, Avg, Count
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdminRole
from bookings.models import Hotel
from trips.models import Trip
from .models import Budget, Expense
from .serializers import BudgetSerializer, ExpenseSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    queryset = Budget.objects.all()

    def get_queryset(self):
        return Budget.objects.filter(trip__user=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all().select_related("trip")

    def get_queryset(self):
        user = self.request.user
        qs = Expense.objects.filter(trip__user=user)
        trip_id = self.request.query_params.get("trip")
        if trip_id:
            qs = qs.filter(trip_id=trip_id)
        return qs


class SpendByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        rows = (
            Expense.objects.filter(trip_id=trip_id, trip__user=request.user)
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )
        return Response(list(rows))


class TripCostSummaryView(APIView):
    """Retrieves cost summary from the SQL View v_trip_spend with ORM fallback."""
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        # Attempt to read from SQL view
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT trip_id, title, budget, spent, remaining FROM v_trip_spend WHERE trip_id = %s",
                    [trip_id],
                )
                row = cursor.fetchone()
                if row:
                    return Response({
                        "trip_id": row[0],
                        "title": row[1],
                        "budget": float(row[2]),
                        "spent": float(row[3]),
                        "remaining": float(row[4]),
                        "source": "sql_view",
                    })
        except Exception:
            pass

        # Robust ORM fallback
        trip = Trip.objects.filter(id=trip_id, user=request.user).first()
        if not trip:
            return Response({"detail": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)
        budget_obj = getattr(trip, "budget", None)
        budget_total = float(budget_obj.total_amount) if budget_obj else 0.0
        spent = float(Expense.objects.filter(trip=trip).aggregate(s=Sum("amount"))["s"] or 0.0)
        return Response({
            "trip_id": trip.id,
            "title": trip.title,
            "budget": budget_total,
            "spent": spent,
            "remaining": budget_total - spent,
            "source": "orm_computed",
        })


class StoredProcBudgetReportView(APIView):
    """Executes stored procedure sp_trip_budget_summary with ORM fallback."""
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        try:
            with connection.cursor() as cursor:
                cursor.callproc("sp_trip_budget_summary", [trip_id])
                results = cursor.fetchall()
                if results:
                    data = [{"category": r[0], "total": float(r[1]), "entries": r[2]} for r in results]
                    return Response({"report": data, "source": "stored_procedure"})
        except Exception:
            pass

        # Fallback
        rows = (
            Expense.objects.filter(trip_id=trip_id, trip__user=request.user)
            .values("category")
            .annotate(total=Sum("amount"), entries=Count("id"))
            .order_by("-total")
        )
        return Response({"report": list(rows), "source": "orm_fallback"})


class AdminAnalyticsView(APIView):
    """
    Advanced aggregates required by spec:
    1. Spend per category
    2. Average hotel price per city
    3. Trips per user
    """
    permission_classes = [IsAdminRole]

    def get(self, request):
        # 1. Spend per category
        spend_by_cat = (
            Expense.objects.values("category")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )

        # 2. Average hotel price per city
        hotel_prices = (
            Hotel.objects.values("destination__name", "destination__country")
            .annotate(avg_price=Avg("price_per_night"), count=Count("id"))
            .order_by("-avg_price")
        )

        # 3. Trips per user
        trips_per_user = (
            Trip.objects.values("user__username", "user__email")
            .annotate(trip_count=Count("id"))
            .order_by("-trip_count")
        )

        total_users = Trip.objects.values("user").distinct().count()
        total_trips = Trip.objects.count()
        total_spent = Expense.objects.aggregate(s=Sum("amount"))["s"] or 0.0

        return Response({
            "metrics": {
                "total_trips": total_trips,
                "active_travelers": total_users,
                "total_expenses_logged": float(total_spent),
            },
            "spend_by_category": list(spend_by_cat),
            "hotel_price_by_city": list(hotel_prices),
            "trips_per_user": list(trips_per_user),
        })
