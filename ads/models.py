from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MinLengthValidator
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "category"
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Ad(models.Model):
    class AdType(models.TextChoices):
        EXCHANGE = "exchange", "Exchange"
        FREE = "free", "Free transfer"

    class ItemCondition(models.TextChoices):
        NEW = "new", "New"
        LIKE_NEW = "like_new", "Like new"
        USED = "used", "Used"
        NEEDS_REPAIR = "needs_repair", "Needs repair"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        MODERATION = "moderation", "On moderation"
        ACTIVE = "active", "Active"
        REJECTED = "rejected", "Rejected"
        HIDDEN = "hidden", "Hidden"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ads",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="ads",
    )
    title = models.CharField(max_length=120, validators=[MinLengthValidator(5)])
    description = models.TextField(validators=[MinLengthValidator(20)])
    ad_type = models.CharField(
        max_length=20,
        choices=AdType.choices,
        default=AdType.EXCHANGE,
    )
    item_condition = models.CharField(
        max_length=20,
        choices=ItemCondition.choices,
        default=ItemCondition.USED,
    )
    exchange_request = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=80)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.MODERATION,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["city", "status"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        if self.ad_type == self.AdType.EXCHANGE and not self.exchange_request.strip():
            raise ValidationError(
                {"exchange_request": "Exchange request is required for exchange ads."}
            )


class AdImage(models.Model):
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(
        upload_to="ads/",
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]

    def __str__(self):
        return f"Image for {self.ad}"


class Response(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CLOSED = "closed", "Closed"

    ad = models.ForeignKey(Ad, on_delete=models.CASCADE, related_name="responses")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="responses",
    )
    text = models.TextField(validators=[MinLengthValidator(5)])
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["ad", "user"],
                name="unique_response_per_user_ad",
            )
        ]
        indexes = [
            models.Index(fields=["ad", "status"]),
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"Response by {self.user} to {self.ad}"

    def clean(self):
        if self.ad_id and self.user_id and self.ad.user_id == self.user_id:
            raise ValidationError({"user": "You cannot respond to your own ad."})


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    ad = models.ForeignKey(
        Ad,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "ad"],
                name="unique_favorite_per_user_ad",
            )
        ]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["ad"]),
        ]

    def __str__(self):
        return f"{self.user} favorited {self.ad}"
