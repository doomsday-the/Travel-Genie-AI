from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Trip, ItineraryDay, ItineraryItem, PackingItem
from .serializers import (
    TripSerializer,
    ItineraryDaySerializer,
    ItineraryItemSerializer,
    PackingItemSerializer,
)


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    queryset = Trip.objects.all().select_related("destination", "user").prefetch_related("days__items__attraction", "packing_items")

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", "user") == "admin":
            return Trip.objects.all().select_related("destination", "user").prefetch_related("days__items__attraction", "packing_items")
        return Trip.objects.filter(user=user).select_related("destination", "user").prefetch_related("days__items__attraction", "packing_items")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ItineraryDayViewSet(viewsets.ModelViewSet):
    serializer_class = ItineraryDaySerializer
    permission_classes = [IsAuthenticated]
    queryset = ItineraryDay.objects.all()

    def get_queryset(self):
        return ItineraryDay.objects.filter(trip__user=self.request.user)


class ItineraryItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItineraryItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = ItineraryItem.objects.all()

    def get_queryset(self):
        return ItineraryItem.objects.filter(day__trip__user=self.request.user)


class PackingItemViewSet(viewsets.ModelViewSet):
    serializer_class = PackingItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = PackingItem.objects.all()

    def get_queryset(self):
        return PackingItem.objects.filter(trip__user=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        item = self.get_object()
        item.is_packed = not item.is_packed
        item.save()
        return Response(PackingItemSerializer(item).data)
