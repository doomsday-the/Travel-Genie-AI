from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('flights', views.FlightViewSet, basename='flight')
router.register('hotels', views.HotelViewSet, basename='hotel')
router.register('bookings', views.BookingViewSet, basename='booking')
urlpatterns = router.urls
