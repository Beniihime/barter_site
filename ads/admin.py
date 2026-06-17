from django.contrib import admin

from .models import Ad, AdImage, Category, Response


class AdImageInline(admin.TabularInline):
    model = AdImage
    extra = 1
    readonly_fields = ("uploaded_at",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name", "description")


@admin.register(Ad)
class AdAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "category",
        "ad_type",
        "item_condition",
        "city",
        "status",
        "created_at",
    )
    list_filter = ("status", "ad_type", "item_condition", "category", "city")
    search_fields = ("title", "description", "exchange_request", "user__username")
    readonly_fields = ("created_at", "updated_at")
    inlines = [AdImageInline]


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ("ad", "user", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("ad__title", "user__username", "text")
    readonly_fields = ("created_at",)
