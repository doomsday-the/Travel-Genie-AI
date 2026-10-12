import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsAdminOrReadOnly
from .models import Destination, Attraction, WeatherCache
from .serializers import DestinationSerializer, AttractionSerializer


class DestinationViewSet(viewsets.ModelViewSet):
    serializer_class = DestinationSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Destination.objects.all().prefetch_related("attractions")

    @action(detail=True, methods=["get"], permission_classes=[])
    def weather(self, request, pk=None):
        destination = self.get_object()
        lat = float(destination.latitude)
        lng = float(destination.longitude)
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto"
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current_weather", {})
                temp = current.get("temperature", 20.0)
                code = current.get("weathercode", 0)
                # Cache in weather_cache table
                WeatherCache.objects.update_or_create(
                    destination=destination,
                    defaults={
                        "temperature": temp,
                        "weather_code": code,
                        "condition": f"Weather code {code}",
                    },
                )
                return Response({
                    "destination": destination.name,
                    "current": current,
                    "daily": data.get("daily", {}),
                    "source": "Open-Meteo",
                })
        except Exception:
            pass

        # Fallback to cached or default
        cached = WeatherCache.objects.filter(destination=destination).first()
        return Response({
            "destination": destination.name,
            "current": {
                "temperature": float(cached.temperature) if cached else 22.0,
                "weathercode": cached.weather_code if cached else 1,
            },
            "source": "cache/fallback",
        })


class AttractionViewSet(viewsets.ModelViewSet):
    serializer_class = AttractionSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Attraction.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        dest_id = self.request.query_params.get("destination")
        if dest_id:
            qs = qs.filter(destination_id=dest_id)
        return qs
