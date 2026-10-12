from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('trips', views.TripViewSet, basename='trip')
router.register('itinerary-days', views.ItineraryDayViewSet, basename='itinerary-day')
router.register('itinerary-items', views.ItineraryItemViewSet, basename='itinerary-item')
router.register('packing-items', views.PackingItemViewSet, basename='packing-item')
urlpatterns = router.urls
