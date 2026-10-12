from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminOrReadOnly
from .models import Flight, Hotel, Booking
from .serializers import FlightSerializer, HotelSerializer, BookingSerializer
from budget.models import Expense


class FlightViewSet(viewsets.ModelViewSet):
    serializer_class = FlightSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Flight.objects.all().select_related("destination")

    def get_queryset(self):
        qs = super().get_queryset()
        dest_id = self.request.query_params.get("destination")
        if dest_id:
            qs = qs.filter(destination_id=dest_id)
        return qs


class HotelViewSet(viewsets.ModelViewSet):
    serializer_class = HotelSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Hotel.objects.all().select_related("destination")

    def get_queryset(self):
        qs = super().get_queryset()
        dest_id = self.request.query_params.get("destination")
        if dest_id:
            qs = qs.filter(destination_id=dest_id)
        return qs


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all().select_related("flight", "hotel", "trip", "user")

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", "user") == "admin":
            return Booking.objects.all().select_related("flight", "hotel", "trip", "user")
        return Booking.objects.filter(user=user).select_related("flight", "hotel", "trip", "user")

    def perform_create(self, serializer):
        with transaction.atomic():
            booking = serializer.save(user=self.request.user)
            # Synchronously create corresponding Expense row inside the atomic transaction
            cat = "Flights" if booking.booking_type == "flight" else "Hotels" if booking.booking_type == "hotel" else "Activities"
            item_desc = (
                booking.flight.airline if booking.flight else
                booking.hotel.name if booking.hotel else
                f"{booking.booking_type.capitalize()} reservation"
            )
            Expense.objects.create(
                trip=booking.trip,
                category=cat,
                amount=booking.amount,
                spent_on=timezone.now().date(),
                note=f"Booking #{booking.id}: {item_desc}",
            )
