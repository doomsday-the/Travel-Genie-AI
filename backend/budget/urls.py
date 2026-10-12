from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('budgets', views.BudgetViewSet, basename='budget')
router.register('expenses', views.ExpenseViewSet, basename='expense')

urlpatterns = router.urls + [
    path('trips/<int:trip_id>/spend-by-category/', views.SpendByCategoryView.as_view(), name='spend-by-category'),
    path('trips/<int:trip_id>/cost-summary/', views.TripCostSummaryView.as_view(), name='trip-cost-summary'),
    path('trips/<int:trip_id>/report/', views.StoredProcBudgetReportView.as_view(), name='stored-proc-report'),
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
]
