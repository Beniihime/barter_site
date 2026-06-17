from rest_framework.routers import DefaultRouter

from .views import AdViewSet, CategoryViewSet, ResponseViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("ads", AdViewSet, basename="ad")
router.register("responses", ResponseViewSet, basename="response")

urlpatterns = router.urls
