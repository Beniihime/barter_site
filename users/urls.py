from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import LoginView, LogoutView, MeView, ProfileViewSet, RegisterView, RoleViewSet

router = DefaultRouter()
router.register("profiles", ProfileViewSet, basename="profile")
router.register("roles", RoleViewSet, basename="role")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("users/me/", MeView.as_view(), name="me"),
]

urlpatterns += router.urls
