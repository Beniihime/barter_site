from rest_framework.routers import DefaultRouter

from .views import ComplaintViewSet, ModerationViewSet

router = DefaultRouter()
router.register("complaints", ComplaintViewSet, basename="complaint")
router.register("moderation", ModerationViewSet, basename="moderation")

urlpatterns = router.urls
