from django.conf import settings
from django.db import models


class Flight(models.Model):
    airline = models.CharField(max_length=80)
    origin = models.CharField(max_length=80)
    destination = models.ForeignKey(
        "destinations.Destination",
        on_delete=models.CASCADE,
        related_name="flights",
        db_column="destination_id",
    )
    depart_at = models.DateTimeField()
    arrival_at = models.DateTimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "flights"
        indexes = [
            models.Index(fields=["destination", "depart_at"]),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(price__gte=0), name="check_flight_price_non_negative"),
        ]

    def __str__(self):
        return f"{self.airline} ({self.origin} -> {self.destination.name}) - ₹{self.price}"


class Hotel(models.Model):
    name = models.CharField(max_length=120)
    destination = models.ForeignKey(
        "destinations.Destination",
        on_delete=models.CASCADE,
        related_name="hotels",
        db_column="destination_id",
    )
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.0)

    class Meta:
        db_table = "hotels"
        constraints = [
            models.CheckConstraint(check=models.Q(price_per_night__gte=0), name="check_hotel_price_non_negative"),
        ]

    def __str__(self):
        return f"{self.name} in {self.destination.name} (★{self.rating})"


class Booking(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("confirmed", "Confirmed"), ("cancelled", "Cancelled")]
    TYPE_CHOICES = [("flight", "Flight"), ("hotel", "Hotel"), ("activity", "Activity")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        db_column="user_id",
    )
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="bookings",
        db_column="trip_id",
    )
    booking_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="flight")
    flight = models.ForeignKey(
        Flight,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="bookings",
        db_column="flight_id",
    )
    hotel = models.ForeignKey(
        Hotel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="bookings",
        db_column="hotel_id",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="confirmed")
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bookings"
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gte=0), name="check_booking_amount_non_negative"),
        ]

    def __str__(self):
        return f"{self.booking_type.capitalize()} booking for {self.trip.title} - ₹{self.amount}"
