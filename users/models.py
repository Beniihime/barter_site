from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class Role(models.Model):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"

    name = models.CharField(max_length=40, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "role"
        verbose_name_plural = "roles"

    def __str__(self):
        return self.name


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r"^\+?[\d\s\-()]{7,20}$",
                message="Enter a valid phone number.",
            )
        ],
    )
    city = models.CharField(max_length=80, blank=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="profiles",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name", "user__username"]
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.full_name or self.user.get_username()
