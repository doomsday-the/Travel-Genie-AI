from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('destinations', views.DestinationViewSet, basename='destination')
router.register('attractions', views.AttractionViewSet, basename='attraction')
urlpatterns = router.urls
