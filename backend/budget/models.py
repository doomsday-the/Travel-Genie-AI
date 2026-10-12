from django.db import models


class Budget(models.Model):
    trip = models.OneToOneField(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="budget",
        db_column="trip_id",
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=5, default="INR")

    class Meta:
        db_table = "budgets"
        constraints = [
            models.CheckConstraint(
                check=models.Q(total_amount__gte=0),
                name="check_budget_total_amount_non_negative",
            ),
        ]

    def __str__(self):
        return f"Budget for {self.trip.title}: {self.currency} {self.total_amount}"


class Expense(models.Model):
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="expenses",
        db_column="trip_id",
    )
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    spent_on = models.DateField()
    note = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        db_table = "expenses"
        indexes = [
            models.Index(fields=["trip", "category"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(amount__gte=0),
                name="check_expense_amount_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.category}: {self.amount} ({self.trip.title})"
