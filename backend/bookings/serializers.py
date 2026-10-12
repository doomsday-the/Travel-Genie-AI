from rest_framework import serializers
from .models import Flight, Hotel, Booking
from destinations.serializers import DestinationSerializer


class FlightSerializer(serializers.ModelSerializer):
    destination_detail = DestinationSerializer(source="destination", read_only=True)

    class Meta:
        model = Flight
        fields = [
            "id",
            "airline",
            "origin",
            "destination",
            "destination_detail",
            "depart_at",
            "arrival_at",
            "price",
        ]


class HotelSerializer(serializers.ModelSerializer):
    destination_detail = DestinationSerializer(source="destination", read_only=True)

    class Meta:
        model = Hotel
        fields = [
            "id",
            "name",
            "destination",
            "destination_detail",
            "price_per_night",
            "rating",
        ]


class BookingSerializer(serializers.ModelSerializer):
    flight_detail = FlightSerializer(source="flight", read_only=True)
    hotel_detail = HotelSerializer(source="hotel", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "trip",
            "booking_type",
            "flight",
            "flight_detail",
            "hotel",
            "hotel_detail",
            "amount",
            "status",
            "booked_at",
        ]
        read_only_fields = ["user", "booked_at"]
