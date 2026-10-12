from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.role_name


class User(AbstractUser):
    ROLE_CHOICES = [("admin", "Admin"), ("user", "User")]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    role_ref = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        db_column="role_id",
    )

    class Meta:
        db_table = "users"

    def save(self, *args, **kwargs):
        # Synchronize role and role_ref
        if self.role and not self.role_ref:
            role_obj, _ = Role.objects.get_or_create(role_name=self.role)
            self.role_ref = role_obj
        elif self.role_ref and not self.role:
            self.role = self.role_ref.role_name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"
