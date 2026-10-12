from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("destinations.urls")),
    path("api/", include("trips.urls")),
    path("api/", include("bookings.urls")),
    path("api/", include("budget.urls")),
    path("api/ai/", include("ai_planner.urls")),
]
