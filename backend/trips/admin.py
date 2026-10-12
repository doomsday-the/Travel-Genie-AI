from django.contrib import admin
from .models import Trip, ItineraryDay, ItineraryItem

admin.site.register(Trip)
admin.site.register(ItineraryDay)
admin.site.register(ItineraryItem)
