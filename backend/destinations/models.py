from django.db import models


class Destination(models.Model):
    name = models.CharField(max_length=120)  # city / destination name
    country = models.CharField(max_length=80)
    currency_code = models.CharField(max_length=10, default="USD")
    visa_info = models.CharField(max_length=255, blank=True, default="Visa free / on arrival")
    best_season = models.CharField(max_length=80, blank=True, default="Spring / Autumn")
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "destinations"
        indexes = [
            models.Index(fields=["name", "country"]),
        ]

    def __str__(self):
        return f"{self.name}, {self.country}"


class Attraction(models.Model):
    destination = models.ForeignKey(
        Destination,
        on_delete=models.CASCADE,
        related_name="attractions",
        db_column="destination_id",
    )
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=50, blank=True)
    avg_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "attractions"
        indexes = [
            models.Index(fields=["destination"]),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(avg_cost__gte=0), name="check_attraction_cost_non_negative"),
        ]

    def __str__(self):
        return f"{self.name} ({self.destination.name})"


class WeatherCache(models.Model):
    destination = models.ForeignKey(
        Destination,
        on_delete=models.CASCADE,
        related_name="weather_cache",
        db_column="destination_id",
    )
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    weather_code = models.IntegerField(default=0)
    condition = models.CharField(max_length=80, blank=True)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "weather_cache"

    def __str__(self):
        return f"{self.destination.name} - {self.temperature}°C"
