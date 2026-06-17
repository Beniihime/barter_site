from django.contrib import admin

from .models import AdModeration, Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ("ad", "user", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("ad__title", "user__username", "reason", "moderator_comment")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AdModeration)
class AdModerationAdmin(admin.ModelAdmin):
    list_display = ("ad", "moderator", "decision", "checked_at")
    list_filter = ("decision", "checked_at")
    search_fields = ("ad__title", "moderator__username", "comment")
    readonly_fields = ("checked_at",)
