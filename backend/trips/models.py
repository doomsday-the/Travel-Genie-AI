from django.conf import settings
from django.db import models


class Trip(models.Model):
    STATUS_CHOICES = [("planned", "Planned"), ("ongoing", "Ongoing"), ("done", "Done")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trips",
        db_column="user_id",
    )
    destination = models.ForeignKey(
        "destinations.Destination",
        on_delete=models.PROTECT,
        related_name="trips",
        db_column="destination_id",
    )
    title = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="planned")
    prompt_text = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "trips"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["start_date"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gte=models.F("start_date")),
                name="check_trip_end_date_gte_start_date",
            ),
        ]

    def __str__(self):
        return f"{self.title} ({self.status})"


class ItineraryDay(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="days",
        db_column="trip_id",
    )
    day_number = models.PositiveIntegerField()
    summary = models.CharField(max_length=255, blank=True, default="")
    date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "itinerary_days"
        unique_together = ("trip", "day_number")
        ordering = ["day_number"]

    def __str__(self):
        return f"Day {self.day_number} - {self.trip.title}"


class ItineraryItem(models.Model):
    day = models.ForeignKey(
        ItineraryDay,
        on_delete=models.CASCADE,
        related_name="items",
        db_column="day_id",
    )
    attraction = models.ForeignKey(
        "destinations.Attraction",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="itinerary_items",
        db_column="attraction_id",
    )
    title = models.CharField(max_length=150)
    start_time = models.TimeField(null=True, blank=True)
    est_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "itinerary_items"
        ordering = ["start_time", "id"]

    def __str__(self):
        return f"{self.title} (Day {self.day.day_number})"


class PackingItem(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="packing_items",
        db_column="trip_id",
    )
    item_name = models.CharField(max_length=150)
    is_packed = models.BooleanField(default=False)

    class Meta:
        db_table = "packing_items"

    def __str__(self):
        return f"{self.item_name} ({'Packed' if self.is_packed else 'Pending'})"
