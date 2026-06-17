from django.contrib import admin

from .models import Profile, Role


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name", "description")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "phone", "city", "role", "created_at")
    list_filter = ("role", "city")
    search_fields = ("user__username", "user__email", "full_name", "phone", "city")
    readonly_fields = ("created_at", "updated_at")
