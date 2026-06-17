from rest_framework import permissions


def has_moderator_role(user):
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or user.is_superuser:
        return True
    profile = getattr(user, "profile", None)
    role = getattr(profile, "role", None)
    return bool(role and role.name in {"moderator", "admin"})


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, "user", None)
        return owner == request.user


class IsOwnerOrModerator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "user", None)
        return owner == request.user or has_moderator_role(request.user)


class IsModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_moderator_role(request.user)
