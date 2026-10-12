from rest_framework import serializers
from .models import Trip, ItineraryDay, ItineraryItem, PackingItem
from destinations.serializers import DestinationSerializer, AttractionSerializer


class PackingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingItem
        fields = ["id", "trip", "item_name", "is_packed"]


class ItineraryItemSerializer(serializers.ModelSerializer):
    attraction_detail = AttractionSerializer(source="attraction", read_only=True)

    class Meta:
        model = ItineraryItem
        fields = ["id", "day", "attraction", "attraction_detail", "title", "start_time", "est_cost", "notes"]


class ItineraryDaySerializer(serializers.ModelSerializer):
    items = ItineraryItemSerializer(many=True, read_only=True)

    class Meta:
        model = ItineraryDay
        fields = ["id", "trip", "day_number", "summary", "date", "items"]


class TripSerializer(serializers.ModelSerializer):
    destination_detail = DestinationSerializer(source="destination", read_only=True)
    days = ItineraryDaySerializer(many=True, read_only=True)
    packing_items = PackingItemSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "user",
            "destination",
            "destination_detail",
            "title",
            "start_date",
            "end_date",
            "status",
            "prompt_text",
            "created_at",
            "days",
            "packing_items",
        ]
        read_only_fields = ["user", "created_at"]
