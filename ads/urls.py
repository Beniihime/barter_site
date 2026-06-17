from rest_framework.routers import DefaultRouter

from .views import AdViewSet, CategoryViewSet, FavoriteViewSet, ResponseViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("ads", AdViewSet, basename="ad")
router.register("responses", ResponseViewSet, basename="response")
router.register("favorites", FavoriteViewSet, basename="favorite")

urlpatterns = router.urls
