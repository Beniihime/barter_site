from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Profile, Role


class ProfileModelTests(TestCase):
    def test_profile_string_uses_full_name(self):
        user = get_user_model().objects.create_user(username="anna")
        role = Role.objects.create(name=Role.USER)
        profile = Profile.objects.create(user=user, role=role, full_name="Anna Ivanova")

        self.assertEqual(str(profile), "Anna Ivanova")


class AuthApiTests(TestCase):
    def test_register_creates_user_and_profile(self):
        client = APIClient()
        response = client.post(
            reverse("register"),
            {
                "username": "anna",
                "email": "anna@example.com",
                "password": "StrongPass123",
                "full_name": "Anna Ivanova",
                "phone": "+79990000000",
                "city": "Omsk",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Profile.objects.filter(full_name="Anna Ivanova").exists())
